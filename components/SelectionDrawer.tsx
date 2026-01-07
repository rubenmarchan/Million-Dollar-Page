
import React from 'react';

interface SelectionDrawerProps {
  selection: { x: number; y: number; width: number; height: number };
  price: number;
  isOverlapping: boolean;
  walletAddress: string | null;
  onConnect: () => void;
  onOpenPurchase: () => void;
  onClear: () => void;
}

const SelectionDrawer: React.FC<SelectionDrawerProps> = ({ 
  selection, price, isOverlapping, walletAddress, onConnect, onOpenPurchase, onClear 
}) => {
  return (
    <div className="fixed bottom-0 sm:bottom-8 left-0 sm:left-1/2 w-full sm:w-auto sm:-translate-x-1/2 z-40 px-4 pb-4 sm:pb-0 sm:px-0">
      <div className={`bg-slate-900 border ${isOverlapping ? 'border-red-500' : 'border-slate-700'} shadow-2xl rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 animate-in slide-in-from-bottom-4 duration-300`}>
        <div className="flex w-full sm:w-auto items-center justify-between sm:justify-start sm:gap-8">
          <div className="flex flex-col">
            <span className={`text-[10px] font-black uppercase tracking-widest ${isOverlapping ? 'text-red-500' : 'text-slate-500'}`}>
              {isOverlapping ? 'Overlap Detected' : 'Selected Area'}
            </span>
            <span className="text-lg sm:text-xl font-mono font-bold text-white">
              {selection.width} × {selection.height} px
            </span>
          </div>

          <div className="hidden sm:block h-10 w-px bg-slate-800" />

          <div className="flex flex-col min-w-[100px] text-right sm:text-left">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Price</span>
            <span className={`text-xl sm:text-2xl font-black ${isOverlapping ? 'text-slate-600' : 'text-blue-400'}`}>
              {price.toFixed(5)} <span className="text-xs text-slate-500">ETH</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={onClear}
            className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all text-sm"
          >
            Clear
          </button>
          
          {!walletAddress ? (
            <button 
              onClick={onConnect}
              className="flex-[2] sm:flex-none px-8 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black shadow-xl shadow-orange-900/40 transition-all text-sm whitespace-nowrap"
            >
              Connect Wallet to Mint
            </button>
          ) : (
            <button 
              onClick={onOpenPurchase}
              disabled={isOverlapping}
              className={`flex-[2] sm:flex-none px-8 py-3 rounded-xl font-black transition-all text-sm whitespace-nowrap ${isOverlapping ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-900/40 hover:scale-105'}`}
            >
              Mint Design
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectionDrawer;
