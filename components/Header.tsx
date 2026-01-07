
import React from 'react';

interface HeaderProps {
  stats: {
    sold: number;
    total: number;
  };
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting?: boolean;
}

const Header: React.FC<HeaderProps> = ({ stats, walletAddress, onConnect, isConnecting }) => {
  const percentage = ((stats.sold / stats.total) * 100).toFixed(4);

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shadow-2xl">
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex flex-col">
          <h1 className="text-sm sm:text-xl font-black tracking-tighter text-white whitespace-nowrap">
            ETH<span className="text-blue-500">MILLION</span>
          </h1>
          <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-slate-500 font-bold whitespace-nowrap">
            One million pixels. One Ethereum wall.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-8">
        <div className="hidden sm:flex flex-col items-end">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-slate-300">{stats.sold.toLocaleString()}</span>
            <span className="text-xs text-slate-500">/ {stats.total.toLocaleString()} sold</span>
          </div>
          <div className="w-32 sm:w-48 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-500" 
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <button 
          onClick={onConnect}
          disabled={isConnecting}
          className={`${walletAddress ? 'bg-slate-800 border border-slate-700' : 'bg-blue-600 hover:bg-blue-500'} text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-lg shadow-blue-900/20 flex items-center gap-2 whitespace-nowrap min-w-[120px] justify-center`}
        >
          {isConnecting ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Connecting...</span>
            </div>
          ) : (
            <>
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
              <span>{walletAddress ? formatAddress(walletAddress) : 'Connect Wallet'}</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
