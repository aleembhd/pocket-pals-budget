import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AmountInput from '@/components/ui/amount-input';
import { useToast } from '@/hooks/use-toast';

const QRScanner = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanCompleted, setScanCompleted] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [amount, setAmount] = useState('');
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraPermission(true);
        
        // In a real app, we would implement actual QR code scanning
        // For this demo, we'll simulate a scan after 3 seconds
        setTimeout(() => {
          simulateQRScan();
        }, 3000);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setCameraPermission(false);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to scan QR codes",
        variant: "destructive"
      });
    }
  };

  const simulateQRScan = () => {
    // Simulate finding a UPI QR code
    const fakeQRValue = "upi://pay?pa=example@okbank&pn=Example%20Merchant";
    setQrValue(fakeQRValue);
    setScanCompleted(true);
    
    // Stop the camera stream
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const handlePay = () => {
    if (!amount || Number(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    // Extract UPI details from the scanned QR code
    // In a real app, you'd parse the actual scanned value
    // For demo purposes, we're using our fake QR value which already has UPI format
    
    try {
      // UPI QR codes typically have this format: upi://pay?pa=xyz@upi&pn=Name&am=100&tn=Note
      const qrUrl = new URL(qrValue);
      
      if (qrUrl.protocol === 'upi:') {
        const searchParams = new URLSearchParams(qrUrl.search);
        
        // Get recipient information from the QR
        const pa = searchParams.get('pa') || 'example@upi'; // Payment address 
        const pn = searchParams.get('pn') || 'Example Merchant'; // Payee name
        
        // Create new UPI parameters with the user-entered amount
        const upiParams = new URLSearchParams({
          pa: pa,
          pn: pn,
          am: amount,
          tn: 'QR Payment',
          cu: 'INR'
        });
        
        const upiUrl = `upi://pay?${upiParams.toString()}`;
        
        // Log the deep link for debugging
        console.log('Opening UPI deep link from QR:', upiUrl);
        
        // Use window.location to trigger the deep link
        window.location.href = upiUrl;
        
        // Set a timeout to navigate to the confirmation screen
        // This gives time for the payment app to open before we navigate away
        setTimeout(() => {
          navigate('/payment-confirmation', {
            state: {
              amount,
              paymentMode: 'UPI',
              description: 'QR Payment'
            }
          });
          onClose();
        }, 500);
        
        return;
      }
    } catch (err) {
      console.error('Error parsing QR code:', err);
    }
    
    // Fallback if QR parsing fails or it's not a UPI QR code
    toast({
      title: "QR Code processed",
      description: "Redirecting to payment confirmation"
    });
    
    navigate('/payment-confirmation', {
      state: {
        amount,
        paymentMode: 'UPI',
        description: 'QR Payment'
      }
    });
    
    onClose();
  };

  // Start scanner when component mounts and is open
  React.useEffect(() => {
    if (isOpen && !scanCompleted) {
      startScanner();
    }
    
    // Cleanup function to stop camera when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-4 mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold dark:text-white">
                {scanCompleted ? "Enter Payment Amount" : "Scan QR Code"}
              </h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="rounded-full"
              >
                <X size={20} />
              </Button>
            </div>

            {!scanCompleted ? (
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 relative mb-4">
                {cameraPermission === false && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <QrCode size={48} className="mb-2 text-gray-400" />
                    <p className="text-gray-500 dark:text-gray-400">Camera access is required to scan QR codes.</p>
                    <Button 
                      onClick={startScanner} 
                      className="mt-4"
                    >
                      Try Again
                    </Button>
                  </div>
                )}
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline
                  className="w-full h-full object-cover"
                ></video>
                <div className="absolute inset-0 border-2 border-primary rounded-xl"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl bg-gray-100 dark:bg-gray-900 p-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">QR Scanned</p>
                  <p className="text-sm font-medium truncate">{qrValue}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enter Amount
                  </label>
                  <AmountInput
                    value={amount}
                    onChange={setAmount}
                    placeholder="0"
                  />
                </div>
                
                <Button 
                  onClick={handlePay}
                  className="w-full py-6 text-lg rounded-xl btn-gradient"
                >
                  Pay Now
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QRScanner;
