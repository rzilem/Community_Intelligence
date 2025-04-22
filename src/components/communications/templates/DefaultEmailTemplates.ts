
export const defaultEmailTemplates = [
  {
    id: 'welcome',
    title: 'Welcome New Resident',
    description: 'Send a welcome email to new residents with important community information.',
    type: 'email',
    subject: 'Welcome to {association.name}!',
    content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to {association.name}</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333333; 
      margin: 0; 
      padding: 0; 
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px; 
    }
    .header { 
      background-color: #9b87f5; 
      padding: 20px; 
      text-align: center; 
      color: white; 
      border-radius: 5px 5px 0 0;
    }
    .content { 
      background-color: #ffffff; 
      padding: 20px; 
      border: 1px solid #e5deff; 
      border-top: none;
      border-radius: 0 0 5px 5px;
    }
    .footer { 
      text-align: center; 
      margin-top: 20px; 
      font-size: 12px; 
      color: #8E9196; 
    }
    .button {
      display: inline-block;
      background-color: #7E69AB;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 5px;
      margin: 20px 0;
    }
    h1, h2 { color: #1A1F2C; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to {association.name}!</h1>
    </div>
    <div class="content">
      <p>Dear {resident.name},</p>
      
      <p>On behalf of the Board of Directors and management, we're delighted to welcome you to {association.name}. We hope you'll find our community a wonderful place to live!</p>
      
      <h2>Important Information</h2>
      <ul>
        <li><strong>Association Website:</strong> <a href="{association.website}">{association.website}</a></li>
        <li><strong>Contact Email:</strong> <a href="mailto:{association.contact_email}">{association.contact_email}</a></li>
        <li><strong>Community Phone:</strong> {association.phone}</li>
      </ul>
      
      <p>Your monthly assessment is ${'{payment.amount}'} and is due on the 1st of each month. Late payments are subject to a ${'{payment.lateFee}'} fee.</p>
      
      <p>Please take some time to review the association rules and regulations, which you can find on our community portal.</p>
      
      <div style="text-align: center;">
        <a href="#" class="button">Access Community Portal</a>
      </div>
      
      <p>We look forward to meeting you!</p>
      
      <p>Sincerely,<br>
      The Board of Directors<br>
      {association.name}</p>
    </div>
    <div class="footer">
      <p>{association.name} | {association.address}, {association.city}, {association.state} {association.zip}</p>
    </div>
  </div>
</body>
</html>
    `
  },
  {
    id: 'payment-reminder',
    title: 'Monthly Payment Reminder',
    description: 'Send a friendly reminder about upcoming monthly assessment payments.',
    type: 'email',
    subject: '{association.name} - Monthly Assessment Due',
    content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Monthly Assessment Reminder</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333333; 
      margin: 0; 
      padding: 0; 
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px; 
    }
    .header { 
      background-color: #3B82F6; 
      padding: 20px; 
      text-align: center; 
      color: white; 
      border-radius: 5px 5px 0 0;
    }
    .content { 
      background-color: #ffffff; 
      padding: 20px; 
      border: 1px solid #D3E4FD; 
      border-top: none;
      border-radius: 0 0 5px 5px;
    }
    .footer { 
      text-align: center; 
      margin-top: 20px; 
      font-size: 12px; 
      color: #8E9196; 
    }
    .button {
      display: inline-block;
      background-color: #3B82F6;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .highlight-box {
      background-color: #F1F0FB;
      border: 1px solid #D3E4FD;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    h1, h2 { color: #1A1F2C; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Monthly Assessment Reminder</h1>
    </div>
    <div class="content">
      <p>Dear {resident.name},</p>
      
      <p>This is a friendly reminder that your monthly assessment for {association.name} is due on {'{payment.dueDate}'}.</p>
      
      <div class="highlight-box">
        <p><strong>Payment Details:</strong></p>
        <ul>
          <li>Amount Due: ${'{payment.amount}'}</li>
          <li>Due Date: {'{payment.dueDate}'}</li>
          <li>Late Fee: ${'{payment.lateFee}'} (applied after the 10th of the month)</li>
        </ul>
      </div>
      
      <p>You can make your payment through our resident portal or by mailing a check to our office.</p>
      
      <div style="text-align: center;">
        <a href="#" class="button">Make Payment Now</a>
      </div>
      
      <p>If you have already made your payment, please disregard this notice and thank you for your prompt attention.</p>
      
      <p>Thank you for being part of our community!</p>
      
      <p>Sincerely,<br>
      {association.name} Management</p>
    </div>
    <div class="footer">
      <p>{association.name} | {association.address}, {association.city}, {association.state} {association.zip}</p>
    </div>
  </div>
</body>
</html>
    `
  },
  {
    id: 'violation-notice',
    title: 'Compliance Violation Notice',
    description: 'Send a notice about a compliance violation that needs to be addressed.',
    type: 'email',
    subject: 'Important: Compliance Notice - {association.name}',
    content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Compliance Notice</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333333; 
      margin: 0; 
      padding: 0; 
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px; 
    }
    .header { 
      background-color: #EF4444; 
      padding: 20px; 
      text-align: center; 
      color: white; 
      border-radius: 5px 5px 0 0;
    }
    .content { 
      background-color: #ffffff; 
      padding: 20px; 
      border: 1px solid #FFDEE2; 
      border-top: none;
      border-radius: 0 0 5px 5px;
    }
    .footer { 
      text-align: center; 
      margin-top: 20px; 
      font-size: 12px; 
      color: #8E9196; 
    }
    .button {
      display: inline-block;
      background-color: #6366F1;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .violation-box {
      background-color: #FEF7CD;
      border: 1px solid #FEC6A1;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    h1, h2 { color: #1A1F2C; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Community Compliance Notice</h1>
    </div>
    <div class="content">
      <p>Dear {resident.name},</p>
      
      <p>During a recent inspection of the community, we observed a violation of the {association.name} rules and regulations at your property.</p>
      
      <div class="violation-box">
        <p><strong>Violation Details:</strong></p>
        <ul>
          <li>Violation Type: {compliance.violation}</li>
          <li>Property Address: {property.address}, {property.unit_number}, {property.city}, {property.state} {property.zip}</li>
          <li>Potential Fine: ${compliance.fine}</li>
          <li>Compliance Deadline: {compliance.deadline}</li>
        </ul>
      </div>
      
      <p>Please take corrective action by the deadline noted above to avoid potential fines or further enforcement action. If you have questions or need clarification, please contact management.</p>
      
      <p>If you believe this notice was sent in error or if you need additional time to address the issue, please submit an appeal or extension request through the community portal.</p>
      
      <div style="text-align: center;">
        <a href="#" class="button">Submit Appeal or Extension Request</a>
      </div>
      
      <p>Thank you for your prompt attention to this matter and for helping maintain the standards of our community.</p>
      
      <p>Sincerely,<br>
      {association.name} Management</p>
    </div>
    <div class="footer">
      <p>{association.name} | {association.address}, {association.city}, {association.state} {association.zip}</p>
    </div>
  </div>
</body>
</html>
    `
  },
  {
    id: 'community-event',
    title: 'Community Event Announcement',
    description: 'Announce an upcoming community event to all residents.',
    type: 'email',
    subject: 'Upcoming Event at {association.name}',
    content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Community Event Announcement</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333333; 
      margin: 0; 
      padding: 0; 
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px; 
    }
    .header { 
      background-color: #10B981; 
      padding: 20px; 
      text-align: center; 
      color: white; 
      border-radius: 5px 5px 0 0;
    }
    .content { 
      background-color: #ffffff; 
      padding: 20px; 
      border: 1px solid #F2FCE2; 
      border-top: none;
      border-radius: 0 0 5px 5px;
    }
    .footer { 
      text-align: center; 
      margin-top: 20px; 
      font-size: 12px; 
      color: #8E9196; 
    }
    .button {
      display: inline-block;
      background-color: #10B981;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .event-box {
      background-color: #F2FCE2;
      border: 1px solid #D6BCFA;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    h1, h2 { color: #1A1F2C; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Community Event Announcement</h1>
    </div>
    <div class="content">
      <p>Dear {resident.name},</p>
      
      <p>We're excited to announce an upcoming event at {association.name}!</p>
      
      <div class="event-box">
        <h2>Summer Pool Party</h2>
        <p><strong>Date:</strong> Saturday, July 15, 2023</p>
        <p><strong>Time:</strong> 1:00 PM - 4:00 PM</p>
        <p><strong>Location:</strong> Community Pool</p>
        <p><strong>Details:</strong> Join us for our annual summer pool party! We'll have food, drinks, games, and activities for residents of all ages. This is a great opportunity to meet your neighbors and enjoy our community amenities.</p>
      </div>
      
      <p>Please RSVP by July 10th so we can plan accordingly. Family members are welcome!</p>
      
      <div style="text-align: center;">
        <a href="#" class="button">RSVP Now</a>
      </div>
      
      <p>We look forward to seeing you there!</p>
      
      <p>Best regards,<br>
      {association.name} Social Committee</p>
    </div>
    <div class="footer">
      <p>{association.name} | {association.address}, {association.city}, {association.state} {association.zip}</p>
    </div>
  </div>
</body>
</html>
    `
  },
  {
    id: 'maintenance-update',
    title: 'Maintenance Update',
    description: 'Inform residents about upcoming or completed maintenance work.',
    type: 'email',
    subject: 'Maintenance Update - {association.name}',
    content: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Maintenance Update</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333333; 
      margin: 0; 
      padding: 0; 
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px; 
    }
    .header { 
      background-color: #F59E0B; 
      padding: 20px; 
      text-align: center; 
      color: white; 
      border-radius: 5px 5px 0 0;
    }
    .content { 
      background-color: #ffffff; 
      padding: 20px; 
      border: 1px solid #FDE1D3; 
      border-top: none;
      border-radius: 0 0 5px 5px;
    }
    .footer { 
      text-align: center; 
      margin-top: 20px; 
      font-size: 12px; 
      color: #8E9196; 
    }
    .button {
      display: inline-block;
      background-color: #F59E0B;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .maintenance-box {
      background-color: #FDE1D3;
      border: 1px solid #FEC6A1;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    h1, h2 { color: #1A1F2C; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Maintenance Update</h1>
    </div>
    <div class="content">
      <p>Dear {resident.name},</p>
      
      <p>We want to inform you about upcoming maintenance work scheduled for our community.</p>
      
      <div class="maintenance-box">
        <h2>Upcoming Maintenance: Roof Inspection</h2>
        <p><strong>Date:</strong> Monday, June 5, 2023 - Friday, June 9, 2023</p>
        <p><strong>Time:</strong> 8:00 AM - 5:00 PM</p>
        <p><strong>Areas Affected:</strong> All buildings</p>
        <p><strong>Details:</strong> Our contractors will be conducting routine roof inspections on all buildings. This work will involve ladder placement and crews on the roofs. Please be aware of workers in these areas during this time.</p>
      </div>
      
      <p>No action is required on your part, but please be aware of the following:</p>
      <ul>
        <li>There may be some noise during normal working hours</li>
        <li>Contractor vehicles will be present in the community</li>
        <li>All workers will be identified with company uniforms</li>
      </ul>
      
      <p>If you have any questions or concerns, please contact the management office.</p>
      
      <div style="text-align: center;">
        <a href="#" class="button">Contact Management</a>
      </div>
      
      <p>Thank you for your cooperation as we maintain our community.</p>
      
      <p>Sincerely,<br>
      {association.name} Management</p>
    </div>
    <div class="footer">
      <p>{association.name} | {association.address}, {association.city}, {association.state} {association.zip}</p>
    </div>
  </div>
</body>
</html>
    `
  }
];
