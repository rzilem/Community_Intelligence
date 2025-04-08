
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
    // IMPROVED EMAIL EXTRACTION
    // Try multiple potential locations for email address
    const possibleEmailSources = [
      emailData.envelope?.from,
      emailData.envelope?.sender,
      emailData.headers?.from && extractEmailFromHeader(emailData.headers.from),
      emailData.from && extractEmailFromHeader(emailData.from),
      emailData.sender,
      emailData.reply_to,
      emailData.recipient,
      emailData.to && extractEmailFromHeader(emailData.to),
      emailData.email,
      // Check for possibly different field names
      emailData.mail?.from && extractEmailFromHeader(emailData.mail.from),
      emailData.mail?.sender
    ].filter(Boolean);
    
    // Find the first valid email
    for (const possibleEmail of possibleEmailSources) {
      if (possibleEmail && isValidEmail(possibleEmail)) {
        email = possibleEmail;
        console.log("Found valid email:", email);
        break;
      }
    }
    
    // If no valid email is found, try to extract from the full payload
    if (!email || !isValidEmail(email)) {
      const emailDataStr = JSON.stringify(emailData);
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const matches = emailDataStr.match(emailRegex);
      if (matches && matches.length > 0) {
        email = matches[0];
        console.log("Extracted email from full payload:", email);
      } else {
        console.warn("No valid email found in any location. Using fallback.");
        email = "unknown@example.com"; // Fallback email
      }
    }

    // IMPROVED NAME EXTRACTION
    // Try multiple potential locations for name
    const possibleNameSources = [
      emailData.headers?.from && extractNameFromHeader(emailData.headers.from),
      emailData.from && extractNameFromHeader(emailData.from),
      emailData.sender_name,
      emailData.name,
      emailData.mail?.sender_name,
      // Possibly also check for first_name and last_name fields
      (emailData.first_name || emailData.firstName) && 
      (emailData.last_name || emailData.lastName) && 
      `${emailData.first_name || emailData.firstName} ${emailData.last_name || emailData.lastName}`
    ].filter(Boolean);
    
    // Find the first valid name
    for (const possibleName of possibleNameSources) {
      if (possibleName && possibleName.trim() !== '') {
        name = possibleName.trim();
        console.log("Found valid name:", name);
        break;
      }
    }
    
    // If still no name, try to generate one from the email
    if (!name) {
      const namePart = email.split('@')[0];
      name = namePart.replace(/[.+]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
      console.log("Generated name from email:", name);
    }

    // Split name into first name and last name
    const nameParts = name.trim().split(' ');
    if (nameParts.length >= 2) {
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ');
    } else if (nameParts.length === 1) {
      firstName = nameParts[0];
      lastName = "";
    }

    // IMPROVED CONTENT EXTRACTION
    // Handle different content formats
    if (emailData.text) {
      textContent = emailData.text;
    } else if (emailData.body) {
      textContent = emailData.body;
    } else if (emailData.content && Array.isArray(emailData.content)) {
      // Handle multipart content
      for (const part of emailData.content) {
        if (part.type === "text/plain" || part.contentType === "text/plain") {
          textContent = part.value || part.body || "";
        } else if (part.type === "text/html" || part.contentType === "text/html") {
          htmlContent = part.value || part.body || "";
        }
      }
    } else if (emailData.mail?.body) {
      // Some email services use a different structure
      textContent = emailData.mail.body;
    } else if (emailData.html_body) {
      htmlContent = emailData.html_body;
      // Extract text from HTML
      textContent = htmlContent.replace(/<[^>]*>/g, ' ');
    }
    
    // If we have HTML content but no text content, extract text from HTML
    if (!textContent && htmlContent) {
      textContent = htmlContent.replace(/<[^>]*>/g, ' ');
    }
    
    // Prioritize the HTML version for storage
    if (!htmlContent && emailData.html) {
      htmlContent = emailData.html;
    }

    // Extract notes from subject and body
    notes = "";
    if (emailData.subject) {
      notes = `Subject: ${emailData.subject}\n\n`;
    } else if (emailData.headers?.subject) {
      notes = `Subject: ${emailData.headers.subject}\n\n`;
    }
    
    // Add the text content to notes
    if (textContent) {
      notes += textContent;
    }

    // Try to extract phone from the email body using regex
    const phoneRegex = /(\+?1[-\s.]?)?\(?([0-9]{3})\)?[-\s.]?([0-9]{3})[-\s.]?([0-9]{4})/;
    const phoneMatch = notes.match(phoneRegex);
    if (phoneMatch) {
      phone = phoneMatch[0];
    } else if (emailData.phone) {
      // Some email services might directly include phone
      phone = emailData.phone;
    }

    // Extract structured data from notes
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

    // Extract company name from various sources
    if (emailData.company) {
      company = emailData.company;
    } else {
      company = extractCompanyName(notes);

      // If company is empty but we found an association name, use that
      if (!company && associationName) {
        company = associationName;
      } else if (!company) {
        // Try to extract from email domain
        const domain = email.split('@')[1];
        if (domain && domain !== "example.com" && domain !== "gmail.com" && 
            domain !== "yahoo.com" && domain !== "hotmail.com" && 
            domain !== "outlook.com") {
          company = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
        }
      }
    }
    
    // Final validation and fallbacks
    if (!name || name === "Unknown" || name === "unknown") {
      name = firstName || email.split('@')[0].replace(/[.+]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Unknown";
    }
    
    console.log("Successfully extracted lead information:", {
      name, email, company, phone, 
      association_name: associationName,
      association_type: associationType
    });
    
  } catch (error) {
    console.error("Error processing email:", error);
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

// Enhanced structured data extraction
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

  // Association Name - try multiple possible formats
  const associationNamePatterns = [
    /Association\s*[.:]\s*([^\n]+)/i,
    /Name of Association\s*[.:]\s*([^\n]+)/i,
    /Association Name\s*[.:]\s*([^\n]+)/i,
    /HOA Name\s*[.:]\s*([^\n]+)/i,
    /Community Name\s*[.:]\s*([^\n]+)/i,
    /Property Name\s*[.:]\s*([^\n]+)/i
  ];
  
  for (const pattern of associationNamePatterns) {
    const match = notes.match(pattern);
    if (match && match[1] && match[1].trim()) {
      associationName = match[1].trim();
      break;
    }
  }
  
  // Association Type - try multiple possible formats
  const associationTypePatterns = [
    /Association Type\s*[.:]\s*([^\n]+)/i,
    /Type\s*[.:]\s*([^\n]+)/i,
    /Property Type\s*[.:]\s*([^\n]+)/i
  ];
  
  for (const pattern of associationTypePatterns) {
    const match = notes.match(pattern);
    if (match && match[1] && match[1].trim()) {
      associationType = match[1].trim();
      break;
    }
  }
  
  // If no explicit type but keywords exist
  if (!associationType) {
    if (notes.match(/\bHOA\b/i)) {
      associationType = "HOA";
    } else if (notes.match(/\bCondo\b/i)) {
      associationType = "Condominium";
    } else if (notes.match(/\bTownhouse\b/i)) {
      associationType = "Townhouse";
    } else if (notes.match(/\bApartment\b/i)) {
      associationType = "Apartment";
    }
  }
  
  // Current Management - try multiple possible formats
  const managementPatterns = [
    /Current Management\s*[.:]\s*([^\n]+)/i,
    /We are currently\s*[.:]\s*([^\n]+)/i,
    /Current Manager\s*[.:]\s*([^\n]+)/i,
    /Managed By\s*[.:]\s*([^\n]+)/i
  ];
  
  for (const pattern of managementPatterns) {
    const match = notes.match(pattern);
    if (match && match[1] && match[1].trim()) {
      currentManagement = match[1].trim();
      break;
    }
  }
  
  // Number of Units - try multiple possible formats
  const unitsPatterns = [
    /Number of (Homes|Units)\s*[.:]\s*(\d[\d,]*)/i,
    /(\d[\d,]*) (Homes|Units)/i,
    /Total Units\s*[.:]\s*(\d[\d,]*)/i,
    /Property Size\s*[.:]\s*(\d[\d,]*)/i
  ];
  
  for (const pattern of unitsPatterns) {
    const match = notes.match(pattern);
    if (match && match[2] && !isNaN(parseInt(match[2].replace(/,/g, ''), 10))) {
      numberOfUnits = parseInt(match[2].replace(/,/g, ''), 10);
      break;
    } else if (match && match[1] && !isNaN(parseInt(match[1].replace(/,/g, ''), 10))) {
      numberOfUnits = parseInt(match[1].replace(/,/g, ''), 10);
      break;
    }
  }
  
  // Address components - try multiple possible formats
  const addressPatterns = [
    /Property Address\s*[.:]\s*([^\n]+)/i,
    /Address\s*[.:]\s*([^\n]+)/i,
    /Location\s*[.:]\s*([^\n]+)/i
  ];
  
  for (const pattern of addressPatterns) {
    const match = notes.match(pattern);
    if (match && match[1] && match[1].trim()) {
      const addressLines = match[1].trim().split('\n');
      if (addressLines.length >= 1) {
        streetAddress = addressLines[0].trim();
        break;
      }
    }
  }
  
  // Try to extract city, state, zip
  const cityStateZipMatch = notes.match(/([A-Za-z\s]+),?\s*([A-Z]{2})\s*(\d{5}(-\d{4})?)/i);
  if (cityStateZipMatch) {
    city = cityStateZipMatch[1].trim();
    state = cityStateZipMatch[2].toUpperCase();
    zip = cityStateZipMatch[3];
  }
  
  // Additional Requirements - try multiple possible formats
  const requirementsPatterns = [
    /Additional Information\s*[.:]\s*([^\n]+)/i,
    /Additional Requirements\s*[.:]\s*([^\n]+)/i,
    /Special Needs\s*[.:]\s*([^\n]+)/i,
    /Comments\s*[.:]\s*([^\n]+)/i
  ];
  
  for (const pattern of requirementsPatterns) {
    const match = notes.match(pattern);
    if (match && match[1] && match[1].trim()) {
      additionalRequirements = match[1].trim();
      break;
    }
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
  
  // Try to extract company name from structured data
  const companyPatterns = [
    /Company\s*[.:]\s*([^\n]+)/i,
    /Organization\s*[.:]\s*([^\n]+)/i,
    /Business\s*[.:]\s*([^\n]+)/i
  ];
  
  for (const pattern of companyPatterns) {
    const match = notes.match(pattern);
    if (match && match[1] && match[1].trim()) {
      return match[1].trim();
    }
  }
  
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
    // Try to match company patterns in signature
    const companyMatches = signature.match(/([A-Z][a-zA-Z\s]+)\s+(LLC|Inc|Ltd|Corp|Corporation|Company|Co)/);
    if (companyMatches) {
      company = companyMatches[0];
    }
  }
  
  return company;
}
