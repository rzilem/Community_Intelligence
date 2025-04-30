
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { MaintenanceRequest } from '@/types/maintenance-types';

// Define street names for the Nolan City HOA community
const streets = [
  "Nolan Ridge Drive",
  "Waterfall Court",
  "Lakeside Lane",
  "Meridian Boulevard",
  "Evergreen Terrace",
  "Oak Ridge Court",
  "Willow Stream Drive",
  "Sunset Vista Road",
  "Magnolia Place",
  "Parkview Circle"
];

// Define property types
const propertyTypes = ["Single Family", "Townhome", "Condo", "Villa"];

// Define common last names for random owner generation
const lastNames = [
  "Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor",
  "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson",
  "Clark", "Rodriguez", "Lewis", "Lee", "Walker", "Hall", "Allen", "Young", "Hernandez", "King",
  "Wright", "Lopez", "Hill", "Scott", "Green", "Adams", "Baker", "Gonzalez", "Nelson", "Carter"
];

// Define common first names for random owner generation
const firstNames = [
  "James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles",
  "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen",
  "Christopher", "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Joshua",
  "Nancy", "Lisa", "Betty", "Margaret", "Sandra", "Ashley", "Kimberly", "Emily", "Donna", "Michelle"
];

// Email domains for random email generation
const emailDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "aol.com"];

// Generate a random phone number in the format (XXX) XXX-XXXX
const generatePhoneNumber = () => {
  const areaCode = 512; // Austin area code
  const prefix = 100 + Math.floor(Math.random() * 900);
  const lineNumber = 1000 + Math.floor(Math.random() * 9000);
  return `(${areaCode}) ${prefix}-${lineNumber}`;
};

