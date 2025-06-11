"use client";
import { useState, useEffect } from 'react';

export default function TestPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Testing API...');
      const response = await fetch('/api/market/prices', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      console.log('Response text:', text);
      
      if (!text || text.trim() === '') {
        throw new Error('Empty response');
      }
      
      const jsonData = JSON.parse(text);
      console.log('Parsed JSON:', jsonData);
      
      setData(jsonData);
    } catch (err: any) {
      console.error('API test error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Test Page</h1>
        
        <div className="mb-6">
          <button
            onClick={testAPI}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-2 rounded font-medium"
          >
            {loading ? 'Testing...' : 'Test API'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-600 rounded p-4 mb-6">
            <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {data && (
          <div className="bg-green-900 border border-green-600 rounded p-4 mb-6">
            <h2 className="text-xl font-bold text-green-400 mb-2">Success!</h2>
            <div className="text-green-300">
              <p><strong>Status:</strong> {data.ok ? 'OK' : 'Error'}</p>
              <p><strong>Source:</strong> {data.source}</p>
              <p><strong>Timestamp:</strong> {data.timestamp}</p>
              <p><strong>Data Count:</strong> {data.data?.length || 0}</p>
            </div>
          </div>
        )}

        {data?.data && (
          <div className="bg-gray-800 border border-gray-600 rounded p-4">
            <h2 className="text-xl font-bold mb-4">Market Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.data.map((item: any, index: number) => (
                <div key={index} className="bg-gray-700 rounded p-3">
                  <div className="font-bold text-lg">{item.symbol}</div>
                  <div className="text-2xl font-mono">${item.price.toLocaleString()}</div>
                  <div className={`text-sm ${item.changePct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {item.changePct >= 0 ? '+' : ''}{item.changePct.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-sm text-gray-400">
          <p>This page tests the API directly without any external interference.</p>
          <p>Check the browser console for detailed logs.</p>
        </div>
      </div>
    </div>
  );
} 