const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Customer = require('../models/Customer');
const AuditLog = require('../models/AuditLog');
const fallbackDb = require('../utils/fallbackDb');

// Helper to fetch customers list based on DB state
const getAllCustomersData = async () => {
  if (global.dbConnected) {
    return await Customer.find({}).sort({ churnProbability: -1 });
  } else {
    const list = fallbackDb.getCustomers();
    list.sort((a, b) => b.churnProbability - a.churnProbability);
    return list;
  }
};

// @desc    Generate PDF report of customer churn analytics
// @route   GET /api/reports/pdf
// @access  Private
const generatePDFReport = async (req, res) => {
  try {
    const customers = await getAllCustomersData();
    const total = customers.length;
    const active = customers.filter(c => c.churnStatus === 0).length;
    const churned = customers.filter(c => c.churnStatus === 1).length;
    const churnRate = total > 0 ? ((churned / total) * 100).toFixed(1) : 0;
    const revenueLoss = customers.filter(c => c.churnStatus === 1).reduce((sum, c) => sum + c.monthlyCharges, 0).toFixed(2);
    const highRiskCount = customers.filter(c => c.riskLevel === 'High Risk' && c.churnStatus === 0).length;

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Stream PDF directly to client response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="ChurnVision_Executive_Report.pdf"');
    doc.pipe(res);

    // Title / Header Banner
    doc.rect(0, 0, doc.page.width, 110).fill('#4F46E5');
    doc.fillColor('#FFFFFF')
       .fontSize(24)
       .text('ChurnVision Analytics', 50, 30, { bold: true })
       .fontSize(11)
       .text('Customer Churn Prediction & Executive Intelligence Report', 50, 65)
       .text(`Generated: ${new Date().toLocaleDateString()} by ${req.user.name}`, 50, 80);

    doc.moveDown(4);
    doc.fillColor('#1E293B');

    // Section 1: Executive KPI Dashboard
    doc.fontSize(16).text('1. Executive KPI Summary', { underline: true });
    doc.moveDown(0.5);
    
    const kpiY = doc.y;
    doc.rect(50, kpiY, 150, 60).fill('#F8FAFC');
    doc.rect(220, kpiY, 150, 60).fill('#F8FAFC');
    doc.rect(390, kpiY, 155, 60).fill('#F8FAFC');

    // Draw borders
    doc.rect(50, kpiY, 150, 60).stroke('#E2E8F0');
    doc.rect(220, kpiY, 150, 60).stroke('#E2E8F0');
    doc.rect(390, kpiY, 155, 60).stroke('#E2E8F0');

    // Labels
    doc.fillColor('#64748B').fontSize(9);
    doc.text('TOTAL CUSTOMERS', 60, kpiY + 12);
    doc.text('CHURNED (RATE)', 230, kpiY + 12);
    doc.text('MONTHLY REVENUE LOSS', 400, kpiY + 12);

    // Values
    doc.fillColor('#1E293B').fontSize(14).text(total.toString(), 60, kpiY + 28, { bold: true });
    
    // Highlight churn rate
    doc.fillColor('#EF4444').text(`${churned} (${churnRate}%)`, 230, kpiY + 28, { bold: true });
    
    // Revenue loss
    doc.fillColor('#1E293B').text(`$${revenueLoss}`, 400, kpiY + 28, { bold: true });

    doc.y = kpiY + 80; // Move cursor past KPI boxes
    
    // Add additional info
    doc.fontSize(10).fillColor('#1E293B');
    doc.text(`Active Customer Base: ${active} customers.`);
    doc.text(`Identified High-Risk Profiles (Active but Churn Risk >70%): ${highRiskCount} customers.`, { bold: true });

    doc.moveDown(2);

    // Section 2: Churn Risk Rankings (Top 10)
    doc.fontSize(16).text('2. Top High-Risk Customer Profiles', { underline: true });
    doc.moveDown(0.8);

    // Table Headers
    const tableTop = doc.y;
    doc.fontSize(10).fillColor('#475569');
    doc.text('ID', 50, tableTop, { bold: true });
    doc.text('Name', 120, tableTop, { bold: true });
    doc.text('Subscription', 230, tableTop, { bold: true });
    doc.text('Tenure', 310, tableTop, { bold: true });
    doc.text('Monthly', 360, tableTop, { bold: true });
    doc.text('Tickets', 420, tableTop, { bold: true });
    doc.text('Risk Score', 480, tableTop, { bold: true });

    // Table divider line
    doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).strokeColor('#CBD5E1').stroke();

    let currentY = tableTop + 22;
    const topHighRisk = customers.filter(c => c.churnStatus === 0).slice(0, 10);

    topHighRisk.forEach(cust => {
      // Alternating background rows
      if (topHighRisk.indexOf(cust) % 2 === 1) {
        doc.rect(50, currentY - 4, 495, 18).fill('#F8FAFC');
      }
      
      doc.fillColor('#1E293B');
      doc.text(cust.customerId, 50, currentY);
      doc.text(cust.name.substring(0, 18), 120, currentY);
      doc.text(cust.subscriptionPlan, 230, currentY);
      doc.text(`${cust.tenure} months`, 310, currentY);
      doc.text(`$${cust.monthlyCharges}`, 360, currentY);
      doc.text(cust.supportTickets.toString(), 420, currentY);
      
      // Color-code score
      if (cust.churnProbability >= 80) {
        doc.fillColor('#EF4444');
      } else if (cust.churnProbability >= 50) {
        doc.fillColor('#F59E0B');
      } else {
        doc.fillColor('#10B981');
      }
      doc.text(`${cust.churnProbability}%`, 480, currentY, { bold: true });

      currentY += 18;
    });

    doc.moveTo(50, currentY).lineTo(545, currentY).strokeColor('#CBD5E1').stroke();
    
    // Add page numbers
    doc.fontSize(8).fillColor('#94A3B8').text('Page 1 of 1 - ChurnVision platform auto-report', 50, 750, { align: 'center' });

    doc.end();

    // Log action
    const auditObj = {
      action: 'EXPORT_PDF',
      details: 'Exported Executive PDF Churn Report.',
      userId: req.user.id || req.user._id,
      username: req.user.name
    };
    if (global.dbConnected) await AuditLog.create(auditObj);
    else fallbackDb.saveAuditLog(auditObj);

  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: 'Server error generating PDF report' });
    }
  }
};

