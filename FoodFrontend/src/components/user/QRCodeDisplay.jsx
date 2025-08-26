import { useState } from 'react';
import { QrCode, Copy, CheckCircle } from 'lucide-react';

const QRCodeDisplay = ({ qrCode, orderId, onCopy }) => {
  const [copied, setCopied] = useState(false);
  const [mockQrCode, setMockQrCode] = useState('');

  // Generate mock QR code for development
  const generateMockQRCode = () => {
    if (process.env.NODE_ENV === 'development' && !qrCode) {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 8);
      const orderSuffix = orderId ? orderId.slice(-4) : 'TEST';
      return `DRONE-${orderSuffix}-${timestamp}-${random}`.toUpperCase();
    }
    return qrCode;
  };

  // Use mock QR code if in development and no real QR code provided
  const displayQrCode = generateMockQRCode();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrCode);
      setCopied(true);
      if (onCopy) onCopy();
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy QR code:', err);
    }
  };

  if (!displayQrCode) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Drone Delivery QR Code</h3>
      {process.env.NODE_ENV === 'development' && !qrCode && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
          🚁 Development Mode: Mock QR code generated for testing
        </div>
      )}
      <p className="text-gray-600 mb-4">
        This QR code will be displayed on your drone or sent via SMS/email when the drone is nearby.
      </p>
      
      <div className="space-y-4">
        {/* QR Code Visual Representation */}
        <div className="flex justify-center">
          <div className="p-4 bg-gray-100 rounded-lg">
            <div className="w-32 h-32 bg-white border-2 border-gray-300 flex items-center justify-center">
              <QrCode className="w-20 h-20 text-gray-600" />
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">QR Code Visual</p>
          </div>
        </div>
        
        {/* QR Code Text */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                QR Code Value:
              </label>
              <code className="text-sm bg-white px-3 py-2 rounded border font-mono">
                {displayQrCode}
              </code>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">How to Use:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>When your drone arrives, it will display this QR code</li>
            <li>Scan the QR code with your phone camera or enter it manually</li>
            <li>Click "Confirm Delivery" to complete your order</li>
            <li>The QR code expires in 5 minutes for security</li>
          </ol>
        </div>
        
        {/* Order Info */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Order ID:</span> {orderId?.slice(-8)}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Generated:</span> {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
