// File: src\components\expanse\ReceiptModal.jsx

import React, { useState } from 'react';
import { X, Download, Loader, FileImage } from 'lucide-react';

const ReceiptModal = ({ receipt, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadingIndex, setDownloadingIndex] = useState(null);

  if (!receipt) return null;

  // Get all receipt URLs (support multiple images)
  const getReceiptUrls = () => {
    // Check if there are multiple receipts
    if (receipt.receipts && Array.isArray(receipt.receipts)) {
      return receipt.receipts.filter(url => url);
    }
    
    // Check for single receipt in various fields
    const urls = [];
    const singleReceipt = receipt.receipt || receipt.receiptUrl || receipt.imageUrl || receipt.url || receipt.receiptImage;
    if (singleReceipt) {
      urls.push(singleReceipt);
    }
    
    // Check for multiple images in a single field (comma separated)
    if (receipt.images && typeof receipt.images === 'string') {
      const splitUrls = receipt.images.split(',').filter(url => url.trim());
      urls.push(...splitUrls);
    }
    
    return urls;
  };

  const receiptUrls = getReceiptUrls();
  console.log('Receipt URLs:', receiptUrls);

  // Simple download function
  const downloadImage = async (url, index) => {
    try {
      setDownloadingIndex(index);
      
      // If it's a base64 image
      if (url.startsWith('data:image')) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `receipt_${index + 1}_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloadingIndex(null);
        return;
      }

      // If it's a blob URL
      if (url.startsWith('blob:')) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `receipt_${index + 1}_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloadingIndex(null);
        return;
      }

      // For regular URLs - open in new tab and let user save
      window.open(url, '_blank');
      alert(`Receipt ${index + 1} opened in new tab. Please right-click and select "Save as" to download.`);
      setDownloadingIndex(null);
      
    } catch (error) {
      console.error('Error downloading image:', error);
      alert(`Error downloading receipt ${index + 1}. Please try again.`);
      setDownloadingIndex(null);
    }
  };

  // Download all receipts as zip (simple approach - download one by one)
  const downloadAll = async () => {
    if (!receiptUrls || receiptUrls.length === 0) {
      alert('No receipt images available to download');
      return;
    }

    setDownloading(true);

    try {
      for (let i = 0; i < receiptUrls.length; i++) {
        await downloadImage(receiptUrls[i], i);
        // Add a small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      alert(`All ${receiptUrls.length} receipt(s) downloaded!`);
    } catch (error) {
      console.error('Error downloading all:', error);
      alert('Error downloading all receipts. Please try downloading individually.');
    } finally {
      setDownloading(false);
    }
  };

  // Open receipt in new tab
  const openInNewTab = (url) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-start z-50 pt-10 pb-10">
      <div className="bg-gradient-to-br from-[#032446] to-[#1e2f4f] rounded-lg mx-4 border border-white/20 shadow-2xl max-h-[90vh] w-[90vw] max-w-4xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/20 sticky top-0 bg-[#032446] z-10">
          <h4 className="text-white font-semibold text-lg flex items-center gap-2">
            <FileImage size={20} className="text-blue-400" />
            Receipt View {receiptUrls.length > 1 && `(${receiptUrls.length} images)`}
          </h4>
          <div className="flex items-center gap-3 flex-wrap">
            {receiptUrls.length > 0 && (
              <>
                {receiptUrls.length > 1 && (
                  <button
                    onClick={downloadAll}
                    disabled={downloading}
                    className="flex items-center gap-2 px-4 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff6b35]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloading ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download size={18} />
                        Download All ({receiptUrls.length})
                      </>
                    )}
                  </button>
                )}
              </>
            )}
            <button
              onClick={onClose}
              className="text-white hover:text-red-400 cursor-pointer transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body - Show receipts */}
        <div className="flex-1 overflow-y-auto p-6">
          {receiptUrls.length > 0 ? (
            <div className="space-y-6">
              {receiptUrls.map((url, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-white/70 text-sm">Receipt {index + 1}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openInNewTab(url)}
                        className="text-xs px-3 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors cursor-pointer"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => downloadImage(url, index)}
                        disabled={downloadingIndex === index}
                        className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {downloadingIndex === index ? 'Downloading...' : 'Download'}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-center bg-black/20 rounded-lg p-2 min-h-[200px]">
                    {url && url.toLowerCase().includes('.pdf') ? (
                      <iframe
                        src={url}
                        className="w-full h-[400px] rounded-lg"
                        title={`Receipt ${index + 1}`}
                      />
                    ) : (
                      <img
                        src={url}
                        alt={`Receipt ${index + 1}`}
                        className="max-w-full max-h-[400px] object-contain rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const parent = e.target.parentElement;
                          const fallback = document.createElement('div');
                          fallback.className = 'text-center text-gray-400 py-10';
                          fallback.innerHTML = `
                            <p class="text-lg">Unable to load receipt ${index + 1}</p>
                            <button 
                              onclick="window.open('${url}', '_blank')" 
                              class="mt-2 px-4 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff6b35]/80 transition-colors cursor-pointer"
                            >
                              Open in New Tab
                            </button>
                          `;
                          parent.appendChild(fallback);
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-10">
              <p className="text-lg">No receipts uploaded</p>
              <p className="text-sm mt-2">This expense request doesn't have any attached receipts</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/20 sticky bottom-0 bg-[#032446] flex justify-between items-center">
          <span className="text-gray-400 text-sm">
            {receiptUrls.length} receipt{receiptUrls.length !== 1 ? 's' : ''} found
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#ff6b35] cursor-pointer text-md text-white rounded-lg transition-colors hover:bg-[#ff6b35]/80"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;