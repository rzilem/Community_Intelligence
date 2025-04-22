
// Define types for the email templates
export interface DefaultTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  description: string;
  category: 'welcome' | 'payment' | 'violation' | 'announcement' | 'general';
}

/**
 * Default email templates used in the system
 */
export const DEFAULT_EMAIL_TEMPLATES: DefaultTemplate[] = [
  // Welcome templates
  {
    id: 'welcome-new-resident',
    name: 'Welcome New Resident',
    subject: 'Welcome to {association.name}',
    description: 'Sent to new residents when they are added to the system',
    category: 'welcome',
    body: `
      <p>Dear {resident.first_name},</p>
      
      <p>Welcome to {association.name}! We're delighted to have you as part of our community.</p>
      
      <p>Here are a few things to help you get settled:</p>
      
      <ul>
        <li>Your property address: {property.full_address}</li>
        <li>Association website: {association.website}</li>
        <li>Community contact email: {association.email}</li>
        <li>Community contact phone: {association.phone}</li>
      </ul>
      
      <p>Please don't hesitate to reach out if you have any questions or concerns.</p>
      
      <p>Best regards,<br>
      {association.name} Management</p>
    `
  },
  
  {
    id: 'welcome-new-owner',
    name: 'Welcome New Owner',
    subject: 'Welcome to {association.name} Homeowners Association',
    description: 'Sent to new homeowners when they purchase a property',
    category: 'welcome',
    body: `
      <p>Dear {resident.first_name},</p>
      
      <p>On behalf of the Board of Directors and the entire community, welcome to {association.name}!</p>
      
      <p>As a new homeowner at {property.address}, we want to ensure you have all the information you need to make your transition smooth. Please find attached our welcome packet containing:</p>
      
      <ul>
        <li>HOA Bylaws and CC&Rs</li>
        <li>Community guidelines</li>
        <li>Amenity access information</li>
        <li>Payment options for HOA dues</li>
        <li>Board meeting schedule</li>
      </ul>
      
      <p>Your monthly assessment is currently due on the 1st of each month. You can set up automatic payments through our resident portal.</p>
      
      <p>We look forward to meeting you at our next community event!</p>
      
      <p>Warm regards,<br>
      Board of Directors<br>
      {association.name}</p>
    `
  },
  
  // Payment templates
  {
    id: 'payment-reminder',
    name: 'Payment Reminder',
    subject: 'Payment Reminder - {association.name} Assessment Due',
    description: 'Reminder sent before payments are due',
    category: 'payment',
    body: `
      <p>Dear {resident.first_name},</p>
      
      <p>This is a friendly reminder that your {association.name} assessment payment of {payment.amount} is due on {payment.due_date}.</p>
      
      <p>Payment options include:</p>
      <ul>
        <li>Online through our resident portal</li>
        <li>Check mailed to {association.address}</li>
        <li>Automatic bank draft (contact management to set up)</li>
      </ul>
      
      <p>Please note that payments received after the 15th of the month may be subject to a late fee of {payment.late_fee}.</p>
      
      <p>If you have already made your payment, please disregard this notice.</p>
      
      <p>Thank you,<br>
      {association.name} Management</p>
    `
  },
  
  {
    id: 'payment-confirmation',
    name: 'Payment Confirmation',
    subject: 'Payment Confirmation - {association.name}',
    description: 'Confirmation sent when a payment is received',
    category: 'payment',
    body: `
      <p>Dear {resident.first_name},</p>
      
      <p>We are writing to confirm that we have received your payment of {payment.amount} for {association.name} on {date.current}.</p>
      
      <p>Payment details:</p>
      <ul>
        <li>Amount: {payment.amount}</li>
        <li>Property: {property.address}</li>
        <li>Payment date: {date.current}</li>
      </ul>
      
      <p>Your account is current and in good standing. Thank you for your prompt payment.</p>
      
      <p>Best regards,<br>
      {association.name} Management</p>
    `
  },
  
  {
    id: 'payment-past-due',
    name: 'Past Due Notice',
    subject: 'Important: Past Due Assessment - {association.name}',
    description: 'Notice sent when a payment is past due',
    category: 'payment',
    body: `
      <p>Dear {resident.first_name},</p>
      
      <p>Our records indicate that your {association.name} assessment payment of {payment.amount} that was due on {payment.due_date} has not been received.</p>
      
      <p>As of {date.current}, your account is past due. A late fee of {payment.late_fee} has been applied to your account.</p>
      
      <p>Current balance due: {payment.past_due}</p>
      
      <p>To avoid further late fees or potential collection actions, please remit payment promptly. If you have already sent your payment, please disregard this notice.</p>
      
      <p>If you are experiencing financial difficulties, please contact management to discuss payment arrangements.</p>
      
      <p>Thank you for your attention to this matter.</p>
      
      <p>Sincerely,<br>
      {association.name} Management</p>
    `
  },
  
  // Violation templates
  {
    id: 'violation-first-notice',
    name: 'First Violation Notice',
    subject: 'Community Guidelines Reminder - {association.name}',
    description: 'First notice sent when a violation is observed',
    category: 'violation',
    body: `
      <p>Dear {resident.first_name},</p>
      
      <p>During a recent inspection of the community, it was observed that your property at {property.address} may not be in compliance with the community guidelines regarding: {compliance.violation}.</p>
      
      <p>This is a friendly reminder of our community standards that help maintain our property values and ensure a pleasant environment for all residents.</p>
      
      <p>Please address this matter by {compliance.deadline}. No response is necessary if the issue has been resolved.</p>
      
      <p>If you have questions or need clarification about the guidelines, please contact management.</p>
      
      <p>Thank you for your cooperation.</p>
      
      <p>Regards,<br>
      {association.name} Management</p>
    `
  },
  
  {
    id: 'violation-second-notice',
    name: 'Second Violation Notice',
    subject: 'Second Notice: Community Guidelines Violation - {association.name}',
    description: 'Second notice sent when a violation remains unresolved',
    category: 'violation',
    body: `
      <p>Dear {resident.first_name},</p>
      
      <p>This is a follow-up to our previous communication regarding a community guidelines violation at your property ({property.address}).</p>
      
      <p>The violation regarding {compliance.violation} has not been corrected as of our most recent inspection.</p>
      
      <p>Per the association's enforcement policy, you must remedy this violation by {compliance.deadline} to avoid further action, which may include fines of up to {compliance.fine}.</p>
      
      <p>If you are experiencing difficulties complying or believe this notice was sent in error, please contact management immediately.</p>
      
      <p>Sincerely,<br>
      {association.name} Management</p>
    `
  },
  
  {
    id: 'violation-fine-notice',
    name: 'Violation Fine Notice',
    subject: 'Notice of Fine: Community Guidelines Violation - {association.name}',
    description: 'Notice sent when a fine is assessed for a violation',
    category: 'violation',
    body: `
      <p>Dear {resident.first_name},</p>
      
      <p>Despite previous notices, the violation at {property.address} regarding {compliance.violation} remains unresolved.</p>
      
      <p>In accordance with the association's enforcement policy, a fine of {compliance.fine} has been assessed to your account.</p>
      
      <p>You have the right to request a hearing with the Board of Directors to dispute this fine. To request a hearing, please contact management within 10 days of this notice.</p>
      
      <p>The violation must still be corrected by {compliance.deadline} to prevent additional fines.</p>
      
      <p>Respectfully,<br>
      {association.name} Management</p>
    `
  },
  
  // Announcement templates
  {
    id: 'announcement-general',
    name: 'General Announcement',
    subject: '{association.name} Community Announcement',
    description: 'General community announcement template',
    category: 'announcement',
    body: `
      <p>Dear {resident.first_name},</p>
      
      <p>We would like to inform all residents of {association.name} about an important community update.</p>
      
      <p>[Insert announcement details here]</p>
      
      <p>If you have any questions regarding this announcement, please don't hesitate to contact the management office.</p>
      
      <p>Thank you,<br>
      {association.name} Management</p>
    `
  },
  
  {
    id: 'announcement-meeting',
    name: 'Meeting Announcement',
    subject: '{association.name} - Upcoming Community Meeting',
    description: 'Announcement for upcoming community meetings',
    category: 'announcement',
    body: `
      <p>Dear {resident.first_name},</p>
      
      <p>You are invited to attend our upcoming community meeting:</p>
      
      <p><strong>Date:</strong> [Insert date]<br>
      <strong>Time:</strong> [Insert time]<br>
      <strong>Location:</strong> [Insert location]</p>
      
      <p><strong>Agenda:</strong></p>
      <ul>
        <li>[Agenda item 1]</li>
        <li>[Agenda item 2]</li>
        <li>[Agenda item 3]</li>
      </ul>
      
      <p>Your participation is important as we discuss matters affecting our community. If you cannot attend but would like to contribute, please submit your comments to the management office prior to the meeting.</p>
      
      <p>We look forward to seeing you there!</p>
      
      <p>Best regards,<br>
      Board of Directors<br>
      {association.name}</p>
    `
  },
  
  {
    id: 'announcement-maintenance',
    name: 'Maintenance Announcement',
    subject: 'Scheduled Maintenance - {association.name}',
    description: 'Announcement for scheduled maintenance in the community',
    category: 'announcement',
    body: `
      <p>Dear {resident.first_name},</p>
      
      <p>Please be advised that scheduled maintenance will be performed in our community as follows:</p>
      
      <p><strong>Maintenance Type:</strong> [Insert maintenance type]<br>
      <strong>Date:</strong> [Insert date]<br>
      <strong>Time:</strong> [Insert time]<br>
      <strong>Affected Areas:</strong> [Insert areas]</p>
      
      <p>This maintenance is necessary to [insert reason/benefit]. During this time, you may experience [insert disruptions, if any].</p>
      
      <p>We apologize for any inconvenience this may cause and appreciate your understanding as we work to maintain and improve our community.</p>
      
      <p>If you have any questions or concerns, please contact the management office.</p>
      
      <p>Thank you,<br>
      {association.name} Management</p>
    `
  },
  
  // General templates
  {
    id: 'general-information',
    name: 'General Information',
    subject: 'Important Information - {association.name}',
    description: 'General information communication template',
    category: 'general',
    body: `
      <p>Dear {resident.first_name},</p>
      
      <p>We are reaching out with some important information regarding {association.name}.</p>
      
      <p>[Insert information details here]</p>
      
      <p>If you have any questions about this information, please contact the management office.</p>
      
      <p>Thank you,<br>
      {association.name} Management</p>
    `
  },
  
  {
    id: 'general-inquiry-response',
    name: 'Inquiry Response',
    subject: 'Response to Your Inquiry - {association.name}',
    description: 'Template for responding to general inquiries',
    category: 'general',
    body: `
      <p>Dear {resident.first_name},</p>
      
      <p>Thank you for your inquiry regarding [insert topic]. We appreciate you reaching out to us.</p>
      
      <p>[Insert response details here]</p>
      
      <p>We hope this information addresses your concerns. If you have any further questions, please don't hesitate to contact us.</p>
      
      <p>Best regards,<br>
      {association.name} Management</p>
    `
  }
];
