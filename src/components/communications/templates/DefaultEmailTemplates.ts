import { EmailTemplate } from '@/types/email-template-types';

export const defaultEmailTemplates: EmailTemplate[] = [
  {
    id: 'payment-reminder',
    name: 'Payment Reminder',
    subject: 'HOA Payment Reminder',
    body: `
      <p>Dear Resident,</p>
      <p>This is a friendly reminder that your HOA payment of ${'{payment.amount}'} is due on ${'{payment.dueDate}'}.</p>
      <p>Please note that a late fee of ${'{payment.lateFee}'} will be applied if payment is not received by the due date.</p>
      <p>Best regards,<br>Your HOA Management Team</p>
    `,
    variables: {
      payment: {
        amount: 250,
        dueDate: '2023-05-01',
        lateFee: 25
      }
    }
  },
  {
    id: 'violation-notice',
    name: 'Violation Notice',
    subject: 'HOA Compliance Notice',
    body: `
      <p>Dear Resident,</p>
      <p>During a recent inspection, we noticed a violation of the community guidelines: ${'{compliance.violationType}'}.</p>
      <p>Details: ${'{compliance.description}'}</p>
      <p>Please address this issue by ${'{compliance.dueDate}'}. If you have any questions or need assistance, please contact the management office.</p>
      <p>Thank you for your cooperation.</p>
      <p>Best regards,<br>Your HOA Management Team</p>
    `,
    variables: {
      compliance: {
        violationType: 'Landscaping',
        description: 'Overgrown lawn exceeding 4 inches in height',
        dueDate: '2023-05-15'
      }
    }
  },
  {
    id: 'welcome-new-resident',
    name: 'Welcome New Resident',
    subject: 'Welcome to Our Community!',
    body: `
      <p>Dear New Resident,</p>
      <p>On behalf of the Homeowners Association, we'd like to welcome you to our community!</p>
      <p>We've attached our community handbook which includes important information about amenities, rules, and contact information.</p>
      <p>Our next community meeting is scheduled for the first Tuesday of next month at 7:00 PM in the clubhouse. We hope to see you there!</p>
      <p>If you have any questions, please don't hesitate to reach out.</p>
      <p>Warm regards,<br>Your HOA Management Team</p>
    `
  },
  {
    id: 'community-event',
    name: 'Community Event Announcement',
    subject: 'Upcoming Community Event',
    body: `
      <p>Dear Resident,</p>
      <p>We're excited to announce an upcoming community event!</p>
      <p>Event details:</p>
      <ul>
        <li>Date: [Event Date]</li>
        <li>Time: [Event Time]</li>
        <li>Location: [Event Location]</li>
        <li>Description: [Event Description]</li>
      </ul>
      <p>We hope to see you there!</p>
      <p>Best regards,<br>Your HOA Management Team</p>
    `
  },
  {
    id: 'maintenance-notification',
    name: 'Maintenance Notification',
    subject: 'Scheduled Maintenance Notice',
    body: `
      <p>Dear Resident,</p>
      <p>This is to inform you that we have scheduled maintenance work in our community.</p>
      <p>Maintenance details:</p>
      <ul>
        <li>Date: [Maintenance Date]</li>
        <li>Time: [Maintenance Time]</li>
        <li>Areas Affected: [Affected Areas]</li>
        <li>Description: [Maintenance Description]</li>
      </ul>
      <p>We apologize for any inconvenience this may cause and appreciate your understanding.</p>
      <p>Best regards,<br>Your HOA Management Team</p>
    `
  }
];
