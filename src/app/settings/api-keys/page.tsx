/**
 * API Keys Settings Page
 * Allows users to configure and test their OpenAI API key
 */

'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Key, Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import AppShell from '../../AppShell';

interface ToastState {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}

export default function APIKeysPage() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, type: 'success', message: '' });

  // Load saved API key on component mount
  useEffect(() => {
    const savedKey = localStorage.getItem('tradegpt-openai-key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleSaveAndTest = async () => {
    if (!apiKey.trim()) {
      showToast('error', 'Please enter an API key');
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      showToast('error', 'Invalid API key format. OpenAI keys start with "sk-"');
      return;
    }

    setIsLoading(true);

    try {
      // Test the API key
      const response = await fetch('/api/openai/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: apiKey }),
      });

      const result = await response.json();

      if (result.ok) {
        // Save to localStorage
        // TODO: encrypt the key for better security
        localStorage.setItem('tradegpt-openai-key', apiKey);
        showToast('success', 'API key saved and tested successfully!');
      } else {
        showToast('error', 'Invalid API key. Please check your key and try again.');
      }
    } catch (error) {
      console.error('API key test failed:', error);
      showToast('error', 'Failed to test API key. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearKey = () => {
    setApiKey('');
    localStorage.removeItem('tradegpt-openai-key');
    showToast('success', 'API key cleared successfully');
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-neutral-950 text-white p-6">
        {/* Toast Notification */}
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 ${
              toast.type === 'success' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-red-500 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{toast.message}</span>
          </motion.div>
        )}

        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-emerald-400 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span>Settings</span>
            <span>/</span>
            <span className="text-white">API Keys</span>
          </div>

          {/* Back Button */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">API Keys</h1>
            <p className="text-gray-400">
              Configure your API keys to enable AI-powered features in TradeGPT
            </p>
          </div>

          {/* OpenAI API Key Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Key className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">OpenAI / ChatGPT Key</h2>
                <p className="text-gray-400 text-sm">
                  Required for AI chat assistant and advanced trading insights
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* API Key Input */}
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-2">
                  API Key
                </label>
                <div className="relative">
                  <input
                    id="apiKey"
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Get your API key from{' '}
                  <a 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    OpenAI Platform
                  </a>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSaveAndTest}
                  disabled={isLoading || !apiKey.trim()}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Save & Test'
                  )}
                </button>

                {apiKey && (
                  <button
                    onClick={handleClearKey}
                    className="px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Clear Key
                  </button>
                )}
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 text-amber-400 mt-0.5">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-amber-400 font-medium text-sm">Security Notice</h3>
                  <p className="text-amber-200 text-xs mt-1">
                    Your API key is stored locally in your browser. For enhanced security, 
                    consider using environment variables in production deployments.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Additional Information */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">What you can do with OpenAI</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                  Chat with AI trading assistant
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                  Get market analysis and insights
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                  Receive trading strategy recommendations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                  Risk management guidance
                </li>
              </ul>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">API Usage & Costs</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  Pay-per-use pricing from OpenAI
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  Typical chat costs $0.001-0.01 per message
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  Monitor usage in OpenAI dashboard
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  Set usage limits to control costs
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
} 