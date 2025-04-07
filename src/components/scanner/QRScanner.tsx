import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, ArrowLeft, HelpCircle, Image as ImageIcon, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AmountInput from '@/components/ui/amount-input';
import { useToast } from '@/hooks/use-toast';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';

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
  am?: string; // Pre-filled amount from QR
}

const QR_READER_ID = 'qr-reader-container';

const QRScanner = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scanCompleted, setScanCompleted] = useState(false);
  const [upiData, setUpiData] = useState<UPIData | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [hasTorchSupport, setHasTorchSupport] = useState(false);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse UPI URL to get payment details
  const parseUPIUrl = (url: string): UPIData | null => {
    try {
      if (!url.startsWith('upi://pay?')) {
        console.warn('Scanned QR is not a UPI payment link:', url);
        return null;
      }

      const params = new URLSearchParams(url.substring(url.indexOf('?')));
      const data: UPIData = {
        pa: params.get('pa') || '',
        pn: params.get('pn') || 'Unknown Payee', // Default name if not present
      };

      if (!data.pa) {
        console.warn('UPI QR code missing mandatory payee address (pa)');
        return null; // 'pa' is mandatory
      }

      // Add optional parameters if they exist
      ['mc', 'tid', 'tr', 'tn', 'url', 'mode', 'purpose', 'am'].forEach(param => {
        const value = params.get(param);
        if (value) {
          data[param as keyof UPIData] = value;
        }
      });

      // If QR code has amount pre-filled, use it
      if (data.am) {
        setAmount(data.am);
      }

      return data;
    } catch (error) {
      console.error('Error parsing UPI URL:', error);
      return null;
    }
  };

  const onScanSuccess = (decodedText: string) => {
    console.log('Scan successful:', decodedText);
    stopScanner(); // Stop scanning immediately after success

    const parsedUPIData = parseUPIUrl(decodedText);
    if (parsedUPIData) {
      setUpiData(parsedUPIData);
      setScanCompleted(true);
      console.log('Parsed UPI Data:', parsedUPIData);
    } else {
      toast({
        title: "Invalid QR Code",
        description: "Scanned QR is not a valid UPI payment code. Please try again.",
        variant: "destructive"
      });
      // Restart scanner if invalid QR? Or let user close/retry? For now, just show toast.
      // Consider restarting the scanner here if desired: startScanner();
    }
  };

  const onScanFailure = (error: any) => {
    // This callback is called frequently, ignore common errors
    if (error?.name !== 'NotFoundException') {
        console.warn(`Code scan error = ${error}`);
    }
  };

  const startScanner = async () => {
    if (!isOpen || scanCompleted || qrScannerRef.current?.getState() === Html5QrcodeScannerState.SCANNING) return;

    console.log('Initializing QR Scanner...');
    try {
      qrScannerRef.current = new Html5Qrcode(QR_READER_ID);
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        // Disable default result showing, we handle it ourselves
        showPossibleFormats: false, 
        rememberLastUsedCamera: true,
        supportedScanTypes: [], // Use default scan types
      };

      await qrScannerRef.current.start(
        { facingMode: "environment" }, // Prefer back camera
        config,
        onScanSuccess,
        onScanFailure
      );
      console.log('QR Scanner started.');

      // Check for torch support after starting
      setTimeout(async () => {
          if (qrScannerRef.current?.getState() === Html5QrcodeScannerState.SCANNING) {
              const capabilities = qrScannerRef.current?.getRunningTrackCameraCapabilities();
              const torchSupported = !!capabilities?.torchFeature?.isSupported;
              setHasTorchSupport(torchSupported);
              console.log('Torch support:', torchSupported);
          }
      }, 500); // Give camera time to initialize

    } catch (err) {
      console.error("Error starting QR scanner:", err);
      toast({
        title: "Camera Error",
        description: "Could not start camera. Please check permissions and try again.",
        variant: "destructive"
      });
      handleClose(); // Close scanner on critical error
    }
  };

  const stopScanner = async () => {
    console.log('Attempting to stop QR Scanner...');
    if (qrScannerRef.current && qrScannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
      try {
        await qrScannerRef.current.stop();
        qrScannerRef.current = null; // Clear ref after stopping
        setIsTorchOn(false); // Turn off torch if it was on
        setHasTorchSupport(false);
        console.log('QR Scanner stopped successfully.');
      } catch (err) {
        console.error("Error stopping QR scanner:", err);
        // Don't toast here usually, as it might happen during normal close
      }
    } else {
        console.log('QR Scanner not running or already stopped.');
    }
  };

  const toggleTorch = async () => {
    if (qrScannerRef.current && qrScannerRef.current.getState() === Html5QrcodeScannerState.SCANNING && hasTorchSupport) {
      try {
        const newState = !isTorchOn;
        await qrScannerRef.current.applyVideoConstraints({
            //@ts-ignore - advanced constraints might not be typed perfectly
            advanced: [{ torch: newState }] 
        });
        setIsTorchOn(newState);
        console.log('Torch toggled:', newState);
      } catch (err) {
        console.error("Error toggling torch:", err);
        toast({ title: "Torch Error", description: "Could not control flashlight.", variant: "destructive"});
      }
    } else {
        console.warn('Torch toggle ignored: Scanner not running or torch not supported.');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && qrScannerRef.current) {
        console.log('Scanning uploaded file:', file.name);
        try {
            // Ensure scanner is stopped before scanning file
            await stopScanner(); 
            // Need to re-initialize scanner instance for file scanning
            qrScannerRef.current = new Html5Qrcode(QR_READER_ID); 
            const decodedText = await qrScannerRef.current.scanFile(file, false);
            onScanSuccess(decodedText);
        } catch (err) {
            console.error("Error scanning file:", err);
            toast({ title: "File Scan Error", description: "Could not scan the selected QR code image.", variant: "destructive"});
            // Restart camera scanner after file scan attempt?
            startScanner(); 
        } finally {
             // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }
  };

  const handlePay = () => {
    if (!amount || Number(amount) <= 0) {
      toast({ title: "Invalid amount", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }
    if (!upiData) {
      toast({ title: "Invalid QR data", description: "Missing payment details.", variant: "destructive" });
      return;
    }

    const upiURL = new URL('upi://pay');
    const params = new URLSearchParams();
    params.append('pa', upiData.pa);
    params.append('pn', upiData.pn);
    params.append('am', amount);
    if (note) params.append('tn', note); // Add transaction note if present

    // Add other optional parameters from QR if they exist
    if (upiData.mc) params.append('mc', upiData.mc);
    if (upiData.tid) params.append('tid', upiData.tid);
    if (upiData.tr) params.append('tr', upiData.tr);
    if (upiData.url) params.append('url', upiData.url);
    if (upiData.mode) params.append('mode', upiData.mode);
    if (upiData.purpose) params.append('purpose', upiData.purpose);
    
    const deepLink = `${upiURL}?${params.toString()}`;
    console.log('Attempting UPI Deep Link:', deepLink);

    // Trigger the UPI deep link
    window.location.href = deepLink;

    // Store details for confirmation screen
    const paymentDetails = {
      amount,
      upiData,
      note
    };

    // Navigate to confirmation screen *after* attempting deep link
    // We'll need a slight delay to allow the browser to process the deep link
    setTimeout(() => {
      navigate('/payment-confirmation', { state: { paymentDetails } });
      // Close the scanner *after* navigating
      handleClose();
    }, 100); // Short delay

    // Don't close immediately or navigate here
    // handleClose(); 

    // Note: The check for whether a UPI app handled the link is difficult and unreliable.
    // We generally assume it works or the OS/browser handles the failure.
  };

  const handleClose = () => {
    stopScanner(); // Ensure scanner is stopped on close
    onClose();
    // Reset state for next time
    setScanCompleted(false);
    setUpiData(null);
    setAmount('');
    setNote('');
    setIsTorchOn(false);
  };

  // Effect to start/stop scanner when modal opens/closes
  useEffect(() => {
    if (isOpen && !scanCompleted) {
      // Delay start slightly to allow modal animation
      const timer = setTimeout(() => {
      startScanner();
      }, 100); 
      return () => clearTimeout(timer);
    } else if (!isOpen) {
      stopScanner();
    }
    // Ensure cleanup happens if component unmounts while open
    return () => { stopScanner(); };
  }, [isOpen]);

  // Effect to stop scanner when scan completes
   useEffect(() => {
    if (scanCompleted) {
        stopScanner();
    }
  }, [scanCompleted]);


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col bg-black/95 text-white" // Full screen dark overlay
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 pt-6">
             <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full text-white hover:bg-white/10">
               <ArrowLeft size={24} />
             </Button>
             <h2 className="text-xl font-semibold">Scan any QR</h2>
             <Button variant="ghost" size="icon" onClick={() => toast({title: "Help", description: "Position the QR code within the frame."})} className="rounded-full text-white hover:bg-white/10">
                <HelpCircle size={24} />
              </Button>
            </div>

          {/* Scanner / Amount Entry Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            {!scanCompleted ? (
              <>
                {/* Scanner Viewport */}
                <div className="relative w-64 h-64 md:w-80 md:h-80 mb-8">
                   <div id={QR_READER_ID} className="w-full h-full overflow-hidden rounded-lg">
                       {/* Html5QrcodeScanner renders camera feed here */}
                   </div>
                   {/* Corner Guides */}
                   <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                   </div>
                </div>

                {/* Controls */}
                <div className="flex items-center space-x-8">
                   <input 
                     type="file" 
                     ref={fileInputRef} 
                     accept="image/png, image/jpeg, image/gif" 
                     onChange={handleFileUpload}
                     className="hidden" 
                   />
                   <button 
                     onClick={() => fileInputRef.current?.click()}
                     className="flex flex-col items-center text-white hover:text-primary transition-colors"
                   >
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-1">
                         <ImageIcon size={24} />
                      </div>
                      <span className="text-xs">Upload QR</span>
                   </button>

                   {hasTorchSupport && (
                    <button 
                        onClick={toggleTorch}
                        className={`flex flex-col items-center text-white hover:text-primary transition-colors ${isTorchOn ? 'text-primary' : ''}`}
                    >
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-1">
                            <Zap size={24} />
                  </div>
                        <span className="text-xs">Torch</span>
                    </button>
                   )}
              </div>
              </>
            ) : (
              /* Amount Entry View - Simplified Layout */
              <div className="w-full max-w-sm flex flex-col items-center bg-gray-900 text-white rounded-t-2xl p-6 pt-8">
                <div className='w-full'>
                    <div className="flex flex-col items-center mb-6 text-center">
                        {/* Payee Details */}
                        <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-semibold text-gray-400 mb-3">
                         {upiData?.pn ? upiData.pn.substring(0, 1).toUpperCase() : '?'}
                        </div>
                        <p className="text-lg font-semibold text-white">
                            Paying {upiData?.pn || 'Merchant'}
                        </p>
                        <p className="text-sm text-gray-400">
                            {upiData?.pa}
                        </p>
                    </div>

                    {/* Amount Input - Ensure bg-transparent makes it dark */}
                    <div className="mb-4">
                        <AmountInput
                            value={amount}
                            onChange={setAmount}
                            placeholder="Enter amount"
                            className="w-full"
                            inputClassName="text-4xl placeholder:text-xl font-bold text-center focus:ring-0 h-auto bg-transparent text-white w-full border border-primary rounded-xl py-3 pr-4 placeholder-gray-400"
                            disabled={!!upiData?.am}
                        />
                         {upiData?.am && (
                             <p className="text-xs text-center text-gray-400 mt-1">Amount fixed by merchant</p>
                         )}
                    </div>

                    {/* Note Input */}
                    <div className="relative mb-6">
                         <input 
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Add a note (Optional)"
                            className="w-full px-4 py-2 border-b border-gray-600 bg-transparent focus:outline-none focus:border-primary text-white placeholder-gray-500"
                         />
                    </div>
                    
                    {/* Button - Moved inside the content div */}
                    <Button
                        onClick={handlePay}
                        className="w-full py-4 text-lg rounded-xl btn-gradient mt-4" // Added mt-4 for spacing
                        disabled={!amount || Number(amount) <= 0 || !upiData}
                    >
                        Proceed to Pay
                    </Button>
                </div>

              </div>
            )}
          </div>

          {/* Footer Logos (only in scanner view) */}
          {!scanCompleted && (
            <div className="flex items-center justify-center space-x-4 p-4 pb-6 opacity-50">
              {/* Placeholder for BHIM/UPI logos - Replace with actual SVGs if available */}
              <span className="text-xs font-semibold">BHIM</span>
              <div className="h-4 w-px bg-white"></div>
              <span className="text-xs font-semibold">UPI</span>
            </div>
           )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QRScanner;
