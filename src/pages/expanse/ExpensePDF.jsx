// File: src\components\expanse\ExpensePDF.jsx

import jsPDF from 'jspdf';
import { captalizeWords } from '../../utils/captalizeWords';
import { formatedDate } from '../../utils/formateddateAndTime';

export const generateExpensePDF = async (expenseData) => {
    try {
        // -------- Data Calculation --------
        let travelAmount = 0, roomAmount = 0, foodAmount = 0, otherAmount = 0;
        let computedTotal = 0, computedCompany = 0, computedSelf = 0;

        if (expenseData.expenses && typeof expenseData.expenses === 'object') {
            Object.entries(expenseData.expenses).forEach(([key, value]) => {
                const amt = Number(value?.amount) || 0;
                const type = key.toLowerCase();
                computedTotal += amt;

                if ((value?.paymentMethod || '').toUpperCase() === 'COMPANY') computedCompany += amt;
                if ((value?.paymentMethod || '').toUpperCase() === 'SELF') computedSelf += amt;

                if (type.includes('travel')) travelAmount += amt;
                else if (type.includes('hotel') || type.includes('room')) roomAmount += amt;
                else if (type.includes('food')) foodAmount += amt;
                else otherAmount += amt;
            });
        }

        if (Array.isArray(expenseData.miscItems)) {
            expenseData.miscItems.forEach((item) => {
                const amt = Number(item?.amount) || 0;
                computedTotal += amt;
                otherAmount += amt;
                if ((item?.paymentMethod || '').toUpperCase() === 'COMPANY') computedCompany += amt;
                if ((item?.paymentMethod || '').toUpperCase() === 'SELF') computedSelf += amt;
            });
        }

        const finalTotal = (typeof expenseData.totalAmount === 'number' && expenseData.totalAmount > 0) ? expenseData.totalAmount : computedTotal;
        const finalCompanyPaid = (typeof expenseData.companyPaidAmount === 'number' && expenseData.companyPaidAmount > 0) ? expenseData.companyPaidAmount : computedCompany;
        const finalReimbursable = (typeof expenseData.selfPaidAmount === 'number' && expenseData.selfPaidAmount > 0) ? expenseData.selfPaidAmount : (computedSelf > 0 ? computedSelf : finalTotal - finalCompanyPaid);

        // -------- Employee & Meta Data --------
        const employeeName = expenseData.employee?.fullName || expenseData.employee?.name || 'Unknown';
        const employeeCode = expenseData.employee?.employeeCode || expenseData.employee?.empCode || '-';
        const department = expenseData.employee?.departmentName || expenseData.employee?.department?.name || expenseData.employee?.department?.departmentName || '-';
        
        let approverName = 'Pending Approval';
        const status = (expenseData.status || '').toUpperCase();
        if (status === 'REJECTED') {
            approverName = expenseData.rejectedBy?.fullName || expenseData.rejectedBy?.name || expenseData.rejectedBy || 'Not Assigned';
        } else if (status !== 'PENDING') {
            approverName = expenseData.approvedBy?.fullName || expenseData.approvedBy?.name || expenseData.approvedBy || 'Not Assigned';
        }

        const claimMonth = expenseData.createdAt 
            ? new Date(expenseData.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' }) 
            : '-';

        // -------- PDF Setup --------
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth(); // 210
        const margin = 10;
        let y = 10;

        // Helper functions
        const formatRs = (val) => `Rs. ${Number(val).toFixed(2)}`;
        const drawRect = (x, yPos, w, h, fillColor = null) => {
            if (fillColor) {
                doc.setFillColor(...fillColor);
                doc.rect(x, yPos, w, h, 'F');
            }
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.2);
            doc.rect(x, yPos, w, h);
        };

        // -------- 1. Yellow Header --------
        doc.setFillColor(255, 215, 0); // Yellow
        doc.rect(margin, y, pageWidth - margin * 2, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text('Paul Merchants', pageWidth / 2, y + 5.5, { align: 'center' });
        y += 8;

        // -------- 2. Main Title --------
        doc.setFontSize(14);
        doc.text('PAUL MERCHANTS FINANCE PRIVATE LIMITED', pageWidth / 2, y + 8, { align: 'center' });
        doc.setFontSize(11);
        doc.text('Travelling Expenses Claim Bill', pageWidth / 2, y + 14, { align: 'center' });
        y += 16;

        // -------- 3. Employee Info Table --------
        const colW = (pageWidth - margin * 2) / 3;
        const rowH = 8;
        const x1 = margin;
        const x2 = margin + colW;
        const x3 = margin + colW * 2;

        // Row 1
        drawRect(x1, y, colW, rowH);
        drawRect(x2, y, colW, rowH);
        drawRect(x3, y, pageWidth - margin - x3, rowH);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Employee Name: ${employeeName}`, x1 + 2, y + 5.5);
        doc.text(`Reporting To: ${approverName}`, x2 + 2, y + 5.5);
        doc.text(`Vehicle Type: ${captalizeWords(expenseData.travelType) || '-'}`, x3 + 2, y + 5.5);
        y += rowH;

        // Row 2
        drawRect(x1, y, colW, rowH);
        drawRect(x2, y, colW, rowH);
        drawRect(x3, y, pageWidth - margin - x3, rowH);
        doc.text(`Department: ${department}`, x1 + 2, y + 5.5);
        doc.text(`Claim month: ${claimMonth}`, x2 + 2, y + 5.5);
        doc.text(`Fuel Type: -`, x3 + 2, y + 5.5);
        y += rowH;

        // Row 3
        drawRect(x1, y, colW, rowH);
        drawRect(x2, y, colW, rowH);
        drawRect(x3, y, pageWidth - margin - x3, rowH);
        doc.text(`Employee Code: ${employeeCode}`, x1 + 2, y + 5.5);
        doc.text(`Employee Grade: ${expenseData.grade || '-'}`, x2 + 2, y + 5.5);
        doc.text(`State/Zone: -`, x3 + 2, y + 5.5);
        y += rowH;

        // -------- 4. Table Title --------
        doc.setFont('helvetica', 'bold');
        doc.text('Travelling Expense Details:', margin + 2, y + 5.5);
        y += 8;

        // -------- 5. Expense Table Header --------
        doc.setFillColor(240, 240, 240); // Light gray
        doc.rect(margin, y, pageWidth - margin * 2, rowH, 'F');
        
        const cols = [
            { label: 'Date', width: 15 },
            { label: 'From', width: 35 },
            { label: 'To', width: 35 },
            { label: 'Purpose', width: 30 },
            { label: 'Travel', width: 12 },
            { label: 'Room', width: 12 },
            { label: 'Food', width: 12 },
            { label: 'Other', width: 12 },
            { label: 'Total', width: 12 },
            { label: 'Remarks', width: 15 }
        ];

        let currentX = margin;
        doc.setFontSize(8);
        cols.forEach((col) => {
            drawRect(currentX, y, col.width, rowH);
            doc.text(col.label, currentX + col.width / 2, y + 5.5, { align: 'center' });
            currentX += col.width;
        });
        y += rowH;

        // -------- 6. Expense Table Row --------
        // Prepare data (Notice the new remarksLines wrapper)
        const fromLines = doc.splitTextToSize(expenseData.fromLocation || '-', 33);
        const toLines = doc.splitTextToSize(expenseData.toLocation || '-', 33);
        const purposeLines = doc.splitTextToSize(expenseData.businessPurpose || expenseData.purpose || '-', 28);
        const remarksLines = doc.splitTextToSize(expenseData.remarks || '-', 13);
        
        const maxLines = Math.max(fromLines.length, toLines.length, purposeLines.length, remarksLines.length, 1);
        const dynamicRowH = Math.max(10, maxLines * 4 + 4);

        currentX = margin;
        doc.setFont('helvetica', 'normal');
        
        // Draw row borders
        cols.forEach((col) => {
            drawRect(currentX, y, col.width, dynamicRowH);
            currentX += col.width;
        });

        // Write row data
        currentX = margin;
        doc.text(formatedDate(expenseData.fromDate) || '-', currentX + 7.5, y + 5.5, { align: 'center' });
        currentX += cols[0].width;
        
        doc.text(fromLines, currentX + 2, y + 5.5);
        currentX += cols[1].width;
        
        doc.text(toLines, currentX + 2, y + 5.5);
        currentX += cols[2].width;
        
        doc.text(purposeLines, currentX + 2, y + 5.5);
        currentX += cols[3].width;

        doc.text(travelAmount ? travelAmount.toString() : '', currentX + cols[4].width - 2, y + 5.5, { align: 'right' });
        currentX += cols[4].width;

        doc.text(roomAmount ? roomAmount.toString() : '', currentX + cols[5].width - 2, y + 5.5, { align: 'right' });
        currentX += cols[5].width;

        doc.text(foodAmount ? foodAmount.toString() : '', currentX + cols[6].width - 2, y + 5.5, { align: 'right' });
        currentX += cols[6].width;

        doc.text(otherAmount ? otherAmount.toString() : '', currentX + cols[7].width - 2, y + 5.5, { align: 'right' });
        currentX += cols[7].width;

        doc.text(finalTotal.toString(), currentX + cols[8].width - 2, y + 5.5, { align: 'right' });
        currentX += cols[8].width;

        // Draw wrapped Remarks in table
        doc.text(remarksLines, currentX + 2, y + 5.5);
        
        y += dynamicRowH;

        // -------- 7. Expense Table Total Row --------
        const totalColSpanWidth = cols.slice(0, 8).reduce((sum, c) => sum + c.width, 0);
        currentX = margin;
        
        drawRect(currentX, y, totalColSpanWidth, rowH);
        drawRect(currentX + totalColSpanWidth, y, cols[8].width, rowH);
        drawRect(currentX + totalColSpanWidth + cols[8].width, y, cols[9].width, rowH);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Total', currentX + totalColSpanWidth - 4, y + 5.5, { align: 'right' });
        doc.text(finalTotal.toString(), currentX + totalColSpanWidth + cols[8].width - 2, y + 5.5, { align: 'right' });
        y += rowH;

        // -------- 8. Dedicated Remarks Section --------
        // Added for better visibility if remarks are long
        doc.setFont('helvetica', 'bold');
        doc.text('Remarks:', margin + 2, y + 5.5);
        doc.setFont('helvetica', 'normal');
        y += 6;
        
        const fullRemarksText = expenseData.remarks || 'No remarks provided.';
        const splitRemarks = doc.splitTextToSize(fullRemarksText, pageWidth - margin * 2 - 4);
        const remarksBoxHeight = Math.max(8, splitRemarks.length * 5 + 4);
        
        drawRect(margin, y, pageWidth - margin * 2, remarksBoxHeight);
        doc.text(splitRemarks, margin + 2, y + 5.5);
        y += remarksBoxHeight + 6;

        // -------- 9. Summary Table --------
        doc.setFont('helvetica', 'normal');
        const summaryColW = (pageWidth - margin * 2) / 2;
        
        const summaryRows = [
            { label: 'Grand Total:', value: formatRs(finalTotal) },
            { label: 'Local Conveyance Expenses :', value: '-' },
            { label: 'Total Expenses Incurred:', value: formatRs(finalTotal) },
            { label: 'Spent by Company:', value: formatRs(finalCompanyPaid) },
            { label: 'Balance to Receive:', value: formatRs(finalReimbursable) },
            { label: 'Amount Approved:', value: formatRs(status === 'APPROVED' ? finalTotal : 0) },
            { label: 'Approval Status:', value: captalizeWords(expenseData.status) }
        ];

        summaryRows.forEach((row) => {
            drawRect(margin, y, summaryColW, rowH);
            drawRect(margin + summaryColW, y, summaryColW, rowH);
            
            doc.text(row.label, margin + 2, y + 5.5);
            doc.text(row.value, margin + summaryColW * 2 - 2, y + 5.5, { align: 'right' });
            y += rowH;
        });

        // -------- 10. Signatures --------
        const sigH = 20;
        drawRect(margin, y, summaryColW, sigH);
        drawRect(margin + summaryColW, y, summaryColW, sigH);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Employee Signature', margin + 2, y + 5.5);
        doc.setFont('helvetica', 'normal');
        doc.text('Authorized Signature', margin + summaryColW * 2 - 2, y + sigH - 4, { align: 'right' });

        // -------- 11. Save PDF --------
        const safeName = String(employeeName).replace(/\s+/g, '_').replace(/[^\w-]/g, '');
        doc.save(`Expense_Claim_${safeName}.pdf`);
        return true;

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
        return false;
    }
};