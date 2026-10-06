// File: src\components\expanse\ExpensePDF.jsx

import jsPDF from 'jspdf';

// Centralized color palette (RGB arrays are the most reliable across jsPDF versions —
// hex strings are not consistently supported by setTextColor/setFillColor/setDrawColor).
const COLORS = {
    primary: [255, 107, 53],      // #ff6b35
    textDark: [51, 51, 51],       // #333333
    textMuted: [85, 85, 85],      // #555555
    textLight: [153, 153, 153],   // #999999
    white: [255, 255, 255],
    border: [220, 220, 220],
    fillLight: [248, 248, 248],
    success: [34, 197, 94],       // #22c55e
    danger: [239, 68, 68],        // #ef4444
    warning: [245, 158, 11],      // #f59e0b
};

// jsPDF's standard fonts (Helvetica) do not include a glyph for ₹, which renders as a
// broken/missing character. Using "Rs." guarantees correct, consistent rendering.
const CURRENCY_PREFIX = 'Rs. ';

const formatAmount = (value) => {
    const num = Number(value);
    return `${CURRENCY_PREFIX}${Number.isFinite(num) ? num.toFixed(2) : '0.00'}`;
};

export const generateExpensePDF = async (expenseData) => {
    try {
        // Calculate total amount
        let totalAmount = 0;
        if (expenseData.expenses && typeof expenseData.expenses === 'object') {
            totalAmount = Object.values(expenseData.expenses).reduce(
                (sum, expense) => sum + (Number(expense?.amount) || 0),
                0
            );
        }

        // Get employee name
        const employeeName = expenseData.employee?.fullName ||
            expenseData.employee?.name ||
            expenseData.employee?.email?.split('@')[0] ||
            'Unknown';

        // Get approver name from approvedBy object
        let approverName = 'Not Assigned';
        if (expenseData.approvedBy) {
            if (typeof expenseData.approvedBy === 'object') {
                approverName = expenseData.approvedBy.fullName ||
                    expenseData.approvedBy.name ||
                    expenseData.approvedBy.email ||
                    'Not Assigned';
            } else {
                approverName = expenseData.approvedBy;
            }
        } else if (expenseData.status === 'PENDING') {
            approverName = 'Pending Approval';
        }

        // Get all expense items
        const expenseItems = [];
        if (expenseData.expenses && typeof expenseData.expenses === 'object') {
            Object.entries(expenseData.expenses).forEach(([key, value]) => {
                expenseItems.push({
                    type: key.charAt(0).toUpperCase() + key.slice(1),
                    paymentMethod: value?.paymentMethod || '-',
                    amount: Number(value?.amount) || 0,
                });
            });
        }

        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        let yPosition = 15;

        const setText = (c) => doc.setTextColor(...c);
        const setFill = (c) => doc.setFillColor(...c);
        const setDraw = (c) => doc.setDrawColor(...c);

        const ensureSpace = (neededHeight, topMargin = 20) => {
            if (yPosition + neededHeight > pageHeight - 20) {
                doc.addPage();
                yPosition = topMargin;
                return true;
            }
            return false;
        };

        // ------ HEADER ------
        doc.setFontSize(20);
        setText(COLORS.primary);
        doc.text('EXPENSE DETAILS', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;

        setDraw(COLORS.primary);
        doc.setLineWidth(0.3);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;

        // ------ EMPLOYEE INFORMATION ------
        doc.setFontSize(12);
        setText(COLORS.textDark);
        doc.text('Employee Information', margin, yPosition);
        yPosition += 8;

        const empBoxHeight = 32;
        ensureSpace(empBoxHeight);

        setDraw(COLORS.border);
        setFill(COLORS.fillLight);
        doc.rect(margin, yPosition - 2, pageWidth - margin * 2, empBoxHeight, 'F');
        doc.rect(margin, yPosition - 2, pageWidth - margin * 2, empBoxHeight);

        doc.setFontSize(9);
        let lineY = yPosition + 6;
        const labelX = margin + 8;
        const valueX = margin + 45;

        setText(COLORS.textDark);
        doc.text('Email:', labelX, lineY);
        setText(COLORS.textMuted);
        doc.text(expenseData.employee?.email || '-', valueX, lineY);
        lineY += 7;

        setText(COLORS.textDark);
        doc.text('Grade:', labelX, lineY);
        setText(COLORS.textMuted);
        doc.text(expenseData.grade || '-', valueX, lineY);
        lineY += 7;

        setText(COLORS.textDark);
        doc.text('Travel Type:', labelX, lineY);
        setText(COLORS.textMuted);
        doc.text(expenseData.travelType || '-', valueX, lineY);
        lineY += 7;

        setText(COLORS.textDark);
        doc.text('Status:', labelX, lineY);
        const statusColor =
            expenseData.status === 'APPROVED' ? COLORS.success :
            expenseData.status === 'REJECTED' ? COLORS.danger :
            COLORS.warning;
        setText(statusColor);
        doc.text(expenseData.status || '-', valueX, lineY);

        yPosition += empBoxHeight + 6;

        // ------ TRIP DETAILS ------
        doc.setFontSize(12);
        setText(COLORS.textDark);
        doc.text('Trip Details', margin, yPosition);
        yPosition += 8;

        const tripLabelX = margin + 8;
        const tripValueX = margin + 42;
        const tripMaxWidth = pageWidth - margin - tripValueX - 8 + margin; // usable width for wrapped text
        const wrapWidth = pageWidth - margin - (tripValueX - margin) - 8;

        // Pre-compute wrapped lines so we know the real box height up front (was previously
        // a fixed 40mm box that could overflow when Purpose/From/To text wrapped to extra lines).
        doc.setFontSize(9);
        const purposeLines = doc.splitTextToSize(expenseData.businessPurpose || '-', wrapWidth);
        const fromLines = doc.splitTextToSize(expenseData.fromLocation || '-', wrapWidth);
        const toLines = doc.splitTextToSize(expenseData.toLocation || '-', wrapWidth);

        const rowGap = 2;
        const lineHeight = 5;
        const tripBoxHeight =
            6 + // top padding before first row
            purposeLines.length * lineHeight + rowGap +
            fromLines.length * lineHeight + rowGap +
            toLines.length * lineHeight + rowGap +
            lineHeight + 4; // distance/date row + bottom padding

        ensureSpace(tripBoxHeight);

        setDraw(COLORS.border);
        setFill(COLORS.fillLight);
        doc.rect(margin, yPosition - 2, pageWidth - margin * 2, tripBoxHeight, 'F');
        doc.rect(margin, yPosition - 2, pageWidth - margin * 2, tripBoxHeight);

        let tripY = yPosition + 6;

        // Purpose
        setText(COLORS.textDark);
        doc.text('Purpose:', tripLabelX, tripY);
        setText(COLORS.textMuted);
        doc.text(purposeLines, tripValueX, tripY);
        tripY += purposeLines.length * lineHeight + rowGap;

        // From
        setText(COLORS.textDark);
        doc.text('From:', tripLabelX, tripY);
        setText(COLORS.textMuted);
        doc.text(fromLines, tripValueX, tripY);
        tripY += fromLines.length * lineHeight + rowGap;

        // To
        setText(COLORS.textDark);
        doc.text('To:', tripLabelX, tripY);
        setText(COLORS.textMuted);
        doc.text(toLines, tripValueX, tripY);
        tripY += toLines.length * lineHeight + rowGap;

        // Distance & Date — placed on separate lines to avoid overlap when distance is long
        setText(COLORS.textDark);
        doc.text('Distance:', tripLabelX, tripY);
        setText(COLORS.textMuted);
        const distanceText = `${expenseData.distanceKm || expenseData.tripDistance || '0'} km`;
        doc.text(distanceText, tripValueX, tripY);

        const fromDateStr = expenseData.fromDate ? new Date(expenseData.fromDate).toLocaleDateString() : '-';
        const toDateStr = expenseData.toDate ? new Date(expenseData.toDate).toLocaleDateString() : '-';
        setText(COLORS.textDark);
        doc.text('Date:', tripLabelX + 70, tripY);
        setText(COLORS.textMuted);
        doc.text(`${fromDateStr} - ${toDateStr}`, tripLabelX + 90, tripY);

        yPosition += tripBoxHeight + 8;

        // ------ EXPENSE BREAKDOWN ------
        ensureSpace(20);
        doc.setFontSize(12);
        setText(COLORS.textDark);
        doc.text('Expense Breakdown', margin, yPosition);
        yPosition += 8;

        const tableStartX = margin + 5;
        const totalTableWidth = pageWidth - margin * 2 - 10;
        const typeWidth = totalTableWidth * 0.45;
        const methodWidth = totalTableWidth * 0.25;
        const amountWidth = totalTableWidth * 0.30;

        const typeX = tableStartX;
        const methodX = typeX + typeWidth;
        const amountX = methodX + methodWidth;

        const drawTableHeader = () => {
            setFill(COLORS.primary);
            doc.rect(tableStartX, yPosition, totalTableWidth, 8, 'F');
            setText(COLORS.white);
            doc.setFontSize(8);
            doc.text('Expense Type', typeX + 4, yPosition + 6);
            doc.text('Payment Method', methodX + 4, yPosition + 6);
            doc.text(`Amount (${CURRENCY_PREFIX.trim()})`, amountX + 4, yPosition + 6);
            yPosition += 10;
        };

        drawTableHeader();

        if (expenseItems.length > 0) {
            expenseItems.forEach((item, index) => {
                if (yPosition > 250) {
                    doc.addPage();
                    yPosition = 20;
                    drawTableHeader();
                }

                if (index % 2 === 0) {
                    setFill(COLORS.fillLight);
                    doc.rect(tableStartX, yPosition - 2, totalTableWidth, 8, 'F');
                }

                setText(COLORS.textDark);
                doc.setFontSize(8);

                const typeLines = doc.splitTextToSize(item.type, typeWidth - 8);
                doc.text(typeLines, typeX + 4, yPosition + 4);

                const methodLines = doc.splitTextToSize(item.paymentMethod, methodWidth - 8);
                doc.text(methodLines, methodX + 4, yPosition + 4);

                const amountText = formatAmount(item.amount);
                doc.text(amountText, amountX + 4, yPosition + 4);

                const maxLines = Math.max(typeLines.length, methodLines.length);
                const rowHeight = Math.max(8, maxLines * 5 + 2);
                yPosition += rowHeight;
            });
        } else {
            setText(COLORS.textLight);
            doc.setFontSize(9);
            doc.text('No expense details available', pageWidth / 2, yPosition + 5, { align: 'center' });
            yPosition += 12;
        }

        yPosition += 3;

        // ------ TOTAL ------
        ensureSpace(20);
        setDraw([200, 200, 200]);
        doc.setLineWidth(0.3);
        doc.line(tableStartX, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;

        doc.setFontSize(12);
        setText(COLORS.textDark);
        doc.text('Total Amount :', pageWidth - margin - 60, yPosition);
        setText(COLORS.primary);
        doc.setFontSize(14);
        doc.text(formatAmount(totalAmount), pageWidth - margin, yPosition, { align: 'right' });

        yPosition += 15;

        // ------ BOTTOM SECTION ------
        ensureSpace(20);

        setDraw([200, 200, 200]);
        doc.setLineWidth(0.3);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;

        // Left: Employee Name
        doc.setFontSize(9);
        setText(COLORS.textDark);
        doc.text('Employee:', margin, yPosition);
        setText(COLORS.textMuted);
        doc.text(employeeName, margin + 28, yPosition);

        // Right: Approver Name
        setText(COLORS.textDark);
        const approverLabel = expenseData.status === 'PENDING' ? 'Approval Status:' : 'Approved By:';
        doc.text(approverLabel, pageWidth - margin - 75, yPosition);
        setText(COLORS.textMuted);
        doc.text(approverName, pageWidth - margin, yPosition, { align: 'right' });

        yPosition += 8;

        // ------ FOOTER ------
        doc.setFontSize(7);
        setText(COLORS.textLight);
        doc.text(`Generated: ${new Date().toLocaleString()}`, margin, pageHeight - 8);
        doc.text('System Generated Document', pageWidth - margin, pageHeight - 8, { align: 'right' });

        // Save the PDF
        const safeName = String(employeeName).replace(/\s+/g, '_').replace(/[^\w-]/g, '');
        const fileName = `Expense_${safeName}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        return true;

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
        return false;
    }
};
