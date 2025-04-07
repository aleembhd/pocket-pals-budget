import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AmountInput from '@/components/ui/amount-input';
import { useToast } from '@/hooks/use-toast';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface UPIData {
  pa: string;  // payee address
  pn: string;  // payee name
  mc?: string; // merchant code
  tid?: string; // transaction id
  tr?: string; // transaction reference
  tn?: string; // transaction note
  url?: string; // url
  mode?: string; // mode
  purpose?: string; // purpose
}

const QRScanner = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scanCompleted, setScanCompleted] = useState(false);
  const [upiData, setUpiData] = useState<UPIData | null>(null);
  const [amount, setAmount] = useState('');
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);

  // Parse UPI URL to get payment details
  const parseUPIUrl = (url: string): UPIData | null => {
    try {
      if (!url.startsWith('upi://pay?')) {
        return null;
      }

      const params = new URLSearchParams(url.substring(url.indexOf('?')));
      const data: UPIData = {
        pa: params.get('pa') || '',
        pn: params.get('pn') || '',
      };

      // Add optional parameters if they exist
      ['mc', 'tid', 'tr', 'tn', 'url', 'mode', 'purpose'].forEach(param => {
        const value = params.get(param);
        if (value) {
          data[param as keyof UPIData] = value;
        }
      });

      return data;
    } catch (error) {
      console.error('Error parsing UPI URL:', error);
      return null;
    }
  };

  const initializeScanner = () => {
    if (!isOpen) return;

    const qrScanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1,
      showTorchButtonIfSupported: true,
    });

    qrScanner.render((decodedText) => {
      // Handle successful scan
      const parsedUPIData = parseUPIUrl(decodedText);
      
      if (parsedUPIData) {
        setUpiData(parsedUPIData);
        setScanCompleted(true);
        qrScanner.clear();
      } else {
        toast({
          title: "Invalid QR Code",
          description: "Please scan a valid UPI payment QR code",
          variant: "destructive"
        });
      }
    }, (errorMessage) => {
      // Continue scanning - no need to handle errors for ongoing scanning
    });

    setScanner(qrScanner);
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

    if (!upiData) {
      toast({
        title: "Invalid QR data",
        description: "Please scan a valid UPI QR code",
        variant: "destructive"
      });
      return;
    }

    // Construct UPI deep link URL with all available parameters
    const upiURL = new URL('upi://pay');
    const params = new URLSearchParams();
    params.append('pa', upiData.pa);
    params.append('pn', upiData.pn);
    params.append('am', amount);
    
    // Add optional parameters if they exist
    if (upiData.mc) params.append('mc', upiData.mc);
    if (upiData.tid) params.append('tid', upiData.tid);
    if (upiData.tr) params.append('tr', upiData.tr);
    if (upiData.tn) params.append('tn', upiData.tn);
    if (upiData.url) params.append('url', upiData.url);
    if (upiData.mode) params.append('mode', upiData.mode);
    if (upiData.purpose) params.append('purpose', upiData.purpose);

    // Create the deep link
    const deepLink = `${upiURL}?${params.toString()}`;

    // Try to open the UPI deep link
    window.location.href = deepLink;

    // Set a timeout to check if the deep link was handled
    setTimeout(() => {
      // If we're still here after 1 second, assume no UPI app handled the deep link
      toast({
        title: "No UPI app found",
        description: "Please install a UPI payment app to proceed",
        variant: "destructive"
      });
    }, 1000);
    
    onClose();
  };

  useEffect(() => {
    if (isOpen && !scanCompleted) {
      initializeScanner();
    }

    return () => {
      if (scanner) {
        scanner.clear();
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
                onClick={() => {
                  if (scanner) {
                    scanner.clear();
                  }
                  onClose();
                }}
                className="rounded-full"
              >
                <X size={20} />
              </Button>
            </div>

            {!scanCompleted ? (
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 relative mb-4">
                <div id="qr-reader" className="w-full h-full"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl bg-gray-100 dark:bg-gray-900 p-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Paying to</p>
                  <p className="text-sm font-medium">{upiData?.pn}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{upiData?.pa}</p>
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
