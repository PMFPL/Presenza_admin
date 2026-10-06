// File: src\pages\expanse\hook\useRequestedExpanseList.js

import { useEffect, useMemo, useState, useRef } from "react";
import { getRequest, postRequest } from "../../../services/api/APIMethodCaller";

export const useRequestedExpanseList = () => {
    const [requestedExpanseList, setRequestedExpanseList] = useState([]);
    const [statusFilter, setStatusFilter] = useState('PENDING');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    
    // Use ref to track if component is mounted
    const isMounted = useRef(true);

    useEffect(() => {
        // Set mounted to true when component mounts
        isMounted.current = true;
        fetchRequestedExpanseList();
        
        // Cleanup function - set mounted to false when component unmounts
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Safe Status Extraction from List
    const status = useMemo(() => {
        return [...new Set(requestedExpanseList.map((e) => e?.status).filter(Boolean))];
    }, [requestedExpanseList]);

    const fetchRequestedExpanseList = async () => {
        try {
            if (isMounted.current) {
                setLoading(true);
                setError(null);
            }
            
            console.log("Fetching expense data...");
            const response = await getRequest('/expense');
            console.log("Full Response:", response);
            
            // Only update state if component is still mounted
            if (isMounted.current) {
                if (response.success) {
                    const data = response.data?.data || [];
                    console.log("Expense Data:", data);
                    setRequestedExpanseList(data);
                } else {
                    setError(response.error || 'Something went wrong');
                }
            }
        } catch (err) {
            console.error("Error fetching expenses:", err);
            if (isMounted.current) {
                setError(err.message || 'Failed to fetch expenses');
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
                console.log("Loading finished");
            }
        }
    };

    const handleExpanseApproval = async (empId) => {
        const confirmApproval = window.confirm("Are you sure you want to approve this expense request?");
        if (!confirmApproval) {
            return;
        }
        try {
            if (isMounted.current) setLoading(true);
            const response = await postRequest(`/expense/approve/${empId}`);
            console.log("Approve Response:", response);
            if (isMounted.current) {
                if (response.success) {
                    await fetchRequestedExpanseList();
                    // alert(response.message || 'Expense approved successfully');
                } else {
                    alert(response.data?.message || 'Failed to approve expense');
                }
            }
        } catch (err) {
            console.error('Approval error:', err);
            if (isMounted.current) {
                alert('Error approving expense');
            }
        } finally {
            if (isMounted.current) setLoading(false);
        }
    };

    const handleExpanseRejection = async (empId) => {
        const confirmRejection = window.confirm("Are you sure you want to reject this expense request?");
        if (!confirmRejection) {
            return;
        }
        try {
            if (isMounted.current) setLoading(true);
            const response = await postRequest(`/expense/reject/${empId}`);
            console.log("Reject Response:", response);
            if (isMounted.current) {
                if (response.success) {
                    await fetchRequestedExpanseList();
                    // alert(response.message || 'Expense rejected successfully');
                } else {
                    alert(response.data?.message || 'Failed to reject expense');
                }
            }
        } catch (err) {
            console.error('Rejection error:', err);
            if (isMounted.current) {
                alert('Error rejecting expense');
            }
        } finally {
            if (isMounted.current) setLoading(false);
        }
    };

    const filteredExpanseList = useMemo(() => {
        if (!statusFilter) return requestedExpanseList;
        return requestedExpanseList?.filter((list) => {
            return list.status === statusFilter;
        });
    }, [requestedExpanseList, statusFilter]);

    // Download Expense Report as CSV
    const downloadExpenseReport = () => {
        if (!requestedExpanseList || requestedExpanseList.length === 0) {
            alert("No expense data to download");
            return;
        }

        const exportData = requestedExpanseList.map((item, index) => {
            let totalAmount = 0;
            if (item.expenses && typeof item.expenses === 'object') {
                totalAmount = Object.values(item.expenses).reduce(
                    (sum, expense) => sum + (expense?.amount || 0),
                    0
                );
            }

            return {
                "S No": index + 1,
                "Email": item.employee?.email || "-",
                "Grade": item.grade || "-",
                "Purpose": item.businessPurpose || "-",
                "Travel Type": item.travelType || "-",
                "From": item.fromLocation || "-",
                "To": item.toLocation || "-",
                "Requested At": item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-",
                "Amount": totalAmount || 0,
                "Status": item.status || "-"
            };
        });

        const headers = Object.keys(exportData[0]);
        const csvRows = [
            headers.join(","),
            ...exportData.map(row =>
                headers.map(header => {
                    const value = row[header] || "";
                    return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
                }).join(",")
            )
        ];

        const csvData = csvRows.join("\n");
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Expense_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // View Receipt
    const viewReceipt = (receiptData) => {
        setSelectedReceipt(receiptData);
        setShowReceiptModal(true);
    };

    const closeReceiptModal = () => {
        setShowReceiptModal(false);
        setSelectedReceipt(null);
    };

    return {
        requestedExpanseList,
        filteredExpanseList,
        status,
        statusFilter,
        setStatusFilter,
        loading,
        error,
        fetchRequestedExpanseList,
        handleExpanseApproval,
        handleExpanseRejection,
        downloadExpenseReport,
        viewReceipt,
        showReceiptModal,
        selectedReceipt,
        closeReceiptModal
    };
};