// Generate a random email based on first and last name
const generateEmail = (firstName, lastName) => {
  const domainIndex = Math.floor(Math.random() * emailDomains.length);
  // Add a random number to ensure uniqueness
  const randomNum = Math.floor(Math.random() * 100);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNum}@${emailDomains[domainIndex]}`;
};

// Generate a random date within the past 5 years
const generateMoveInDate = () => {
  const now = new Date();
  const yearsAgo = new Date();
  yearsAgo.setFullYear(now.getFullYear() - 5);
  
  // Random date between 5 years ago and now
  const randomTimestamp = yearsAgo.getTime() + Math.random() * (now.getTime() - yearsAgo.getTime());
  const date = new Date(randomTimestamp);
  
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

// Generate a random date within the past 6 months
const generateRecentDate = () => {
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);
  
  // Random date between 6 months ago and now
  const randomTimestamp = sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime());
  const date = new Date(randomTimestamp);
  
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

// Generate a random emergency contact
const generateEmergencyContact = () => {
  const relationTypes = ["Spouse", "Parent", "Sibling", "Child", "Friend"];
  const relationIndex = Math.floor(Math.random() * relationTypes.length);
  const firstNameIndex = Math.floor(Math.random() * firstNames.length);
  const lastNameIndex = Math.floor(Math.random() * lastNames.length);
  const phone = generatePhoneNumber();
  
  return `${firstNames[firstNameIndex]} ${lastNames[lastNameIndex]} (${relationTypes[relationIndex]}): ${phone}`;
};

// Generate addresses with owner information
export const generateAddresses = (
  count = 532, 
  communityName = "Nolan City",
  zipCode = "78724",
  city = "Austin",
  state = "TX"
) => {
  const addresses = [];
  
  // Count to ensure we get exactly the requested number of addresses
  let addressCount = 0;
  
  // Generate addresses for each street
  for (let i = 0; addressCount < count; i++) {
    const streetIndex = i % streets.length;
    const street = streets[streetIndex];
    
    // Determine how many houses to generate on this street
    // More houses on boulevards and drives, fewer on courts and places
    let housesOnStreet = street.includes("Drive") || street.includes("Boulevard") ? 80 : 40;
    
    // Adjust to get exactly the requested number of addresses
    if (addressCount + housesOnStreet > count) {
      housesOnStreet = count - addressCount;
    }
    
    // Generate houses for this street
    for (let houseNum = 1; houseNum <= housesOnStreet; houseNum++) {
      // Use different house number patterns for different streets
      let houseNumber;
      if (street.includes("Circle") || street.includes("Court")) {
        // Courts and circles often have lower numbers
        houseNumber = 100 + houseNum * 2;
      } else if (street.includes("Drive") || street.includes("Boulevard")) {
        // Main streets often have higher numbers and are sequential 
        houseNumber = 1000 + houseNum * 4;
      } else {
        // Other streets
        houseNumber = 500 + houseNum * 3;
      }
      
      // Random property type with weighted distribution
      const propertyTypeIndex = Math.floor(Math.random() * 10);
      const propertyType = propertyTypeIndex < 6 ? propertyTypes[0] : // 60% single family
                           propertyTypeIndex < 8 ? propertyTypes[1] : // 20% townhome
                           propertyTypeIndex < 9 ? propertyTypes[2] : // 10% condo
                           propertyTypes[3];                         // 10% villa
      
      // For condos and townhomes, add unit numbers
      const unitNumber = (propertyType === "Condo" || propertyType === "Townhome") 
        ? String.fromCharCode(65 + Math.floor(Math.random() * 4)) // Unit A, B, C, or D
        : "";
      
      // Square footage varies by property type
      let squareFeet;
      if (propertyType === "Single Family") {
        squareFeet = 1800 + Math.floor(Math.random() * 1200); // 1800-3000 sqft
      } else if (propertyType === "Villa") {
        squareFeet = 1600 + Math.floor(Math.random() * 800);  // 1600-2400 sqft
      } else if (propertyType === "Townhome") {
        squareFeet = 1200 + Math.floor(Math.random() * 600);  // 1200-1800 sqft
      } else { // Condo
        squareFeet = 800 + Math.floor(Math.random() * 500);   // 800-1300 sqft
      }
      
      // Bedrooms and bathrooms based on square footage
      let bedrooms, bathrooms;
      if (squareFeet > 2500) {
        bedrooms = 4 + Math.floor(Math.random() * 2); // 4-5 bedrooms
        bathrooms = 3 + Math.floor(Math.random() * 2); // 3-4 bathrooms
      } else if (squareFeet > 1800) {
        bedrooms = 3 + Math.floor(Math.random() * 2); // 3-4 bedrooms
        bathrooms = 2 + Math.floor(Math.random() * 2); // 2-3 bathrooms
      } else if (squareFeet > 1200) {
        bedrooms = 2 + Math.floor(Math.random() * 2); // 2-3 bedrooms
        bathrooms = 2; // 2 bathrooms
      } else {
        bedrooms = 1 + Math.floor(Math.random() * 2); // 1-2 bedrooms
        bathrooms = 1 + Math.floor(Math.random() * 2); // 1-2 bathrooms
      }
      
      // Format address with unit if present
      const address = unitNumber 
        ? `${houseNumber} ${street}, Unit ${unitNumber}` 
        : `${houseNumber} ${street}`;
      
      // Generate owner information
      const ownerFirstNameIndex = Math.floor(Math.random() * firstNames.length);
      const ownerLastNameIndex = Math.floor(Math.random() * lastNames.length);
      const ownerFirstName = firstNames[ownerFirstNameIndex];
      const ownerLastName = lastNames[ownerLastNameIndex];
      const ownerEmail = generateEmail(ownerFirstName, ownerLastName);
      const ownerPhone = generatePhoneNumber();
      const moveInDate = generateMoveInDate();
      const emergencyContact = generateEmergencyContact();
      
      // 10% chance of having a co-owner (for properties that commonly have multiple owners)
      const hasCoOwner = Math.random() < 0.1;
      
      addresses.push({
        // Property data
        address: address,
        unit_number: unitNumber || null,
        city: city,
        state: state,
        zip: zipCode,
        property_type: propertyType,
        square_feet: squareFeet,
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        
        // Primary owner data
        owner_first_name: ownerFirstName,
        owner_last_name: ownerLastName,
        owner_email: ownerEmail,
        owner_phone: ownerPhone,
        owner_is_primary: true,
        owner_move_in_date: moveInDate,
        owner_emergency_contact: emergencyContact,
        
        // Include co-owner data if applicable (for families, partners, etc.)
        co_owner_first_name: hasCoOwner ? firstNames[Math.floor(Math.random() * firstNames.length)] : null,
        co_owner_last_name: hasCoOwner ? ownerLastName : null, // Usually shares the same last name
        co_owner_email: hasCoOwner ? generateEmail(firstNames[Math.floor(Math.random() * firstNames.length)], ownerLastName) : null,
        co_owner_phone: hasCoOwner ? generatePhoneNumber() : null,
        co_owner_is_primary: false,
        co_owner_move_in_date: hasCoOwner ? moveInDate : null, // Same move-in date as primary owner
        co_owner_emergency_contact: hasCoOwner ? generateEmergencyContact() : null
      });
      
      addressCount++;
      if (addressCount >= count) break;
    }
  }
  
  return addresses;
};

// Generate maintenance requests
export const generateMaintenanceRequests = (
  count = 100,
  communityName = "Nolan City",
  zipCode = "78724",
  city = "Austin",
  state = "TX"
) => {
  const requests = [];
  const addresses = generateAddresses(Math.min(count * 2, 500), communityName, zipCode, city, state);
  
  // Maintenance request types
  const maintenanceTypes = [
    "Plumbing", "Electrical", "HVAC", "Structural", "Appliance", 
    "Pest Control", "Landscaping", "Roofing", "Common Area", "Security"
  ];
  
  // Common issues by type
  const issuesByType = {
    "Plumbing": ["Leaking faucet", "Clogged drain", "Water pressure issue", "Toilet not flushing", "Hot water not working"],
    "Electrical": ["Light fixture broken", "Outlet not working", "Circuit breaker trips", "Wiring issue", "Power fluctuation"],
    "HVAC": ["AC not cooling", "Heater not working", "Strange noise from unit", "Thermostat malfunction", "Air filter replacement"],
    "Structural": ["Ceiling crack", "Wall damage", "Floor tile loose", "Door not closing properly", "Window leak"],
    "Appliance": ["Refrigerator not cooling", "Dishwasher leak", "Oven not heating", "Microwave malfunction", "Garbage disposal jammed"],
    "Pest Control": ["Ant infestation", "Rodent sighting", "Wasp nest", "Cockroach problem", "Termite inspection"],
    "Landscaping": ["Tree limb down", "Sprinkler broken", "Dead grass patches", "Overgrown vegetation", "Drainage issue"],
    "Roofing": ["Roof leak", "Missing shingles", "Gutter issue", "Vent damage", "Chimney problem"],
    "Common Area": ["Pool issue", "Gym equipment broken", "Clubhouse repair", "Playground damage", "Gate malfunction"],
    "Security": ["Lock issue", "Camera malfunction", "Security light out", "Gate code problem", "Intercom not working"]
  };
  
  // Priorities
  const priorities = ["low", "medium", "high"];
  
  // Statuses
  const statuses = ["open", "in_progress", "closed"];
  
  for (let i = 0; i < count; i++) {
    // Pick a random property
    const propertyIndex = Math.floor(Math.random() * addresses.length);
    const property = addresses[propertyIndex];
    
    // Pick a random maintenance type
    const maintenanceTypeIndex = Math.floor(Math.random() * maintenanceTypes.length);
    const maintenanceType = maintenanceTypes[maintenanceTypeIndex];
    
    // Pick a random issue for that type
    const issuesForType = issuesByType[maintenanceType];
    const issueIndex = Math.floor(Math.random() * issuesForType.length);
    const issue = issuesForType[issueIndex];
    
    // Randomly assign priority and status
    const priorityIndex = Math.floor(Math.random() * priorities.length);
    const priority = priorities[priorityIndex];
    
    const statusIndex = Math.floor(Math.random() * statuses.length);
    const status = statuses[statusIndex];
    
    // Creation date and potentially resolved date
    const createdDate = generateRecentDate();
    let resolvedDate = null;
    if (status === "closed") {
      // If closed, add a resolved date after the creation date
      const createdTimestamp = new Date(createdDate).getTime();
      const now = new Date().getTime();
      const resolvedTimestamp = createdTimestamp + Math.random() * (now - createdTimestamp);
      resolvedDate = new Date(resolvedTimestamp).toISOString().split('T')[0];
    }
    
    requests.push({
      id: `MR-${String(i + 1).padStart(4, '0')}`,
      property_id: `PROP-${propertyIndex}`,
      property_address: property.address,
      owner_name: `${property.owner_first_name} ${property.owner_last_name}`,
      owner_email: property.owner_email,
      owner_phone: property.owner_phone,
      title: `${maintenanceType} Issue: ${issue}`,
      description: `Request to fix ${issue.toLowerCase()} in ${property.address}. This is a ${priority} priority maintenance request.`,
      status: status,
      priority: priority,
      assigned_to: status !== "open" ? `Maintenance Staff ${Math.floor(Math.random() * 5) + 1}` : "",
      created_at: createdDate,
      resolved_date: resolvedDate,
      association: communityName
    });
  }
  
  return requests;
};

// Generate compliance issues
export const generateComplianceIssues = (
  count = 100,
  communityName = "Nolan City",
  zipCode = "78724",
  city = "Austin",
  state = "TX"
) => {
  const issues = [];
  const addresses = generateAddresses(Math.min(count * 2, 500), communityName, zipCode, city, state);
  
  // Compliance issue types
  const complianceTypes = [
    "Architectural Violation", 
    "Landscaping Violation", 
    "Trash Violation", 
    "Parking Violation", 
    "Pet Violation",
    "Noise Complaint",
    "Unauthorized Modification",
    "Holiday Decoration",
    "Maintenance Neglect",
    "Signage Violation"
  ];
  
  // Description templates by type
  const descriptionsByType = {
    "Architectural Violation": [
      "Unapproved exterior paint color",
      "Unauthorized fence installation",
      "Unapproved window replacement",
      "Unauthorized addition to home",
      "Non-compliant roof material"
    ],
    "Landscaping Violation": [
      "Overgrown lawn exceeding 6 inches",
      "Dead vegetation requiring removal",
      "Unapproved tree removal",
      "Neglected flower beds with weeds",
      "Unauthorized landscape design change"
    ],
    "Trash Violation": [
      "Trash cans left out past collection day",
      "Improper disposal of large items",
      "Recycling contamination",
      "Trash visible from street view",
      "Bulky waste without scheduled pickup"
    ],
    "Parking Violation": [
      "Vehicle parked on lawn",
      "Commercial vehicle parked overnight",
      "Inoperable vehicle in driveway",
      "Blocking sidewalk access",
      "Parking in fire lane"
    ],
    "Pet Violation": [
      "Unleashed pet in common area",
      "Pet waste not cleaned up",
      "Excessive barking complaint",
      "Unauthorized pet type",
      "Too many pets per household"
    ],
    "Noise Complaint": [
      "Excessive noise after quiet hours",
      "Construction noise during restricted hours",
      "Loud gatherings/parties",
      "Persistent loud music",
      "Equipment noise violation"
    ],
    "Unauthorized Modification": [
      "Satellite dish visible from front",
      "Solar panels installed without approval",
      "Unapproved shed or storage structure",
      "Altered drainage affecting neighbors",
      "Playground equipment without approval"
    ],
    "Holiday Decoration": [
      "Holiday lights displayed beyond allowed timeframe",
      "Excessive holiday decorations",
      "Decorations creating safety hazard",
      "Offensive holiday display",
      "Decorations on common property"
    ],
    "Maintenance Neglect": [
      "Peeling paint requiring attention",
      "Broken fence requiring repair",
      "Damaged siding needing replacement",
      "Cracked driveway needing repair",
      "Gutter maintenance required"
    ],
    "Signage Violation": [
      "Unauthorized 'For Sale' sign",
      "Political sign beyond allowed period",
      "Business advertisement sign",
      "Oversized signs exceeding limits",
      "Signs in restricted areas"
    ]
  };
  
  // Statuses
  const statuses = ["open", "in_progress", "resolved"];
  
  // Fine amounts
  const fineAmounts = [50, 75, 100, 150, 200, 250];
  
  for (let i = 0; i < count; i++) {
    // Pick a random property
    const propertyIndex = Math.floor(Math.random() * addresses.length);
    const property = addresses[propertyIndex];
    
    // Pick a random violation type
    const typeIndex = Math.floor(Math.random() * complianceTypes.length);
    const violationType = complianceTypes[typeIndex];
    
    // Pick a random description for that type
    const descriptionsForType = descriptionsByType[violationType];
    const descriptionIndex = Math.floor(Math.random() * descriptionsForType.length);
    const description = descriptionsForType[descriptionIndex];
    
    // Randomly assign status
    const statusIndex = Math.floor(Math.random() * statuses.length);
    const status = statuses[statusIndex];
    
    // Creation date and due date
    const createdDate = generateRecentDate();
    
    // Due date is 30 days after creation date
    const createdDateObj = new Date(createdDate);
    const dueDate = new Date(createdDateObj);
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateStr = dueDate.toISOString().split('T')[0];
    
    // Resolved date if resolved
    let resolvedDate = null;
    if (status === "resolved") {
      // If resolved, add a resolved date between created and due date
      const createdTimestamp = createdDateObj.getTime();
      const dueTimestamp = dueDate.getTime();
      const resolvedTimestamp = createdTimestamp + Math.random() * (dueTimestamp - createdTimestamp);
      resolvedDate = new Date(resolvedTimestamp).toISOString().split('T')[0];
    }
    
    // Fine amount (only for open or in_progress issues)
    const fineAmount = status === "resolved" ? 0 : fineAmounts[Math.floor(Math.random() * fineAmounts.length)];
    
    issues.push({
      id: `CI-${String(i + 1).padStart(4, '0')}`,
      property_id: `PROP-${propertyIndex}`,
      property_address: property.address,
      owner_name: `${property.owner_first_name} ${property.owner_last_name}`,
      owner_email: property.owner_email,
      owner_phone: property.owner_phone,
      violation_type: violationType,
      description: description,
      details: `${violationType} at ${property.address}: ${description}. Please resolve by the due date to avoid additional fines.`,
      status: status,
      fine_amount: fineAmount,
      created_at: createdDate,
      due_date: dueDateStr,
      resolved_date: resolvedDate,
      association: communityName
    });
  }
  
  return issues;
};

// Generate financial records
export const generateFinancialRecords = (
  count = 100,
  communityName = "Nolan City",
  zipCode = "78724",
  city = "Austin",
  state = "TX"
) => {
  const records = [];
  const addresses = generateAddresses(Math.min(count * 2, 500), communityName, zipCode, city, state);
  
  // Payment types
  const paymentTypes = ["Assessment Fee", "Special Assessment", "Late Fee", "Legal Fee", "Maintenance Fee", "Violation Fine"];
  
  // Payment statuses
  const paymentStatuses = ["paid", "pending", "overdue", "partially_paid"];
  
  // Payment methods
  const paymentMethods = ["Check", "ACH", "Credit Card", "Cash", "Money Order", "Bank Transfer"];
  
  // GL Accounts
  const glAccounts = ["1000 - Operating Fund", "2000 - Reserve Fund", "3000 - Maintenance", "4000 - Legal", "5000 - Admin"];
  
  for (let i = 0; i < count; i++) {
    // Pick a random property
    const propertyIndex = Math.floor(Math.random() * addresses.length);
    const property = addresses[propertyIndex];
    
    // Pick a random payment type
    const typeIndex = Math.floor(Math.random() * paymentTypes.length);
    const paymentType = paymentTypes[typeIndex];
    
    // Set amount based on payment type
    let amount = 0;
    switch (paymentType) {
      case "Assessment Fee":
        amount = 250 + Math.floor(Math.random() * 10) * 25; // $250-$475
        break;
      case "Special Assessment":
        amount = 500 + Math.floor(Math.random() * 20) * 50; // $500-$1500
        break;
      case "Late Fee":
        amount = 25 + Math.floor(Math.random() * 4) * 25; // $25-$100
        break;
      case "Legal Fee":
        amount = 100 + Math.floor(Math.random() * 10) * 50; // $100-$600
        break;
      case "Maintenance Fee":
        amount = 75 + Math.floor(Math.random() * 6) * 25; // $75-$225
        break;
      case "Violation Fine":
        amount = 50 + Math.floor(Math.random() * 5) * 50; // $50-$300
        break;
      default:
        amount = 100;
    }
    
    // Randomly assign status
    const statusIndex = Math.floor(Math.random() * paymentStatuses.length);
    const status = paymentStatuses[statusIndex];
    
    // Due date is a random date within the past year
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    const dueTimestamp = oneYearAgo.getTime() + Math.random() * (now.getTime() - oneYearAgo.getTime());
    const dueDate = new Date(dueTimestamp).toISOString().split('T')[0];
    
    // Payment date if paid
    let paymentDate = null;
    if (status === "paid" || status === "partially_paid") {
      // If paid, payment date is after due date for some, before for others
      const dueDateObj = new Date(dueDate);
      const variance = Math.random() < 0.7 ? -10 : 15; // 70% pay before due date, 30% pay after
      const paymentDateObj = new Date(dueDateObj);
      paymentDateObj.setDate(paymentDateObj.getDate() + variance);
      paymentDate = paymentDateObj.toISOString().split('T')[0];
    }
    
    // Payment method if paid
    const paymentMethod = (status === "paid" || status === "partially_paid") 
      ? paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
      : null;
    
    // GL Account
    const glAccount = glAccounts[Math.floor(Math.random() * glAccounts.length)];
    
    // Amount paid if partially paid
    const amountPaid = status === "partially_paid" ? Math.floor(amount * (0.25 + Math.random() * 0.5)) : (status === "paid" ? amount : 0);
    
    records.push({
      id: `TR-${String(i + 1).padStart(4, '0')}`,
      property_id: `PROP-${propertyIndex}`,
      property_address: property.address,
      owner_name: `${property.owner_first_name} ${property.owner_last_name}`,
      owner_email: property.owner_email,
      owner_phone: property.owner_phone,
      description: `${paymentType} for ${property.address}`,
      type: paymentType,
      amount: amount,
      amount_paid: amountPaid,
      balance: amount - amountPaid,
      due_date: dueDate,
      payment_date: paymentDate,
      status: status,
      payment_method: paymentMethod,
      gl_account: glAccount,
      association: communityName,
      // This is the critical field we're adding to fix the import issue
      association_id: ""  // This will be populated by the import process
    });
  }
  
  return records;
};

// Export functions for each data type
export const exportAddressesAsCSV = (
  count = 532, 
  communityName = "Nolan City",
  zipCode = "78724",
  city = "Austin",
  state = "TX"
) => {
  const addresses = generateAddresses(count, communityName, zipCode, city, state);
  const worksheet = XLSX.utils.json_to_sheet(addresses);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `${communityName} Properties & Owners`);
  
  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Save file with the community name
  const fileName = communityName.toLowerCase().replace(/\s+/g, '-');
  saveAs(blob, `${fileName}-properties-and-owners-${new Date().toISOString().slice(0, 10)}.xlsx`);
};

export const exportMaintenanceRequestsAsCSV = (
  count = 100,
  communityName = "Nolan City",
  zipCode = "78724",
  city = "Austin",
  state = "TX"
) => {
  const requests = generateMaintenanceRequests(count, communityName, zipCode, city, state);
  const worksheet = XLSX.utils.json_to_sheet(requests);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `${communityName} Maintenance Requests`);
  
  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Save file with the community name
  const fileName = communityName.toLowerCase().replace(/\s+/g, '-');
  saveAs(blob, `${fileName}-maintenance-requests-${new Date().toISOString().slice(0, 10)}.xlsx`);
};

export const exportComplianceIssuesAsCSV = (
  count = 100,
  communityName = "Nolan City",
  zipCode = "78724",
  city = "Austin",
  state = "TX"
) => {
  const issues = generateComplianceIssues(count, communityName, zipCode, city, state);
  const worksheet = XLSX.utils.json_to_sheet(issues);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `${communityName} Compliance Issues`);
  
  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Save file with the community name
  const fileName = communityName.toLowerCase().replace(/\s+/g, '-');
  saveAs(blob, `${fileName}-compliance-issues-${new Date().toISOString().slice(0, 10)}.xlsx`);
};

export const exportFinancialRecordsAsCSV = (
  count = 100,
  communityName = "Nolan City",
  zipCode = "78724",
  city = "Austin",
  state = "TX"
) => {
  const records = generateFinancialRecords(count, communityName, zipCode, city, state);
  const worksheet = XLSX.utils.json_to_sheet(records);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `${communityName} Financial Records`);
  
  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Save file with the community name
  const fileName = communityName.toLowerCase().replace(/\s+/g, '-');
  saveAs(blob, `${fileName}-financial-records-${new Date().toISOString().slice(0, 10)}.xlsx`);
};
