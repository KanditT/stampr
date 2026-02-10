
import React, { useEffect, useRef, useState } from 'react';

// Use jsQR from the window object
declare const jsQR: any;

interface QRScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationId: number;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.play().catch(e => console.log("Play aborted:", e));
          requestAnimationFrame(tick);
        }
      } catch (err) {
        setError("Unable to access camera. Please ensure you have given permission.");
        console.error(err);
      }
    };

    const tick = () => {
      if (!isScanning) return;
      
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });

            if (code) {
              setIsScanning(false);
              onScan(code.data);
              return;
            }
          }
        }
      }
      animationId = requestAnimationFrame(tick);
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      cancelAnimationFrame(animationId);
    };
  }, [onScan, isScanning]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-90 p-4">
      <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden border-4 border-white/20">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-zinc-900">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-white text-black rounded-full font-bold"
            >
              Go Back
            </button>
          </div>
        ) : (
          <>
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-dashed border-white opacity-50 rounded-xl" />
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 animate-pulse opacity-50" />
            </div>
          </>
        )}
      </div>

      <p className="mt-8 text-white text-lg font-medium text-center">
        Align the QR code within the frame to scan
      </p>

      <button 
        onClick={onClose}
        className="mt-8 px-8 py-3 bg-zinc-800 text-white rounded-full hover:bg-zinc-700 transition-colors"
      >
        Cancel
      </button>

      {/* Manual Input Fallback for Demo */}
      <div className="mt-4">
        <button 
          onClick={() => {
            const code = prompt("Enter QR Code manually (e.g., STAMPR_START_2024 or loc_001):");
            if (code) onScan(code);
          }}
          className="text-zinc-500 text-sm underline"
        >
          Debug: Manual Code Input
        </button>
      </div>
    </div>
  );
};

export default QRScanner;
