
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import PixelCanvas from './components/PixelCanvas';
import SelectionDrawer from './components/SelectionDrawer';
import PurchaseModal from './components/PurchaseModal';
import { PixelBlock, Selection } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PRICE_PER_PIXEL } from './constants';

const App: React.FC = () => {
  const [blocks, setBlocks] = useState<PixelBlock[]>([]);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [stats, setStats] = useState({ sold: 0, total: CANVAS_WIDTH * CANVAS_HEIGHT });
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Initial dummy data
  useEffect(() => {
    const initialBlocks: PixelBlock[] = [
      {
        id: '1',
        x: 400,
        y: 600,
        width: 200,
        height: 200,
        ownerId: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        color: '#3b82f6',
        text: 'GENESIS BLOCK',
        createdAt: Date.now(),
      }
    ];
    setBlocks(initialBlocks);
  }, []);

  useEffect(() => {
    const soldCount = blocks.reduce((acc, b) => acc + (b.width * b.height), 0);
    setStats(prev => ({ ...prev, sold: soldCount }));
  }, [blocks]);

  const handleConnectWallet = useCallback(async () => {
    setIsConnecting(true);
    // Simulate Thirdweb/Moralis wallet connection delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    setWalletAddress('0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join(''));
    setIsConnecting(false);
  }, []);

  const handleSelectionChange = useCallback((newSelection: Selection | null) => {
    setSelection(newSelection);
  }, []);

  const handlePurchase = useCallback((data: Partial<PixelBlock>) => {
    if (!selection || !walletAddress) return;

    const rect = getNormalizedRect(selection);
    const newBlock: PixelBlock = {
      id: Math.random().toString(36).substr(2, 9),
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      ownerId: walletAddress,
      color: data.color || '#3b82f6',
      text: data.text,
      imageUrl: data.imageUrl,
      linkUrl: data.linkUrl,
      createdAt: Date.now(),
    };

    setBlocks(prev => [...prev, newBlock]);
    setSelection(null);
    setIsPurchaseModalOpen(false);
  }, [selection, walletAddress]);

  const getNormalizedRect = (sel: Selection) => {
    const x = Math.min(sel.startX, sel.currentX);
    const y = Math.min(sel.startY, sel.currentY);
    const width = Math.abs(sel.currentX - sel.startX);
    const height = Math.abs(sel.currentY - sel.startY);
    return { x, y, width, height };
  };

  const currentPrice = selection 
    ? getNormalizedRect(selection).width * getNormalizedRect(selection).height * PRICE_PER_PIXEL 
    : 0;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900 select-none">
      <Header stats={stats} walletAddress={walletAddress} onConnect={handleConnectWallet} isConnecting={isConnecting} />
      
      <PixelCanvas 
        blocks={blocks} 
        onSelectionChange={handleSelectionChange} 
        activeSelection={selection}
      />

      {selection && !isPurchaseModalOpen && (
        <SelectionDrawer 
          selection={getNormalizedRect(selection)}
          price={currentPrice}
          isOverlapping={selection.isOverlapping}
          walletAddress={walletAddress}
          onConnect={handleConnectWallet}
          onOpenPurchase={() => setIsPurchaseModalOpen(true)}
          onClear={() => setSelection(null)}
        />
      )}

      {isPurchaseModalOpen && selection && (
        <PurchaseModal 
          selection={getNormalizedRect(selection)}
          price={currentPrice}
          onConfirm={handlePurchase}
          onClose={() => setIsPurchaseModalOpen(false)}
        />
      )}

      <div className="fixed bottom-4 left-4 z-10 hidden sm:block pointer-events-none">
        <div className="bg-slate-800/80 backdrop-blur p-3 rounded-lg border border-slate-700 shadow-xl pointer-events-auto">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Controls</p>
          <ul className="text-[10px] text-slate-300 mt-1 space-y-1">
            <li>• Click + Drag: Select Area</li>
            <li>• Right Click: Pan Camera</li>
            <li>• Scroll/Pinch: Zoom In/Out</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
