import { useState, useEffect, useRef } from 'react';
import { Camera, X, AlertCircle, CheckCircle } from 'lucide-react';
import jsQR from 'jsqr';

const QRScanner = ({ onScan, onClose, isOpen }) => {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [mockMode, setMockMode] = useState(process.env.NODE_ENV === 'development');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError('');
      setScanning(true);

      // Check if device supports camera
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      // Start QR code scanning
      startQRScanning();
    } catch (err) {
      console.error('Camera error:', err);
      setError(err.message || 'Failed to access camera');
      setScanning(false);
    }
  };

  const stopCamera = () => {
    setScanning(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startQRScanning = () => {
    // Real QR code scanning with jsQR library
    intervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current && scanning) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data for QR code detection
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Use jsQR to detect QR codes
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code) {
          console.log('QR Code detected:', code.data);
          setScannedCode(code.data);
          setScanning(false);
          
          // Stop camera and call onScan
          stopCamera();
          onScan(code.data);
        }
      }
    }, 100); // Check every 100ms for better responsiveness
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  // Mock QR code testing for development
  const generateMockQRCode = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `DRONE-TEST-${timestamp}-${random}`.toUpperCase();
  };

  const testMockQRCode = () => {
    const mockCode = generateMockQRCode();
    console.log('🚁 Development mode: Testing mock QR code:', mockCode);
    
    // Simulate scanning delay
    setTimeout(() => {
      setScannedCode(mockCode);
      setScanning(false);
      onScan(mockCode);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Scan QR Code</h3>
          <div className="flex items-center gap-2">
            {/* Mock Mode Toggle for Development */}
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={() => setMockMode(!mockMode)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  mockMode 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
              >
                {mockMode ? '🚁 Mock' : '📷 Real'}
              </button>
            )}
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="relative">
          {error ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto text-red-500 mb-2" size={48} />
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Try Again
              </button>
            </div>
          ) : scanning ? (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover rounded-lg"
                autoPlay
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-blue-500 rounded-lg relative">
                  {/* Corner indicators */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-blue-500"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-blue-500"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-blue-500"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-blue-500"></div>
                  
                  {/* Scanning line animation */}
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500 animate-pulse"></div>
                </div>
              </div>
              
              <p className="text-center mt-4 text-gray-600">
                Position the QR code within the frame
              </p>
              
              {/* Mock Testing Button for Development */}
              {mockMode && (
                <div className="mt-4 text-center">
                  <button
                    onClick={testMockQRCode}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    🚁 Test Mock QR Code
                  </button>
                  <p className="text-xs text-green-600 mt-2">
                    Development mode: Test QR scanning without camera
                  </p>
                </div>
              )}
            </div>
          ) : scannedCode ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto text-green-500 mb-2" size={48} />
              <p className="text-green-600 mb-2">QR Code Scanned!</p>
              <p className="text-sm text-gray-600 break-all">{scannedCode}</p>
            </div>
          ) : null}
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            {scanning 
              ? 'Point your camera at a QR code'
              : 'Camera access required for scanning'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
