
import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { LOCATIONS, BOOK_INIT_CODE } from '../constants';

const QRGenerator: React.FC = () => {
  return (
    <div className="space-y-12 pb-20">
      <div className="bg-dreamy-surface border border-dreamy-border p-6 rounded-3xl">
        <h2 className="text-xl font-display font-bold text-dreamy-text mb-2">Creator Studio</h2>
        <p className="text-dreamy-text-secondary text-sm">
          Generate and print these QR codes to set up your real-world stamp hunt. 
          Scanning the <b>Starter Code</b> unlocks the book for a new player.
        </p>
      </div>

      <section>
        <h3 className="text-dreamy-text-secondary uppercase tracking-widest text-[10px] font-bold mb-6 px-2">1. Initialization Code</h3>
        <QRCard value={BOOK_INIT_CODE} label="Starter QR" description="Scan this to initialize a new Stamp Book" isSpecial />
      </section>

      <section>
        <h3 className="text-dreamy-text-secondary uppercase tracking-widest text-[10px] font-bold mb-6 px-2">2. Location Codes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {LOCATIONS.map(loc => (
            <QRCard 
              key={loc.id} 
              value={loc.id} 
              label={loc.name} 
              description={loc.hint} 
            />
          ))}
        </div>
      </section>
    </div>
  );
};

interface QRCardProps {
  value: string;
  label: string;
  description: string;
  isSpecial?: boolean;
}

const QRCard: React.FC<QRCardProps> = ({ value, label, description, isSpecial }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: 200,
        margin: 2,
        color: {
          dark: '#5A4E72',
          light: '#ffffff',
        },
      });
    }
  }, [value]);

  const downloadQR = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `stamp-${label.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className={`bg-dreamy-surface p-6 rounded-4xl border shadow-dreamy flex flex-col items-center ${isSpecial ? 'border-dreamy-accent ring-4 ring-dreamy-accent/10' : 'border-dreamy-border'}`}>
      <div className="bg-white p-4 rounded-2xl mb-4">
        <canvas ref={canvasRef} className="max-w-full h-auto rounded-lg" />
      </div>
      <h4 className="font-display font-bold text-lg text-dreamy-text">{label}</h4>
      <p className="text-dreamy-text-secondary text-[10px] uppercase tracking-widest font-bold mt-1">Code: {value}</p>
      <p className="text-dreamy-text-secondary text-xs text-center mt-3 px-4 italic leading-relaxed">"{description}"</p>

      <button
        onClick={downloadQR}
        className="mt-6 flex items-center space-x-2 text-dreamy-text-secondary hover:text-dreamy-accent transition-colors no-print"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span className="text-xs font-bold uppercase tracking-wider">Download PNG</span>
      </button>
    </div>
  );
};

export default QRGenerator;
