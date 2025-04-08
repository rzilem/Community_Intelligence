
import { extractEmailFromHeader, extractNameFromHeader, isValidEmail } from "../utils/email-helpers.ts";

// Process email and extract information
export async function processEmail(emailData: any): Promise<{
  name: string;
  email: string;
  company?: string;
  phone?: string;
  notes?: string;
  html_content?: string;
  association_name?: string;
  association_type?: string;
  current_management?: string;
  number_of_units?: number;
  first_name?: string;
  last_name?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip?: string;
  additional_requirements?: string;
}> {
  console.log("Processing email data:", JSON.stringify(emailData, null, 2));

  let name = "";
  let email = "";
  let company = "";
  let phone = "";
  let notes = "";
  let textContent = "";
  let htmlContent = "";
  let associationName = "";
  let associationType = "";
  let currentManagement = "";
  let numberOfUnits: number | undefined = undefined;
  let firstName = "";
  let lastName = "";
  let streetAddress = "";
  let city = "";
  let state = "";
  let zip = "";
  let additionalRequirements = "";

  try {
    // Try to extract email from various possible locations in the payload
    if (emailData.envelope?.from) {
      email = emailData.envelope.from;
    } else if (emailData.envelope?.sender) {
      email = emailData.envelope.sender;
    } else if (emailData.headers?.from) {
      email = extractEmailFromHeader(emailData.headers.from);
    } else if (emailData.from) {
      email = extractEmailFromHeader(emailData.from);
    } else if (emailData.sender) {
      email = emailData.sender;
    } else if (emailData.reply_to) {
      email = emailData.reply_to;
    }

    console.log("Extracted email address:", email);
    
    // Validate the email address
    if (!isValidEmail(email)) {
      console.warn(`Warning: Invalid or missing email address. Using fallback. Found: '${email}'`);
      email = "unknown@example.com"; // Fallback email
    }

    // Extract name from various possible fields
    if (emailData.headers?.from) {
      name = extractNameFromHeader(emailData.headers.from);
    } else if (emailData.from) {
      name = extractNameFromHeader(emailData.from);
    } else {
      // Try to guess a name from the email
      const namePart = email.split('@')[0];
      name = namePart.replace(/[.+]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
    }

    // Split name into first name and last name
    const nameParts = name.trim().split(' ');
    if (nameParts.length >= 2) {
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ');
    } else if (nameParts.length === 1) {
      firstName = nameParts[0];
    }

    // Handle multipart content
    if (emailData.content && Array.isArray(emailData.content)) {
      for (const part of emailData.content) {
        if (part.type === "text/plain") {
          textContent = part.value || "";
        } else if (part.type === "text/html") {
          htmlContent = part.value || "";
        }
      }
    }

    // Extract notes from subject and body
    notes = "";
    if (emailData.subject) {
      notes = `Subject: ${emailData.subject}\n\n`;
    }

    // Use the text content if available, otherwise fallback to the text property
    if (textContent) {
      notes += textContent;
    } else if (emailData.text) {
      notes += emailData.text;
    } else if (htmlContent) {
      // If no plain text, use the HTML content but note that it's HTML
      notes += "(HTML content) " + htmlContent.replace(/<[^>]*>/g, ' ');
    } else if (emailData.html) {
      // Fallback to the html property
      notes += "(HTML content) " + emailData.html.replace(/<[^>]*>/g, ' ');
    }

    // Store the original HTML for viewing later
    const originalHtml = htmlContent || emailData.html || "";

    // Try to extract phone from the email body using regex
    const phoneRegex = /(\+?1[-\s.]?)?\(?([0-9]{3})\)?[-\s.]?([0-9]{3})[-\s.]?([0-9]{4})/;
    const phoneMatch = notes.match(phoneRegex);
    if (phoneMatch) {
      phone = phoneMatch[0];
    }

    // Extract structured data
    const extractedData = extractStructuredData(notes);
    associationName = extractedData.associationName;
    associationType = extractedData.associationType;
    currentManagement = extractedData.currentManagement;
    numberOfUnits = extractedData.numberOfUnits;
    streetAddress = extractedData.streetAddress;
    city = extractedData.city;
    state = extractedData.state;
    zip = extractedData.zip;
    additionalRequirements = extractedData.additionalRequirements;
    
    // Try to extract company name
    company = extractCompanyName(notes);

    // If company is empty but we found an association name, use that
    if (!company && associationName) {
      company = associationName;
    }
  } catch (error) {
    console.error("Error processing email:", error);
  }

  // If name is still empty, use the first part of the email address
  if (!name) {
    name = email.split('@')[0].replace(/[.+]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  }

  return {
    name,
    email,
    company,
    phone,
    notes: notes.substring(0, 1000), // Limit notes to 1000 characters
    html_content: htmlContent || emailData.html || "", // Store original HTML
    association_name: associationName,
    association_type: associationType,
    current_management: currentManagement,
    number_of_units: numberOfUnits,
    first_name: firstName,
    last_name: lastName,
    street_address: streetAddress,
    city,
    state,
    zip,
    additional_requirements: additionalRequirements
  };
}

function extractStructuredData(notes: string) {
  let associationName = "";
  let associationType = "";
  let currentManagement = "";
  let numberOfUnits: number | undefined = undefined;
  let streetAddress = "";
  let city = "";
  let state = "";
  let zip = "";
  let additionalRequirements = "";

  // Association Name
  const associationNameMatch = notes.match(/Association|Name of Association\s*[.:]\s*([^\n]+)/i);
  if (associationNameMatch && associationNameMatch[1]) {
    associationName = associationNameMatch[1].trim();
  }
  
  // Association Type
  const associationTypeMatch = notes.match(/Association Type|Type\s*[.:]\s*([^\n]+)/i);
  if (associationTypeMatch && associationTypeMatch[1]) {
    associationType = associationTypeMatch[1].trim();
  } else if (notes.match(/HOA/i)) {
    associationType = "HOA";
  } else if (notes.match(/Condo/i)) {
    associationType = "Condominium";
  }
  
  // Current Management
  const managementMatch = notes.match(/Current Management|We are currently\s*[.:]\s*([^\n]+)/i);
  if (managementMatch && managementMatch[1]) {
    currentManagement = managementMatch[1].trim();
  }
  
  // Number of Units
  const unitsMatch = notes.match(/Number of (Homes|Units)\s*[.:]\s*(\d[\d,]*)/i);
  if (unitsMatch && unitsMatch[2]) {
    numberOfUnits = parseInt(unitsMatch[2].replace(/,/g, ''), 10);
  }
  
  // Address components
  const addressMatch = notes.match(/Property Address\s*[.:]\s*([^\n]+)/i);
  if (addressMatch && addressMatch[1]) {
    const addressLines = addressMatch[1].trim().split('\n');
    if (addressLines.length >= 1) {
      streetAddress = addressLines[0].trim();
    }
    
    // Try to extract city, state, zip
    const cityStateZipMatch = notes.match(/([A-Za-z\s]+),?\s*([A-Z]{2})\s*(\d{5}(-\d{4})?)/i);
    if (cityStateZipMatch) {
      city = cityStateZipMatch[1].trim();
      state = cityStateZipMatch[2].toUpperCase();
      zip = cityStateZipMatch[3];
    }
  }
  
  // Additional Requirements
  const requirementsMatch = notes.match(/Additional Information|Additional Requirements\s*[.:]\s*([^\n]+)/i);
  if (requirementsMatch && requirementsMatch[1]) {
    additionalRequirements = requirementsMatch[1].trim();
  }

  return {
    associationName,
    associationType,
    currentManagement,
    numberOfUnits,
    streetAddress,
    city,
    state,
    zip,
    additionalRequirements
  };
}

function extractCompanyName(notes: string): string {
  let company = "";
  // Try to extract company name if we can find a signature block
  const signatureMarkers = ["--", "Best regards", "Regards", "Sincerely", "Thank you"];
  let signatureIndex = -1;
  
  for (const marker of signatureMarkers) {
    const idx = notes.indexOf(marker);
    if (idx !== -1 && (signatureIndex === -1 || idx < signatureIndex)) {
      signatureIndex = idx;
    }
  }
  
  if (signatureIndex !== -1) {
    const signature = notes.substring(signatureIndex);
    const companyMatches = signature.match(/([A-Z][a-zA-Z\s]+)\s+(LLC|Inc|Ltd|Corp|Corporation|Company|Co)/);
    if (companyMatches) {
      company = companyMatches[0];
    }
  }
  
  return company;
}
