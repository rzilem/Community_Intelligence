
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

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

// Generate a random emergency contact
const generateEmergencyContact = () => {
  const relationTypes = ["Spouse", "Parent", "Sibling", "Child", "Friend"];
  const relationIndex = Math.floor(Math.random() * relationTypes.length);
  const firstNameIndex = Math.floor(Math.random() * firstNames.length);
  const lastNameIndex = Math.floor(Math.random() * lastNames.length);
  const phone = generatePhoneNumber();
  
  return `${firstNames[firstNameIndex]} ${lastNames[lastNameIndex]} (${relationTypes[relationIndex]}): ${phone}`;
};

// Generate 532 addresses with owner information
export const generateAddresses = () => {
  const addresses = [];
  
  // Count to ensure we get exactly 532 addresses
  let count = 0;
  
  // Generate addresses for each street
  for (let i = 0; count < 532; i++) {
    const streetIndex = i % streets.length;
    const street = streets[streetIndex];
    
    // Determine how many houses to generate on this street
    // More houses on boulevards and drives, fewer on courts and places
    let housesOnStreet = street.includes("Drive") || street.includes("Boulevard") ? 80 : 40;
    
    // Adjust to get exactly 532 addresses
    if (count + housesOnStreet > 532) {
      housesOnStreet = 532 - count;
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
        city: "Austin",
        state: "TX",
        zip: "78724",
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
      
      count++;
      if (count >= 532) break;
    }
  }
  
  return addresses;
};

// Function to export addresses as CSV
export const exportAddressesAsCSV = () => {
  const addresses = generateAddresses();
  const worksheet = XLSX.utils.json_to_sheet(addresses);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Nolan City Properties & Owners");
  
  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Save file
  saveAs(blob, `nolan-city-properties-and-owners-${new Date().toISOString().slice(0, 10)}.xlsx`);
};
