const PDFDocument = require("pdfkit");

const generateTicket = async (registration) => {
  return new Promise((resolve, reject) => {
    try {
      // Create PDF document with better margins
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        layout: 'portrait'
      });

      let buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        let pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Add background color
      doc.rect(0, 0, doc.page.width, doc.page.height)
         .fill('#f5f5f5');

      // Add header with gradient
      doc.rect(0, 0, doc.page.width, 120)
         .fillColor('#2196f3')
         .fill();

      // Add event title
      doc.fontSize(32)
         .font('Helvetica-Bold')
         .fillColor('#ffffff')
         .text('EVENT TICKET', 50, 40, { align: 'center' });

      // Add ticket box with shadow effect
      doc.rect(50, 100, doc.page.width - 100, doc.page.height - 200)
         .fillColor('#ffffff')
         .fill();

      // Add ticket number section
      doc.rect(doc.page.width - 200, 100, 150, 100)
         .fillColor('#e3f2fd')
         .fill();

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#1976d2')
         .text('TICKET NUMBER', doc.page.width - 180, 110);

      doc.fontSize(16)
         .text(registration.ticketNumber, doc.page.width - 180, 130);

      // Add QR Code placeholder with better styling
      doc.rect(doc.page.width - 180, 160, 80, 80)
         .stroke('#1976d2');
      doc.fontSize(8)
         .text('QR Code', doc.page.width - 160, 200);

      // Event Details Section with icons
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .fillColor('#1976d2')
         .text('Event Details', 70, 130);

      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text(registration.event.name, 70, 160);

      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#666666')
         .text('Date & Time:', 70, 190)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text(new Date(registration.event.date).toLocaleDateString('en-US', {
           weekday: 'long',
           year: 'numeric',
           month: 'long',
           day: 'numeric'
         }), 70, 210)
         .text(
           `${formatTime(registration.event.timeFrame.startTime)} - ${formatTime(registration.event.timeFrame.endTime)}`,
           70,
           230
         );

      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#666666')
         .text('Location:', 70, 260)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text(registration.event.location, 70, 280);

      // Attendee Information
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .fillColor('#1976d2')
         .text('Attendee Information', 70, 320);

      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#666666')
         .text('Name:', 70, 350)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text(registration.user.profile.name, 70, 370);

      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#666666')
         .text('Email:', 70, 400)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text(registration.user.email || 'N/A', 70, 420);

      // Add divider
      doc.moveTo(70, 460)
         .lineTo(doc.page.width - 70, 460)
         .strokeColor('#e0e0e0')
         .stroke();

      // Terms and Conditions with better formatting
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('#1976d2')
         .text('Terms & Conditions', 70, 480);

      doc.fontSize(8)
         .font('Helvetica')
         .fillColor('#666666')
         .list([
           'This ticket is valid only for the event and date mentioned above.',
           'Please bring a valid ID for verification at the event.',
           'This ticket is non-transferable and non-refundable.',
           'The organizer reserves the right to deny entry or modify event details if necessary.'
         ], 70, 500, {
           bulletRadius: 2,
           textIndent: 20
         });

      // Add footer with security code
      doc.fontSize(8)
         .font('Helvetica')
         .fillColor('#999999')
         .text(
           `Generated on: ${new Date().toLocaleString()}`,
           70,
           doc.page.height - 70
         );

      const securityCode = generateSecurityCode(registration);
      doc.fontSize(8)
         .font('Helvetica-Bold')
         .fillColor('#1976d2')
         .text(
           `Security Code: ${securityCode}`,
           doc.page.width - 250,
           doc.page.height - 70
         );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Helper function to generate a security code
const generateSecurityCode = (registration) => {
  const timestamp = new Date(registration.createdAt).getTime();
  const eventId = registration.event._id.toString().slice(-6);
  const userId = registration.user._id.toString().slice(-6);
  return `SEC-${eventId}-${userId}-${timestamp}`;
};

const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

module.exports = generateTicket;
