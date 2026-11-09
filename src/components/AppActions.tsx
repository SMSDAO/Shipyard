import React, { useState } from 'react';

interface AppActionsProps {
  appId: string;
  mode: 'withdraw' | 'claim';
  disabled?: boolean;
  onSuccess?: (msg: string) => void;
  onWithdrawComplete?: (to: string, eth: string) => void;
}

export function AppActions({
  appId,
  mode,
  disabled,
  onSuccess,
  onWithdrawComplete,
}: AppActionsProps) {
  const [to, setTo] = useState('');
  const [eth, setEth] = useState('');
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      if (mode === 'claim') {
        onSuccess?.('Fees claimed successfully!');
      } else {
        onWithdrawComplete?.(to, eth);
        onSuccess?.(`Withdrawal of ${eth} ETH to ${to.slice(0, 8)}... submitted`);
        setTo('');
        setEth('');
      }
    }, 600);
  }

  if (mode === 'claim') {
    return (
      <button
        className="btn"
        disabled={busy || disabled}
        onClick={run}
      >
        {busy ? 'Claiming…' : 'Claim fees'}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <input
        className="input"
        placeholder="0x… destination"
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />
      <input
        className="input sm:w-28"
        placeholder="ETH"
        inputMode="decimal"
        value={eth}
        onChange={(e) => setEth(e.target.value)}
      />
      <button
        className="btn shrink-0"
        disabled={busy || !to || !eth}
        onClick={run}
      >
        {busy ? 'Submitting…' : 'Withdraw'}
      </button>
    </div>
  );
}

export default AppActions;
