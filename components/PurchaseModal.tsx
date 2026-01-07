
import React, { useState } from 'react';
import { TREASURY_WALLET } from '../constants';

interface PurchaseModalProps {
  selection: { x: number; y: number; width: number; height: number };
  price: number;
  onConfirm: (data: { color: string; text?: string; imageUrl?: string; linkUrl?: string }) => void;
  onClose: () => void;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ selection, price, onConfirm, onClose }) => {
  const [color, setColor] = useState('#3b82f6');
  const [text, setText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'design' | 'minting'>('design');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMint = async () => {
    setStep('minting');
    setIsProcessing(true);
    // Simulate smart contract interaction (e.g., via Thirdweb/Moralis)
    // Destination: TREASURY_WALLET
    await new Promise(resolve => setTimeout(resolve, 3500));
    onConfirm({ color, text, imageUrl: imagePreview || undefined, linkUrl });
    setIsProcessing(false);
  };

  if (step === 'minting') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
        <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-800 shadow-2xl p-8 sm:p-12 flex flex-col items-center text-center">
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-4 bg-blue-500/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Minting Block</h2>
          <p className="text-slate-400 text-sm mb-4">
            Sending <span className="text-blue-400 font-bold">{price.toFixed(5)} ETH</span> to treasury:
          </p>
          <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 mb-6 w-full">
            <code className="text-[10px] sm:text-xs text-blue-500 break-all">{TREASURY_WALLET}</code>
          </div>
          <p className="text-slate-500 text-xs mb-6 italic">Please confirm the transaction in your connected wallet.</p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-pulse w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col md:flex-row my-auto max-h-[95vh] md:max-h-none">
        
        {/* Preview Side */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 bg-slate-950/50 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800">
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">NFT Preview</span>
          <div 
            className="relative flex items-center justify-center overflow-hidden border border-slate-700 shadow-2xl"
            style={{ 
              width: selection.width > selection.height ? 160 : (160 * selection.width / selection.height), 
              height: selection.height > selection.width ? 160 : (160 * selection.height / selection.width),
              backgroundColor: color,
              aspectRatio: `${selection.width} / ${selection.height}`
            }}
          >
            {imagePreview ? (
              <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
            ) : null}
            <span className="relative z-10 text-white font-bold text-center px-2 drop-shadow-md" style={{ fontSize: '0.7rem' }}>
              {text}
            </span>
          </div>
          <div className="mt-4 flex flex-col items-center">
             <p className="text-xs text-slate-400 italic font-mono">{selection.width}x{selection.height} px</p>
             <p className="text-[10px] text-blue-500 mt-1 font-bold tracking-widest uppercase">Immutable Ownership</p>
          </div>
        </div>

        {/* Form Side */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col overflow-y-auto">
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Pixel Design</h2>
            <button onClick={onClose} className="p-2 -mr-2 text-slate-500 hover:text-white transition-colors">
              ✕
            </button>
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Base Color</label>
              <div className="flex gap-1.5 flex-wrap">
                {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#ffffff', '#000000'].map(c => (
                  <button 
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent scale-100'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input 
                  type="color" 
                  value={color} 
                  onChange={e => setColor(e.target.value)}
                  className="w-6 h-6 rounded-full bg-transparent border-none cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Overlay Message</label>
              <input 
                type="text" 
                value={text}
                onChange={e => setText(e.target.value)}
                maxLength={20}
                placeholder="Ex: HELLO WEB3"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Graphics Upload</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-wider">External Link</label>
              <input 
                type="url" 
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                placeholder="https://my-collection.io"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-xs font-medium">Minting Price:</span>
              <div className="flex flex-col items-end">
                <span className="text-2xl font-black text-blue-400">{price.toFixed(5)} ETH</span>
              </div>
            </div>
            <div className="flex flex-col mb-4">
               <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Treasury Recipient:</span>
               <span className="text-[9px] text-slate-400 font-mono truncate">{TREASURY_WALLET}</span>
            </div>
            <button 
              onClick={handleMint}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all shadow-xl shadow-blue-900/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              Confirm & Mint
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;
