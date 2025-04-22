export const welcomeEmailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome to Our Community!</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding-bottom: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
        h1 { color: #2c3e50; }
        .cta-button { display: inline-block; padding: 10px 20px; background-color: #3498db; color: #fff; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to {{community_name}}!</h1>
        </div>
        
        <p>Dear {{resident_name}},</p>
        
        <p>We're thrilled to welcome you to our vibrant community! We hope you'll quickly feel at home and enjoy all the amenities and activities we have to offer.</p>
        
        <p>Here are a few things to get you started:</p>
        
        <ul>
            <li><strong>Get to know your neighbors:</strong> Join our community events and meet new people.</li>
            <li><strong>Explore our amenities:</strong> Take advantage of our pool, gym, and other facilities.</li>
            <li><strong>Stay informed:</strong> Check our website and newsletters for important updates and announcements.</li>
        </ul>
        
        <p>If you have any questions or need assistance, please don't hesitate to contact our management office.</p>
        
        <p>We look forward to seeing you around!</p>
        
        <p>Sincerely,<br>
        The {{community_name}} Team</p>
        
        <div class="footer">
            <p>This email was sent by {{community_name}}</p>
            <p>{{community_address}}</p>
        </div>
    </div>
</body>
</html>
`;

export const paymentReminderTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Payment Reminder</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding-bottom: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
        h1 { color: #2c3e50; }
        .details { background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .cta-button { display: inline-block; padding: 10px 20px; background-color: #3498db; color: #fff; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Payment Reminder</h1>
        </div>
        
        <p>Dear {{resident_name}},</p>
        
        <p>This is a friendly reminder that your payment is due soon. Please make sure to submit your payment before the due date to avoid any late fees.</p>
        
        <div class="details">
            <p><strong>Amount Due:</strong> {{amount_due}}</p>
            <p><strong>Due Date:</strong> {{due_date}}</p>
            <p><strong>Account Number:</strong> {{account_number}}</p>
        </div>
        
        <p>You can make a payment through our online portal or by mail. If you have already submitted your payment, please disregard this notice.</p>
        
        <p><a href="{{payment_portal_link}}" class="cta-button">Make a Payment</a></p>
        
        <p>Thank you for your prompt attention to this matter.</p>
        
        <p>Sincerely,<br>
        {{association_name}} Management</p>
        
        <div class="footer">
            <p>This email was sent by {{association_name}}</p>
            <p>{{association_address}}</p>
        </div>
    </div>
</body>
</html>
`;

export const maintenanceRequestUpdateTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Maintenance Request Update</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding-bottom: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
        h1 { color: #2c3e50; }
        .details { background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Maintenance Request Update</h1>
        </div>
        
        <p>Dear {{resident_name}},</p>
        
        <p>We're providing an update on your recent maintenance request. Here are the details:</p>
        
        <div class="details">
            <p><strong>Request Number:</strong> {{request_number}}</p>
            <p><strong>Status:</strong> {{status}}</p>
            <p><strong>Description:</strong> {{description}}</p>
            <p><strong>Assigned Technician:</strong> {{technician_name}}</p>
            <p><strong>Estimated Completion Date:</strong> {{completion_date}}</p>
        </div>
        
        <p>We're working diligently to resolve your request and will keep you updated on any changes. If you have any questions or concerns, please contact our office.</p>
        
        <p>Thank you for your patience.</p>
        
        <p>Sincerely,<br>
        {{association_name}} Management</p>
        
        <div class="footer">
            <p>This email was sent by {{association_name}}</p>
            <p>{{association_address}}</p>
        </div>
    </div>
</body>
</html>
`;

export const communityEventAnnouncementTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Community Event Announcement</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding-bottom: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
        h1 { color: #2c3e50; }
        .details { background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .cta-button { display: inline-block; padding: 10px 20px; background-color: #3498db; color: #fff; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Community Event Announcement</h1>
        </div>
        
        <p>Dear Residents,</p>
        
        <p>We're excited to announce an upcoming community event! Here are the details:</p>
        
        <div class="details">
            <p><strong>Event:</strong> {{event_name}}</p>
            <p><strong>Date:</strong> {{event_date}}</p>
            <p><strong>Time:</strong> {{event_time}}</p>
            <p><strong>Location:</strong> {{event_location}}</p>
            <p><strong>Description:</strong> {{event_description}}</p>
        </div>
        
        <p>We encourage you to join us for a fun-filled day of activities and socializing. It's a great opportunity to meet your neighbors and strengthen our community bonds.</p>
        
        <p><a href="{{rsvp_link}}" class="cta-button">RSVP Now</a></p>
        
        <p>We look forward to seeing you there!</p>
        
        <p>Sincerely,<br>
        {{association_name}} Management</p>
        
        <div class="footer">
            <p>This email was sent by {{association_name}}</p>
            <p>{{association_address}}</p>
        </div>
    </div>
</body>
</html>
`;

export const amenityBookingConfirmationTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Amenity Booking Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding-bottom: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
        h1 { color: #2c3e50; }
        .details { background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Amenity Booking Confirmation</h1>
        </div>
        
        <p>Dear {{resident_name}},</p>
        
        <p>This is a confirmation of your amenity booking. Here are the details:</p>
        
        <div class="details">
            <p><strong>Amenity:</strong> {{amenity_name}}</p>
            <p><strong>Date:</strong> {{booking_date}}</p>
            <p><strong>Time:</strong> {{booking_time}}</p>
            <p><strong>Duration:</strong> {{booking_duration}}</p>
        </div>
        
        <p>Please arrive on time and follow all the rules and regulations for the amenity. If you need to cancel or reschedule, please contact our office at least 24 hours in advance.</p>
        
        <p>We hope you enjoy your time!</p>
        
        <p>Sincerely,<br>
        {{association_name}} Management</p>
        
        <div class="footer">
            <p>This email was sent by {{association_name}}</p>
            <p>{{association_address}}</p>
        </div>
    </div>
</body>
</html>
`;

export const boardMeetingReminderTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Board Meeting Reminder</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding-bottom: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
        h1 { color: #2c3e50; }
        .details { background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Board Meeting Reminder</h1>
        </div>
        
        <p>Dear Board Members,</p>
        
        <p>This is a reminder about the upcoming board meeting. Here are the details:</p>
        
        <div class="details">
            <p><strong>Date:</strong> {{meeting_date}}</p>
            <p><strong>Time:</strong> {{meeting_time}}</p>
            <p><strong>Location:</strong> {{meeting_location}}</p>
            <p><strong>Agenda:</strong> {{meeting_agenda}}</p>
        </div>
        
        <p>Please come prepared to discuss and make decisions on important community matters. If you're unable to attend, please notify the secretary as soon as possible.</p>
        
        <p>We look forward to a productive meeting.</p>
        
        <p>Sincerely,<br>
        {{association_name}} Management</p>
        
        <div class="footer">
            <p>This email was sent by {{association_name}}</p>
            <p>{{association_address}}</p>
        </div>
    </div>
</body>
</html>
`;

export const emergencyAlertTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Emergency Alert</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding-bottom: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
        h1 { color: #c0392b; }
        .alert { background-color: #f2dede; border: 1px solid #ebccd1; color: #a94442; padding: 15px; margin: 20px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Emergency Alert</h1>
        </div>
        
        <div class="alert">
            <p><strong>Subject:</strong> {{alert_subject}}</p>
            <p><strong>Message:</strong> {{alert_message}}</p>
        </div>
        
        <p>Please take necessary precautions and stay safe. Follow any instructions provided by local authorities. We will provide updates as soon as they become available.</p>
        
        <p>Sincerely,<br>
        {{association_name}} Management</p>
        
        <div class="footer">
            <p>This email was sent by {{association_name}}</p>
            <p>{{association_address}}</p>
        </div>
    </div>
</body>
</html>
`;

export const ruleViolationNoticeTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Rule Violation Notice</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding-bottom: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
        h1 { color: #c0392b; }
        .details { background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Rule Violation Notice</h1>
        </div>
        
        <p>Dear {{resident_name}},</p>
        
        <p>This is a notice regarding a violation of community rules. Here are the details:</p>
        
        <div class="details">
            <p><strong>Violation Type:</strong> {{violation_type}}</p>
            <p><strong>Description:</strong> {{description}}</p>
            <p><strong>Date of Violation:</strong> {{violation_date}}</p>
        </div>
        
        <p>Please correct this violation within the specified timeframe to avoid further action. If you have any questions or need clarification, please contact our office.</p>
        
        <p>Thank you for your cooperation.</p>
        
        <p>Sincerely,<br>
        {{association_name}} Management</p>
        
        <div class="footer">
            <p>This email was sent by {{association_name}}</p>
            <p>{{association_address}}</p>
        </div>
    </div>
</body>
</html>
`;

export const packageDeliveryAlertTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Package Delivery Alert</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding-bottom: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
        h1 { color: #27ae60; }
        .details { background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Package Delivery Alert</h1>
        </div>
        
        <p>Dear {{resident_name}},</p>
        
        <p>This is to inform you that a package has been delivered to your property. Here are the details:</p>
        
        <div class="details">
            <p><strong>Delivery Date:</strong> {{delivery_date}}</p>
            <p><strong>Delivery Time:</strong> {{delivery_time}}</p>
            <p><strong>Location:</strong> {{delivery_location}}</p>
        </div>
        
        <p>Please pick up your package at your earliest convenience. We're not responsible for any lost or damaged packages after 48 hours.</p>
        
        <p>Thank you for your attention.</p>
        
        <p>Sincerely,<br>
        {{association_name}} Management</p>
        
        <div class="footer">
            <p>This email was sent by {{association_name}}</p>
            <p>{{association_address}}</p>
        </div>
    </div>
</body>
</html>
`;

export const visitorManagementNotificationTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Visitor Management Notification</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding-bottom: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
        h1 { color: #2980b9; }
        .details { background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Visitor Management Notification</h1>
        </div>
        
        <p>Dear {{resident_name}},</p>
        
        <p>This is a notification regarding a visitor at your property. Here are the details:</p>
        
        <div class="details">
            <p><strong>Visitor Name:</strong> {{visitor_name}}</p>
            <p><strong>Arrival Date:</strong> {{arrival_date}}</p>
            <p><strong>Arrival Time:</strong> {{arrival_time}}</p>
        </div>
        
        <p>Please ensure that your visitor follows all community rules and regulations. If you have any questions or need assistance, please contact our office.</p>
        
        <p>Thank you for your cooperation.</p>
        
        <p>Sincerely,<br>
        {{association_name}} Management</p>
        
        <div class="footer">
            <p>This email was sent by {{association_name}}</p>
            <p>{{association_address}}</p>
        </div>
    </div>
</body>
</html>
`;

export const generalAnnouncementTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>General Announcement</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding-bottom: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
        h1 { color: #34495e; }
        .details { background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>General Announcement</h1>
        </div>
        
        <p>Dear Residents,</p>
        
        <p>We're sharing an important announcement with you. Here are the details:</p>
        
        <div class="details">
            <p><strong>Subject:</strong> {{announcement_subject}}</p>
            <p><strong>Message:</strong> {{announcement_message}}</p>
        </div>
        
        <p>Please take note of this announcement and act accordingly. If you have any questions or need clarification, please contact our office.</p>
        
        <p>Thank you for your attention.</p>
        
        <p>Sincerely,<br>
        {{association_name}} Management</p>
        
        <div class="footer">
            <p>This email was sent by {{association_name}}</p>
            <p>{{association_address}}</p>
        </div>
    </div>
</body>
</html>
`;

export const maintenanceScheduleNotificationTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Maintenance Schedule Notification</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding-bottom: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
        h1 { color: #e67e22; }
        .details { background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Maintenance Schedule Notification</h1>
        </div>
        
        <p>Dear Residents,</p>
        
        <p>This is a notification regarding scheduled maintenance at your property. Here are the details:</p>
        
        <div class="details">
            <p><strong>Area:</strong> {{maintenance_area}}</p>
            <p><strong>Date:</strong> {{maintenance_date}}</p>
            <p><strong>Time:</strong> {{maintenance_time}}</p>
            <p><strong>Description:</strong> {{maintenance_description}}</p>
        </div>
        
        <p>Please take necessary precautions and plan accordingly. We apologize for any inconvenience this may cause. If you have any questions or need clarification, please contact our office.</p>
        
        <p>Thank you for your cooperation.</p>
        
        <p>Sincerely,<br>
        {{association_name}} Management</p>
        
        <div class="footer">
            <p>This email was sent by {{association_name}}</p>
            <p>{{association_address}}</p>
        </div>
    </div>
</body>
</html>
`;

export const waterShutOffNotificationTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Water Shut-Off Notification</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding-bottom: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
        h1 { color: #c0392b; }
        .details { background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Water Shut-Off Notification</h1>
        </div>
        
        <p>Dear Residents,</p>
        
        <p>This is a notification regarding a temporary water shut-off at your property. Here are the details:</p>
        
        <div class="details">
            <p><strong>Date:</strong> {{shutoff_date}}</p>
            <p><strong>Time:</strong> {{shutoff_time}}</p>
            <p><strong>Duration:</strong> {{shutoff_duration}}</p>
            <p><strong>Reason:</strong> {{shutoff_reason}}</p>
        </div>
        
        <p>Please take necessary precautions and store water for your needs. We apologize for any inconvenience this may cause. If you have any questions or need clarification, please contact our office.</p>
        
        <p>Thank you for your cooperation.</p>
        
        <p>Sincerely,<br>
        {{association_name}} Management</p>
        
        <div class="footer">
            <p>This email was sent by {{association_name}}</p>
            <p>{{association_address}}</p>
        </div>
    </div>
</body>
</html>
`;

export const trashCollectionReminderTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Trash Collection Reminder</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding-bottom: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
        h1 { color: #2ecc71; }
        .details { background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Trash Collection Reminder</h1>
        </div>
        
        <p>Dear Residents,</p>
        
        <p>This is a reminder about the upcoming trash collection. Here are the details:</p>
        
        <div class="details">
            <p><strong>Date:</strong> {{collection_date}}</p>
            <p><strong>Time:</strong> {{collection_time}}</p>
            <p><strong>Location:</strong> {{collection_location}}</p>
        </div>
        
        <p>Please place your trash bins at the designated location before the scheduled time. Follow all community rules and regulations for trash disposal. If you have any questions or need clarification, please contact our office.</p>
        
        <p>Thank you for your cooperation.</p>
        
        <p>Sincerely,<br>
        {{association_name}} Management</p>
        
        <div class="footer">
            <p>This email was sent by {{association_name}}</p>
            <p>{{association_address}}</p>
        </div>
    </div>
</body>
</html>
`;

export const parkingRegulationsReminderTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Parking Regulations Reminder</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding-bottom: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
        h1 { color: #3498db; }
        .details { background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Parking Regulations Reminder</h1>
        </div>
        
        <p>Dear Residents,</p>
        
        <p>This is a reminder about the community's parking regulations. Here are the details:</p>
        
        <div class="details">
            <p><strong>Regulation:</strong> {{parking_regulation}}</p>
            <p><strong>Description:</strong> {{regulation_description}}</p>
        </div>
        
        <p>Please adhere to these regulations to ensure a safe and orderly parking environment. Violators may be subject to fines or towing. If you have any questions or need clarification, please contact our office.</p>
        
        <p>Thank you for your cooperation.</p>
        
        <p>Sincerely,<br>
        {{association_name}} Management</p>
        
        <div class="footer">
            <p>This email was sent by {{association_name}}</p>
            <p>{{association_address}}</p>
        </div>
    </div>
</body>
</html>
`;

export const landscapingMaintenanceNotificationTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Landscaping Maintenance Notification</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding-bottom: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
        h1 { color: #26ae60; }
        .details { background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Landscaping Maintenance Notification</h1>
        </div>
        
        <p>Dear Residents,</p>
        
        <p>This is a notification regarding upcoming landscaping maintenance at your property. Here are the details:</p>
        
        <div class="details">
            <p><strong>Date:</strong> {{maintenance_date}}</p>
            <p><strong>Time:</strong> {{maintenance_time}}</p>
            <p><strong>Area:</strong> {{maintenance_area}}</p>
            <p><strong>Description:</strong> {{maintenance_description}}</p>
        </div>
        
        <p>Please take necessary precautions and keep the area clear for the maintenance crew. We apologize for any inconvenience this may cause. If you have any questions or need clarification, please contact our office.</p>
        
        <p>Thank you for your cooperation.</p>
        
        <p>Sincerely,<br>
        {{association_name}} Management</p>
        
        <div class="footer">
            <p>This email was sent by {{association_name}}</p>
            <p>{{association_address}}</p>
        </div>
    </div>
</body>
</html>
`;

export
