'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, X, Minimize2, Key, Eye, EyeOff, Maximize2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AskAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [showTempKey, setShowTempKey] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "🧠 Hi! Got any trading questions? Ask away and I'll break it down.",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Note: API key is now handled via environment variables
  // Users can still optionally provide their own key via the UI

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSaveApiKey = () => {
    if (!tempApiKey.trim()) return;
    
    if (!tempApiKey.startsWith('sk-')) {
      alert('Invalid API key format. OpenAI keys start with "sk-"');
      return;
    }
    
    localStorage.setItem('tradegpt-openai-key', tempApiKey);
    setShowApiKeyModal(false);
    setTempApiKey('');
    
    const successMessage: Message = {
      id: Date.now().toString(),
      text: "Great! Your OpenAI API key has been saved. You can now chat with me! 🎉",
      isUser: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, successMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // Get API key from localStorage (optional - server will use environment variable if not provided)
      const apiKey = localStorage.getItem('tradegpt-openai-key');

      // Prepare messages for API (exclude the initial welcome message)
      const apiMessages = messages
        .filter(msg => msg.id !== '1') // Exclude welcome message
        .map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text
        }));
      
      // Add current user message
      apiMessages.push({
        role: 'user',
        content: currentInput
      });

      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          ...(apiKey && { apiKey }) // Only include apiKey if it exists
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: data.message,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.error?.includes('API key is required') 
            ? "API key not configured. Please set up your OpenAI API key using the button below, or contact the administrator to configure the environment variable."
            : `Error: ${data.error || 'Failed to get AI response'}`,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        
        // Show API key modal if it's an API key error
        if (data.error?.includes('API key is required')) {
          setShowApiKeyModal(true);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCloseChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
    setIsFullscreen(false);
    // Reset conversation when closing chat
    setMessages([
      {
        id: '1',
        text: "🧠 Hi! Got any trading questions? Ask away and I'll break it down.",
        isUser: false,
        timestamp: new Date()
      }
    ]);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setIsOpen(false); // Close the chat window and show the Ask AI button
    setIsFullscreen(false);
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
          setIsFullscreen(false);
        }}
        className={`fixed bottom-6 right-6 z-50 px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-full shadow-lg hover:shadow-emerald-500/25 flex items-center gap-3 transition-all duration-300 ${isOpen ? 'hidden' : 'flex'}`}
        aria-label="Ask AI Assistant"
      >
        <Star className="w-5 h-5" />
        <span className="font-semibold text-sm">Ask AI</span>
      </motion.button>

      {/* API Key Setup Modal */}
      <AnimatePresence>
        {showApiKeyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowApiKeyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Key className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Setup OpenAI API Key</h3>
                  <p className="text-sm text-neutral-400">Optional: Use your own API key for chat functionality</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showTempKey ? 'text' : 'password'}
                      value={tempApiKey}
                      onChange={(e) => setTempApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTempKey(!showTempKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-300"
                    >
                      {showTempKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
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

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowApiKeyModal(false)}
                    className="flex-1 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveApiKey}
                    disabled={!tempApiKey.trim()}
                    className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-700 disabled:text-neutral-500 text-white rounded-lg transition-colors"
                  >
                    Save & Test
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Popup */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`fixed z-50 bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-700 shadow-2xl overflow-hidden ${
              isFullscreen 
                ? 'inset-4 rounded-2xl' 
                : 'bottom-6 right-6 w-96 h-[500px] rounded-2xl'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">AI Assistant</h3>
                  <p className="text-xs text-emerald-100">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFullscreen();
                  }}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  <Maximize2 className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMinimize();
                  }}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  aria-label="Minimize chat"
                >
                  <Minimize2 className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseChat();
                  }}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            <>
              {/* Messages */}
              <div className={`flex-1 p-4 overflow-y-auto space-y-4 ${
                isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-80'
              }`}>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl ${
                          message.isUser
                            ? 'bg-emerald-500 text-white'
                            : 'bg-neutral-800 text-neutral-100'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.isUser ? 'text-emerald-100' : 'text-neutral-400'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-neutral-800 text-neutral-100 p-3 rounded-2xl">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-neutral-700">
                  <div className="mb-3">
                    <button
                      onClick={() => setShowApiKeyModal(true)}
                      className="w-full px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      {localStorage.getItem('tradegpt-openai-key') ? 'Update API Key' : 'Setup Personal API Key (Optional)'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about trading..."
                      className="flex-1 bg-neutral-800 text-white placeholder-neutral-400 border border-neutral-600 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      rows={1}
                      style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isTyping}
                      className="p-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-700 disabled:text-neutral-500 text-white rounded-xl transition-colors"
                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 