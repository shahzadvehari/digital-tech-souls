'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Currency {
  id: number;
  code: string;
  symbol: string;
  rate: number;
  mode: string;
  isBase: boolean;
  isActive: boolean;
}

interface CurrencyContextType {
  currencies: Currency[];
  selectedCurrency: Currency | null;
  setCurrency: (code: string) => void;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currencies: [],
  selectedCurrency: null,
  setCurrency: () => {},
  loading: true,
});

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch available currencies from backend
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/currency`)
      .then((res) => res.json())
      .then((data: Currency[]) => {
        const activeCurrencies = data.filter((c) => c.isActive);
        setCurrencies(activeCurrencies);
        
        // Try to load saved preference
        const savedCode = localStorage.getItem('preferredCurrency');
        let initialCurrency = null;
        
        if (savedCode) {
          initialCurrency = activeCurrencies.find((c) => c.code === savedCode);
        }
        
        // Fallback to base currency (USD) or first active
        if (!initialCurrency) {
          initialCurrency = activeCurrencies.find((c) => c.isBase) || activeCurrencies[0];
        }
        
        setSelectedCurrency(initialCurrency || null);
        setLoading(false);
      })
      .catch(() => {
        // Silently ignore if backend is unavailable
        setLoading(false);
      });
  }, []);

  const setCurrency = (code: string) => {
    const currency = currencies.find((c) => c.code === code);
    if (currency) {
      setSelectedCurrency(currency);
      localStorage.setItem('preferredCurrency', code);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currencies, selectedCurrency, setCurrency, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
