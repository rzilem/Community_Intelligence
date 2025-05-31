
// Main vendor service - simplified to use the refactored modules
export type { VendorServiceType, VendorStats, VendorFormData } from './vendor/vendor-types';
export { vendorApi as vendorService } from './vendor/vendor-api';
