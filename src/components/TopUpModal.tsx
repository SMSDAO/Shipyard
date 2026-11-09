import React, { useState } from 'react';
import confetti from 'canvas-confetti';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCredits: (amount: number) => void;
  defaultPack?: number;
}

export function TopUpModal({
  isOpen,
  onClose,
  onAddCredits,
  defaultPack = 500,
}: TopUpModalProps) {
  const safeDefault = typeof defaultPack === 'number' && [100, 500, 2000].includes(defaultPack) ? String(defaultPack) : '500';
  const [selectedPack, setSelectedPack] = useState<string>(safeDefault);
  const [busy, setBusy] = useState(false);

  React.useEffect(() => {
    if (typeof defaultPack === 'number' && [100, 500, 2000].includes(defaultPack)) {
      setSelectedPack(String(defaultPack));
    }
  }, [defaultPack]);

  if (!isOpen) return null;

  const packs: Record<string, { price: string; desc: string }> = {
    '100': { price: '$5.00', desc: '1 Complete App Build + Security Review' },
    '500': { price: '$20.00', desc: '5 Complete Apps + Base Smart Contracts + Token Launch' },
    '2000': { price: '$70.00', desc: 'Unlimited Agent Runs + Priority Reviewer Gate' },
  };

  const handleBuy = () => {
    setBusy(true);
    setTimeout(() => {
      const amount = Number(selectedPack);
      onAddCredits(amount);
      setBusy(false);

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#22d3ee'],
      });

      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base">Top up credits</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 text-lg leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        <p className="text-xs text-zinc-500">
          Credits fund autonomous agent planning, code generation, and onchain deployment.
        </p>

        <div className="space-y-2">
          {Object.entries(packs).map(([pack, info]) => {
            const isSelected = selectedPack === pack;
            return (
              <div
                key={pack}
                onClick={() => setSelectedPack(pack)}
                className={`card block cursor-pointer transition py-2.5 px-3 ${
                  isSelected ? 'border-brand-500 bg-brand-500/10' : 'hover:border-brand-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">+{pack} credits</span>
                  <span className="chip text-[11px] font-mono">{info.price}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">{info.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex gap-2">
          <button
            onClick={handleBuy}
            disabled={busy}
            className="btn w-full"
          >
            {busy ? 'Processing…' : `Add +${selectedPack} credits`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TopUpModal;