// @desc    Generate Excel report of customer database
// @route   GET /api/reports/excel
// @access  Private
const generateExcelReport = async (req, res) => {
  try {
    const customers = await getAllCustomersData();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Customer Churn Analysis');

    worksheet.columns = [
      { header: 'Customer ID', key: 'customerId', width: 15 },
      { header: 'Name', key: 'name', width: 22 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Age', key: 'age', width: 8 },
      { header: 'Gender', key: 'gender', width: 10 },
      { header: 'Location', key: 'location', width: 12 },
      { header: 'Subscription Plan', key: 'subscriptionPlan', width: 18 },
      { header: 'Monthly Charges ($)', key: 'monthlyCharges', width: 18 },
      { header: 'Total Charges ($)', key: 'totalCharges', width: 18 },
      { header: 'Tenure (Months)', key: 'tenure', width: 15 },
      { header: 'Support Tickets', key: 'supportTickets', width: 15 },
      { header: 'Logins/Month', key: 'usageFrequency', width: 15 },
      { header: 'Churn Probability (%)', key: 'churnProbability', width: 20 },
      { header: 'Risk Level', key: 'riskLevel', width: 15 },
      { header: 'Status', key: 'status', width: 12 }
    ];

    // Format header row style
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4F46E5' }
    };

    customers.forEach(c => {
      const row = worksheet.addRow({
        customerId: c.customerId,
        name: c.name,
        email: c.email,
        age: c.age,
        gender: c.gender,
        location: c.location,
        subscriptionPlan: c.subscriptionPlan,
        monthlyCharges: c.monthlyCharges,
        totalCharges: c.totalCharges,
        tenure: c.tenure,
        supportTickets: c.supportTickets,
        usageFrequency: c.usageFrequency,
        churnProbability: c.churnProbability,
        riskLevel: c.riskLevel,
        status: c.churnStatus === 1 ? 'Churned' : 'Active'
      });

      // Highlight high risk or churned rows
      if (c.churnStatus === 1) {
        row.getCell('status').font = { color: { argb: 'EF4444' }, bold: true };
      }
      if (c.riskLevel === 'High Risk' && c.churnStatus === 0) {
        row.getCell('riskLevel').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FEE2E2' } // Light red background
        };
        row.getCell('riskLevel').font = { color: { argb: '991B1B' }, bold: true };
      }
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="ChurnVision_Customer_Export.xlsx"');

    await workbook.xlsx.write(res);
    res.end();

    // Log action
    const auditObj = {
      action: 'EXPORT_EXCEL',
      details: 'Exported Customer Excel Spreadsheet.',
      userId: req.user.id || req.user._id,
      username: req.user.name
    };
    if (global.dbConnected) await AuditLog.create(auditObj);
    else fallbackDb.saveAuditLog(auditObj);

  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: 'Server error generating Excel spreadsheet' });
    }
  }
};

// @desc    Simulate emailing reports to team members
// @route   POST /api/reports/share
// @access  Private
const shareReportEmail = async (req, res) => {
  const { email, reportType } = req.body;
  if (!email || !reportType) {
    return res.status(400).json({ status: 'error', message: 'Please provide recipient email and report type' });
  }

  try {
    // Audit logging
    const auditObj = {
      action: 'SHARE_REPORT',
      details: `Emailed ${reportType.toUpperCase()} report to ${email}.`,
      userId: req.user.id || req.user._id,
      username: req.user.name
    };
    if (global.dbConnected) await AuditLog.create(auditObj);
    else fallbackDb.saveAuditLog(auditObj);

    res.json({
      status: 'success',
      message: `Report successfully dispatched. Verification details logged in audit records.`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error sharing report' });
  }
};

module.exports = {
  generatePDFReport,
  generateExcelReport,
  shareReportEmail
};
