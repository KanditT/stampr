
import React, { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import { AppState, Stamp, Location, PendingStamp } from './types';
import { LOCATIONS, STAMP_STYLES, STAMP_COLORS } from './constants';
import { generateStampLore } from './services/geminiService';
import QRScanner from './components/QRScanner';
import StampItem from './components/StampItem';
import QRGenerator from './components/QRGenerator';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('heart_of_music_v6');
    return saved ? JSON.parse(saved) : { hasBook: true, collectedStamps: {} };
  });

  const [view, setView] = useState<'book' | 'creator'>('book');
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  
  const [discoveredRoom, setDiscoveredRoom] = useState<Location | null>(null);
  const [pendingStamp, setPendingStamp] = useState<PendingStamp | null>(null);
  const [selectedStampDetail, setSelectedStampDetail] = useState<Stamp | null>(null);

  const manuscriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('heart_of_music_v6', JSON.stringify(state));
  }, [state]);

  const handleScan = (code: string) => {
    setIsScanning(false);
    const location = LOCATIONS.find(l => l.id === code);
    if (location) {
      if (state.collectedStamps[location.id]) {
        setNotification(`คุณได้รับตราประทับจากห้อง ${location.name} แล้ว`);
        return;
      }
      setDiscoveredRoom(location);
    } else {
      setNotification("รหัสไม่ถูกต้อง");
    }
  };

  const selectSymbol = async (symbol: string) => {
    if (!discoveredRoom) return;
    setIsLoading(true);
    
    const randomStyle = STAMP_STYLES[Math.floor(Math.random() * STAMP_STYLES.length)];
    const lore = await generateStampLore(discoveredRoom.name, randomStyle);
    
    setPendingStamp({
      locationId: discoveredRoom.id,
      locationName: discoveredRoom.name,
      symbol: symbol,
      style: randomStyle,
      lore: lore,
      x: 50,
      y: 0,
      rotation: 0,
      isPlacing: true
    });
    
    setDiscoveredRoom(null);
    setIsLoading(false);
  };

  const confirmPlacement = () => {
    if (!pendingStamp || !pendingStamp.locationId) return;

    const finalStamp: Stamp = {
      id: `stamp_${Date.now()}`,
      locationId: pendingStamp.locationId,
      locationName: pendingStamp.locationName!,
      style: pendingStamp.style!,
      collectedAt: Date.now(),
      lore: pendingStamp.lore!,
      color: STAMP_COLORS[0],
      symbol: pendingStamp.symbol!,
      x: pendingStamp.x!,
      y: pendingStamp.y!,
      rotation: pendingStamp.rotation || 0
    };

    setState(prev => ({
      ...prev,
      collectedStamps: { ...prev.collectedStamps, [finalStamp.locationId]: finalStamp }
    }));
    
    setPendingStamp(null);
    setNotification("บันทึกตัวโน้ตลงในบทเพลงแล้ว!");
  };

  const updatePosition = (id: string, x: number, y: number) => {
    if (pendingStamp && pendingStamp.isPlacing) {
      setPendingStamp(prev => prev ? { ...prev, x, y } : null);
    } else {
      // In theory, collected stamps shouldn't trigger this anymore due to StampItem logic,
      // but we keep it safe.
      setState(prev => ({
        ...prev,
        collectedStamps: {
          ...prev.collectedStamps,
          [id]: { ...prev.collectedStamps[id], x, y }
        }
      }));
    }
  };

  const resetJournal = () => {
    if (window.confirm("คุณต้องการลบข้อมูลทั้งหมดและเริ่มต้นใหม่ใช่หรือไม่? (ข้อมูลจะหายไปถาวร)")) {
      const newState = { hasBook: true, collectedStamps: {} };
      setState(newState);
      localStorage.setItem('heart_of_music_v6', JSON.stringify(newState));
      setNotification("รีเซ็ตสมุดบันทึกแล้ว");
      setView('book');
    }
  };

  const downloadSymphony = async () => {
    if (!manuscriptRef.current) return;
    setNotification("กำลังวาดบทเพลงของคุณ...");
    try {
      const dataUrl = await toPng(manuscriptRef.current, { backgroundColor: '#f4ecd8', pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = `Heart-of-Music-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      setNotification("ดาวน์โหลดสำเร็จ!");
    } catch (err) {
      setNotification("เกิดข้อผิดพลาด");
    }
  };

  const isImage = (symbol: string) => {
    return symbol.match(/\.(jpeg|jpg|gif|png|svg)$/) != null;
  };

  return (
    <div className="min-h-screen bg-[#f4ecd8] pb-44 select-none">
      <header className="sticky top-0 z-40 bg-[#f4ecd8]/90 backdrop-blur-md border-b border-stone-200 px-6 py-4 flex justify-between items-center no-print">
        <div>
          <h1 className="text-xl font-script font-bold text-stone-900">Heart of Music</h1>
          <p className="text-sm uppercase tracking-widest font-serif text-stone-500 font-medium">
            {Object.keys(state.collectedStamps).length} / {LOCATIONS.length} Rooms
          </p>
        </div>
        <div className="flex space-x-2">
          <button onClick={downloadSymphony} className="p-3 bg-white rounded-full shadow-sm text-stone-600 active:scale-90 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button onClick={() => setView(view === 'book' ? 'creator' : 'book')} className="p-3 bg-stone-900 text-white rounded-full">
            {view === 'book' ? "⚙️" : "𝄞"}
          </button>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        {view === 'book' ? (
          <div className="space-y-12">
            <div ref={manuscriptRef} className="manuscript-paper relative overflow-hidden">
               <div className="mb-12 border-b-2 border-stone-100 pb-4 flex justify-between items-end">
                 <div>
                    <h2 className="text-3xl font-script font-bold text-stone-700">My Museum Composition</h2>
                    <p className="text-sm font-serif uppercase tracking-widest text-stone-400 font-medium">Composition Journal</p>
                 </div>
                 <span className="font-serif text-sm text-stone-400 font-medium">{new Date().toLocaleDateString('th-TH')}</span>
               </div>

               <div className="staff-container relative">
                 <span className="absolute -left-2 top-1/2 -translate-y-1/2 text-5xl font-serif text-stone-800 z-0">𝄞</span>
               </div>

               <div className="staff-container relative mt-16">
                 <span className="absolute -left-2 top-1/2 -translate-y-1/2 text-5xl font-serif text-stone-800 z-0 opacity-40">𝄞</span>
               </div>

               {/* Render Collected Stamps */}
               {LOCATIONS.map(loc => (
                 state.collectedStamps[loc.id] && (
                   <StampItem 
                     key={loc.id} 
                     stamp={state.collectedStamps[loc.id]} 
                     isDraggable={false} // LOCKED after collection
                     onPositionChange={updatePosition}
                     onClick={() => setSelectedStampDetail(state.collectedStamps[loc.id])}
                   />
                 )
               ))}

               {/* Render Pending Stamp (the one being placed) */}
               {pendingStamp?.isPlacing && (
                 <StampItem 
                    stamp={pendingStamp as Stamp} 
                    isDraggable={true} 
                    onPositionChange={updatePosition} 
                    onClick={() => {}} 
                 />
               )}

               <div className="mt-20 text-center">
                 <p className="font-thai text-lg text-stone-500 italic">"หัวใจแห่งเสียงดนตรีจะ<br />บันทึกอยู่ในทุกตัวโน้ตที่คุณวาง"</p>
               </div>
            </div>

            {!pendingStamp && (
              <section className="px-4">
                <h3 className="font-thai font-bold text-stone-800 mb-4 opacity-60">ห้องที่รอการค้นพบ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {LOCATIONS.filter(l => !state.collectedStamps[l.id]).map(loc => (
                    <div key={loc.id} className="p-4 bg-white/40 border border-stone-200 border-dashed rounded-2xl flex items-center space-x-4">
                      <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center font-serif text-stone-300">?</div>
                      <div className="flex-1">
                        <p className="text-base font-thai font-semibold text-stone-700">{loc.name}</p>
                        <p className="text-base font-thai text-stone-500 italic">"{loc.hint}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-100 p-6 rounded-3xl mb-8">
              <h3 className="text-red-900 font-bold mb-2 font-thai">ตั้งค่าสมุดบันทึก</h3>
              <p className="text-red-800 text-sm mb-4 font-thai">สำหรับการใช้เครื่องร่วมกัน หรือเริ่มบทเพลงใหม่</p>
              <button 
                onClick={resetJournal}
                className="bg-red-600 text-white px-6 py-3 rounded-2xl font-bold font-thai text-sm active:scale-95 transition-transform"
              >
                เริ่มบทเพลงใหม่ (ล้างข้อมูลทั้งหมด)
              </button>
            </div>
            <QRGenerator />
          </div>
        )}
      </main>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 no-print w-full max-w-xs px-4">
        {pendingStamp?.isPlacing ? (
          <div className="flex flex-col space-y-4 animate-in slide-in-from-bottom duration-500">
             <div className="bg-stone-900/90 text-white text-center py-3 rounded-2xl backdrop-blur-md text-xs font-thai tracking-widest border border-white/10 uppercase">
                ลากตัวโน้ตเพื่อจัดวาง
             </div>
             <button 
               onClick={confirmPlacement}
               className="w-full bg-amber-500 text-white py-5 rounded-full shadow-2xl font-thai font-bold text-lg active:scale-95 transition-transform ring-4 ring-amber-500/20"
             >
               กดเพื่อประทับตรา (Stamp)
             </button>
          </div>
        ) : (
          view === 'book' && (
            <button 
              onClick={() => setIsScanning(true)}
              disabled={isLoading}
              className="w-full group flex items-center justify-center space-x-4 bg-stone-900 text-white py-5 rounded-full shadow-2xl active:scale-95 transition-transform"
            >
              {isLoading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <span className="text-2xl leading-none">𝄽</span>
              )}
              <span className="font-thai font-bold text-lg tracking-wide">สแกนโค้ดห้องนิทรรศการ</span>
            </button>
          )
        )}
      </div>

      {discoveredRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-stone-900/90 backdrop-blur-xl animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 text-center shadow-2xl">
            <h2 className="text-lg font-serif uppercase tracking-[0.3em] text-stone-500 mb-2">Discovery</h2>
            <h3 className="text-4xl font-thai font-bold text-stone-900 mb-4">{discoveredRoom.name}</h3>
            <p className="text-stone-600 font-thai text-xl mb-12">เลือก 1 ชิ้นส่วนดนตรีที่คุณประทับใจที่สุดจากห้องนี้</p>
            
            <div className="grid grid-cols-3 gap-4 mb-12">
              {discoveredRoom.symbols.map((sym, i) => (
                <button 
                  key={i}
                  onClick={() => selectSymbol(sym)}
                  className="aspect-square bg-stone-50 rounded-[2rem] flex items-center justify-center overflow-hidden p-4 hover:bg-stone-900 transition-all active:scale-90 border border-stone-100 group"
                >
                  {isImage(sym) ? (
                    <img src={sym} alt="Option" className="w-full h-full object-contain pointer-events-none group-hover:invert transition-all" />
                  ) : (
                    <span className="text-5xl text-stone-800 group-hover:text-white">{sym}</span>
                  )}
                </button>
              ))}
            </div>
            
            <button onClick={() => setDiscoveredRoom(null)} className="text-stone-500 font-serif uppercase text-sm tracking-widest font-bold">Cancel</button>
          </div>
        </div>
      )}

      {selectedStampDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-stone-900/80 backdrop-blur-sm no-print">
          <div className="bg-[#fcfaf2] w-full max-w-sm rounded-[3rem] p-10 relative border-4 border-white animate-in zoom-in duration-300">
             <button onClick={() => setSelectedStampDetail(null)} className="absolute top-6 right-6 text-stone-400">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
             <div className="text-center">
               <div className="w-40 h-40 mx-auto mb-8 flex items-center justify-center">
                 {isImage(selectedStampDetail.symbol) ? (
                   <img src={selectedStampDetail.symbol} alt="Symbol" className="max-w-full max-h-full object-contain" />
                 ) : (
                   <span className="text-8xl text-stone-800">{selectedStampDetail.symbol}</span>
                 )}
               </div>
               <h3 className="text-3xl font-thai font-bold mb-1">{selectedStampDetail.locationName}</h3>
               <p className="text-sm font-serif uppercase tracking-widest text-stone-500 mb-6">{selectedStampDetail.style} Edition</p>
               <p className="text-stone-600 font-thai leading-relaxed italic text-lg">"{selectedStampDetail.lore}"</p>
             </div>
             <button onClick={() => setSelectedStampDetail(null)} className="mt-10 w-full py-4 bg-stone-100 rounded-2xl font-thai font-bold text-stone-500 uppercase text-sm tracking-widest">ปิดหน้าต่าง</button>
          </div>
        </div>
      )}

      {isScanning && <QRScanner onScan={handleScan} onClose={() => setIsScanning(false)} />}

      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-8 py-3 rounded-full text-xs font-thai shadow-2xl animate-in slide-in-from-top no-print">
          {notification}
        </div>
      )}
    </div>
  );
};

export default App;
