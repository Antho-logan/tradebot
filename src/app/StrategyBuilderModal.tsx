// StrategyBuilderModal.tsx
// Multi-step strategy builder modal for TradeGPT
// Features: progress bar, 4 steps, toggles/sliders, save to localStorage, close/back-to-home, Framer Motion, Tailwind

'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home as HomeIcon, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';

const steps = [
  { label: 'Name & Description' },
  { label: 'Signal Mix' },
  { label: 'Risk Settings' },
  { label: 'Review' },
];

const defaultConfig = {
  name: '',
  description: '',
  signals: {
    fvg: true,
    ob: false,
    liquidity: false,
    bos: false,
  },
  risk: {
    maxDrawdown: 10,
    positionSize: 5,
    stopLoss: 2,
  },
};

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((s, i) => (
        <React.Fragment key={s.label}>
          <div className={`flex items-center gap-1 ${i <= step ? 'text-emerald-400' : 'text-neutral-600'}`}> 
            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${i <= step ? 'border-emerald-400 bg-emerald-500/10' : 'border-neutral-700 bg-neutral-900'}`}>{i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}</div>
            <span className="text-xs font-medium">{s.label}</span>
          </div>
          {i < steps.length - 1 && <div className={`flex-1 h-1 rounded bg-gradient-to-r ${i < step ? 'from-emerald-400/80 to-emerald-400/20' : 'from-neutral-800 to-neutral-900'}`}></div>}
        </React.Fragment>
      ))}
    </div>
  );
}

function Step1({ config, setConfig }: any) {
  return (
    <div className="flex flex-col gap-4">
      <input
        className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        placeholder="Strategy Name"
        value={config.name}
        onChange={e => setConfig((c: any) => ({ ...c, name: e.target.value }))}
      />
      <textarea
        className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 min-h-[60px]"
        placeholder="Description"
        value={config.description}
        onChange={e => setConfig((c: any) => ({ ...c, description: e.target.value }))}
      />
    </div>
  );
}

function Step2({ config, setConfig }: any) {
  const signals = [
    { key: 'fvg', label: 'Fair Value Gap' },
    { key: 'ob', label: 'Order Block' },
    { key: 'liquidity', label: 'Liquidity' },
    { key: 'bos', label: 'Break of Structure' },
  ];
  return (
    <div className="flex flex-col gap-4">
      {signals.map(s => (
        <label key={s.key} className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.signals[s.key]}
            onChange={e => setConfig((c: any) => ({ ...c, signals: { ...c.signals, [s.key]: e.target.checked } }))}
            className="accent-emerald-500 w-5 h-5"
          />
          <span className="text-white text-sm">{s.label}</span>
        </label>
      ))}
    </div>
  );
}

function Step3({ config, setConfig }: any) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-white">Max Drawdown (%)</span>
        <input
          type="range"
          min={1}
          max={50}
          value={config.risk.maxDrawdown}
          onChange={e => setConfig((c: any) => ({ ...c, risk: { ...c.risk, maxDrawdown: +e.target.value } }))}
          className="accent-emerald-500 w-40"
        />
        <span className="text-emerald-400 font-mono w-10 text-right">{config.risk.maxDrawdown}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-white">Position Size (%)</span>
        <input
          type="range"
          min={1}
          max={100}
          value={config.risk.positionSize}
          onChange={e => setConfig((c: any) => ({ ...c, risk: { ...c.risk, positionSize: +e.target.value } }))}
          className="accent-emerald-500 w-40"
        />
        <span className="text-emerald-400 font-mono w-10 text-right">{config.risk.positionSize}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-white">Stop Loss (%)</span>
        <input
          type="range"
          min={0}
          max={20}
          value={config.risk.stopLoss}
          onChange={e => setConfig((c: any) => ({ ...c, risk: { ...c.risk, stopLoss: +e.target.value } }))}
          className="accent-emerald-500 w-40"
        />
        <span className="text-emerald-400 font-mono w-10 text-right">{config.risk.stopLoss}</span>
      </div>
    </div>
  );
}

function Step4({ config }: any) {
  return (
    <div className="flex flex-col gap-4 text-white">
      <div>
        <span className="font-semibold">Name:</span> {config.name || <span className="text-neutral-500">(none)</span>}
      </div>
      <div>
        <span className="font-semibold">Description:</span> {config.description || <span className="text-neutral-500">(none)</span>}
      </div>
      <div>
        <span className="font-semibold">Signals:</span> {Object.entries(config.signals).filter(([, v]) => v).map(([k]) => k.toUpperCase()).join(', ') || <span className="text-neutral-500">(none)</span>}
      </div>
      <div>
        <span className="font-semibold">Risk:</span> Max DD {config.risk.maxDrawdown}%, Position {config.risk.positionSize}%, SL {config.risk.stopLoss}%
      </div>
    </div>
  );
}

const stepComponents = [Step1, Step2, Step3, Step4];

export function useStrategyBuilderModal() {
  const [open, setOpen] = React.useState(false);
  const modal = open ? <StrategyBuilderModal open={open} onClose={() => setOpen(false)} /> : null;
  return [modal, () => setOpen(true)] as const;
}

export function StrategyBuilderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = React.useState(0);
  const [config, setConfig] = React.useState(defaultConfig);
  const Step = stepComponents[step];

  function handleSave() {
    localStorage.setItem('strategyConfig', JSON.stringify(config));
    onClose();
    alert('Strategy saved (mock)!');
  }

  React.useEffect(() => {
    if (!open) {
      setStep(0);
      setConfig(defaultConfig);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur"
        >
          <motion.div
            initial={{ y: 64, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 64, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
            className="relative w-full max-w-lg bg-neutral-950 rounded-2xl shadow-2xl p-8 border border-neutral-800 flex flex-col"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-neutral-400 hover:text-emerald-400 transition"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <ProgressBar step={step} />
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 32 }}
              transition={{ duration: 0.4 }}
              className="bg-neutral-900 rounded-xl p-6 shadow flex flex-col gap-6 mb-6"
            >
              <Step config={config} setConfig={setConfig} />
            </motion.div>
            <div className="flex justify-between items-center gap-2">
              <button
                onClick={() => setStep(s => Math.max(0, s - 1))}
                disabled={step === 0}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:text-emerald-400 font-medium transition disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              {step < steps.length - 1 ? (
                <button
                  onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition"
                >
                  Save
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 