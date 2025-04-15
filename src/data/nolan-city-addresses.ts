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

// Generate 532 addresses
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
      
      addresses.push({
        address: address,
        unit_number: unitNumber || null,
        city: "Austin",
        state: "TX",
        zip: "78724",
        property_type: propertyType,
        square_feet: squareFeet,
        bedrooms: bedrooms,
        bathrooms: bathrooms
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
  XLSX.utils.book_append_sheet(workbook, worksheet, "Nolan City Addresses");
  
  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Save file
  saveAs(blob, `nolan-city-addresses-${new Date().toISOString().slice(0, 10)}.xlsx`);
};
