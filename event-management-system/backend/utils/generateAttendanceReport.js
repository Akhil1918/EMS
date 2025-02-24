const PDFDocument = require("pdfkit");

const generateAttendanceReport = async (event, registrations) => {
  return new Promise((resolve, reject) => {
    try {
      // Create PDF document with optimized margins
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
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
         .fill('#ffffff');

      // Add header with gradient (reduced height)
      doc.rect(0, 0, doc.page.width, 80)
         .fillColor('#2196f3')
         .fill();

      // Add title (moved up)
      doc.fontSize(28)
         .font('Helvetica-Bold')
         .fillColor('#ffffff')
         .text('EVENT ATTENDANCE SHEET', 40, 30, { align: 'center' });

      // Add event details box (moved up and made more compact)
      doc.rect(40, 90, doc.page.width - 80, 80)
         .fillColor('#f8f9fa')
         .fill()
         .strokeColor('#e0e0e0')
         .stroke();

      // Event Details Section (more compact layout)
      const startY = 100;
      const lineHeight = 20;

      // First row
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('#333333')
         .text('Event Name:', 50, startY)
         .font('Helvetica')
         .text(event.name, 120, startY)
         .font('Helvetica-Bold')
         .text('Date:', 320, startY)
         .font('Helvetica')
         .text(new Date(event.date).toLocaleDateString('en-US', {
           weekday: 'long',
           year: 'numeric',
           month: 'long',
           day: 'numeric'
         }), 360, startY);

      // Second row
      doc.font('Helvetica-Bold')
         .text('Time:', 50, startY + lineHeight)
         .font('Helvetica')
         .text(`${formatTime(event.timeFrame.startTime)} - ${formatTime(event.timeFrame.endTime)}`, 
               120, startY + lineHeight)
         .font('Helvetica-Bold')
         .text('Location:', 320, startY + lineHeight)
         .font('Helvetica')
         .text(event.location, 380, startY + lineHeight);

      // Third row
      doc.font('Helvetica-Bold')
         .text('Total Registrations:', 50, startY + lineHeight * 2)
         .font('Helvetica')
         .text(registrations.length.toString(), 150, startY + lineHeight * 2);

      // Add instructions (made more compact)
      doc.fontSize(9)
         .font('Helvetica-Oblique')
         .fillColor('#666666')
         .text('Instructions: Please mark attendance by checking the box next to each attendee. Use this sheet to track attendance during the event.', 
               40, 180, { width: doc.page.width - 80 });

      // Attendance Table (moved up)
      const tableTop = 200;
      const tableRowHeight = 25; // Reduced row height
      const tableWidth = doc.page.width - 80;
      
      // Table Header
      doc.rect(40, tableTop, tableWidth, tableRowHeight)
         .fillColor('#e3f2fd')
         .fill();

      // Draw header text
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('#1976d2')
         .text('S.No', 50, tableTop + 7)
         .text('Attendee Name', 100, tableTop + 7)
         .text('Email', 280, tableTop + 7)
         .text('Present', 480, tableTop + 7);

      // Draw table rows
      let currentY = tableTop + tableRowHeight;
      
      registrations.forEach((reg, index) => {
        // Alternate row colors
        if (index % 2 === 0) {
          doc.rect(40, currentY, tableWidth, tableRowHeight)
             .fillColor('#f5f5f5')
             .fill();
        }

        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#333333');

        // Draw row content
        doc.text((index + 1).toString(), 50, currentY + 7)
           .text(reg.user.profile.name, 100, currentY + 7)
           .text(reg.user.email || 'N/A', 280, currentY + 7);

        // Draw attendance checkbox
        doc.rect(485, currentY + 3, 18, 18)
           .strokeColor('#1976d2')
           .stroke();

        currentY += tableRowHeight;
      });

      // Add signature section (moved up closer to the table)
      const signatureY = currentY + 20;
      
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('#333333')
         .text('Event Coordinator Signature:', 40, signatureY);

      doc.moveTo(40, signatureY + 30)
         .lineTo(280, signatureY + 30)
         .strokeColor('#333333')
         .stroke();

      // Add footer relative to the signature section
      const footerY = signatureY + 60;
      
      // Add a light gray line above the footer
      doc.moveTo(40, footerY)
         .lineTo(doc.page.width - 40, footerY)
         .strokeColor('#e0e0e0')
         .stroke();

      // Footer content
      doc.fontSize(8)
         .font('Helvetica')
         .fillColor('#666666')
         .text(
           `Generated on: ${new Date().toLocaleString()}`,
           40,
           footerY + 10
         );

      const securityCode = generateSecurityCode(event);
      doc.fontSize(8)
         .font('Helvetica-Bold')
         .fillColor('#1976d2')
         .text(
           `Document ID: ${securityCode}`,
           doc.page.width - 200,
           footerY + 10
         );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Helper function to generate a security code
const generateSecurityCode = (event) => {
  const timestamp = Date.now();
  const eventId = event._id.toString().slice(-6);
  return `ATT-${eventId}-${timestamp}`;
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

module.exports = generateAttendanceReport; 