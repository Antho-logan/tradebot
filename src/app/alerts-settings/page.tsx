/**
 * AlertsSettings.tsx – Notification settings for TradeGPT
 * Accordion: Price Alerts, Risk Alerts, System Health. Toggles for push/email/SMS, persist to localStorage. Test Notification CTA (toast). Dark mode, Tailwind, Framer Motion.
 */

'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home as HomeIcon, Bell, ChevronDown, ChevronUp } from 'lucide-react';

const SECTIONS = [
  { key: 'price', label: 'Price Alerts' },
  { key: 'risk', label: 'Risk Alerts' },
  { key: 'system', label: 'System Health' },
];
const CHANNELS = [
  { key: 'push', label: 'Push' },
  { key: 'email', label: 'Email' },
  { key: 'sms', label: 'SMS' },
];

function getInitialSettings() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem('alertSettings') || '{}');
  } catch {
    return {};
  }
}

function BackToHomeButton() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      className="w-full flex justify-start max-w-2xl mx-auto px-4 pt-6"
    >
      <a
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-emerald-400 font-medium shadow transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
      >
        <HomeIcon className="w-5 h-5" /> Back to Home
      </a>
    </motion.div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: 'easeOut' },
  }),
};

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 2000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 32 }}
      className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
    >
      <Bell className="w-5 h-5 text-emerald-400" />
      {message}
    </motion.div>
  );
}

function AccordionSection({
  section,
  open,
  setOpen,
  settings,
  setSettings,
}: {
  section: { key: string; label: string };
  open: boolean;
  setOpen: (k: string) => void;
  settings: any;
  setSettings: (s: any) => void;
}) {
  return (
    <div className="border-b border-neutral-800">
      <button
        className="w-full flex items-center justify-between px-4 py-4 text-left text-white font-semibold text-lg focus:outline-none"
        onClick={() => setOpen(open ? '' : section.key)}
      >
        <span>{section.label}</span>
        {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeUp}
            className="px-4 pb-4 flex flex-col gap-3"
          >
            {CHANNELS.map(ch => (
              <label key={ch.key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!settings[section.key]?.[ch.key]}
                  onChange={e => {
                    setSettings((s: any) => {
                      const next = {
                        ...s,
                        [section.key]: {
                          ...s[section.key],
                          [ch.key]: e.target.checked,
                        },
                      };
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('alertSettings', JSON.stringify(next));
                      }
                      return next;
                    });
                  }}
                  className="accent-emerald-500 w-5 h-5"
                />
                <span className="text-neutral-200 text-sm">{ch.label}</span>
              </label>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AlertsSettings() {
  const [settings, setSettings] = React.useState(getInitialSettings);
  const [open, setOpen] = React.useState('price');
  const [toast, setToast] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setSettings(getInitialSettings());
    }
  }, []);

  return (
    <div className="bg-neutral-950 min-h-screen font-sans">
      <BackToHomeButton />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.h1
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-3xl md:text-4xl font-extrabold text-white mb-2"
        >
          Alert Settings
        </motion.h1>
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-neutral-400 mb-6"
        >
          Manage your notification preferences for price, risk, and system alerts.
        </motion.p>
        <div className="bg-neutral-900 rounded-2xl shadow-lg border border-neutral-800 divide-y divide-neutral-800 mb-8">
          {SECTIONS.map((section, i) => (
            <AccordionSection
              key={section.key}
              section={section}
              open={open === section.key}
              setOpen={setOpen}
              settings={settings}
              setSettings={setSettings}
            />
          ))}
        </div>
        <button
          onClick={() => setToast('Test notification sent!')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-emerald-400 font-semibold text-lg shadow transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <Bell className="w-5 h-5" /> Test Notification
        </button>
      </div>
      <AnimatePresence>{toast && <Toast message={toast} onClose={() => setToast(null)} />}</AnimatePresence>
    </div>
  );
} 