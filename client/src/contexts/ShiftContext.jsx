import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const ShiftContext = createContext();

const SHIFT_KEY = 'candiez_current_shift';

export function ShiftProvider({ children }) {
  const { user } = useAuth();
  const [currentShift, setCurrentShift] = useState(() => {
    try {
      const saved = localStorage.getItem(SHIFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check if shift belongs to current user
        if (parsed.user_id === user?.id) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading shift from storage:', e);
    }
    return null;
  });

  // Save shift to localStorage whenever it changes
  useEffect(() => {
    if (currentShift) {
      localStorage.setItem(SHIFT_KEY, JSON.stringify(currentShift));
    } else {
      localStorage.removeItem(SHIFT_KEY);
    }
  }, [currentShift]);

  // Clear shift if user changes
  useEffect(() => {
    if (currentShift && user && currentShift.user_id !== user.id) {
      setCurrentShift(null);
    }
  }, [user, currentShift]);

  // Start a new shift
  const startShift = useCallback((startingCash) => {
    if (!user) return false;

    const newShift = {
      id: Date.now(),
      user_id: user.id,
      user_name: user.name || user.email,
      started_at: new Date().toISOString(),
      starting_cash: parseFloat(startingCash) || 0,
      status: 'active',
      transactions: [],
      total_sales: 0,
      total_cash: parseFloat(startingCash) || 0,
      total_debit: 0
    };

    setCurrentShift(newShift);
    return true;
  }, [user]);

  // End current shift
  const endShift = useCallback((endingCash, notes = '') => {
    if (!currentShift) return null;

    const endedShift = {
      ...currentShift,
      ended_at: new Date().toISOString(),
      ending_cash: parseFloat(endingCash) || 0,
      notes,
      status: 'ended',
      cash_difference: (parseFloat(endingCash) || 0) - currentShift.total_cash
    };

    // Store ended shift in history
    try {
      const history = JSON.parse(localStorage.getItem('candiez_shift_history') || '[]');
      history.push(endedShift);
      // Keep only last 30 shifts
      if (history.length > 30) {
        history.shift();
      }
      localStorage.setItem('candiez_shift_history', JSON.stringify(history));
    } catch (e) {
      console.error('Error saving shift history:', e);
    }

    setCurrentShift(null);
    return endedShift;
  }, [currentShift]);

  // Record a transaction in the current shift
  const recordTransaction = useCallback((transaction) => {
    if (!currentShift) return;

    setCurrentShift(prev => ({
      ...prev,
      transactions: [...prev.transactions, transaction],
      total_sales: prev.total_sales + transaction.total,
      total_cash: transaction.payment_method === 'cash'
        ? prev.total_cash + transaction.total
        : prev.total_cash,
      total_debit: transaction.payment_method === 'debit'
        ? prev.total_debit + transaction.total
        : prev.total_debit
    }));
  }, [currentShift]);

  // Check if shift is active
  const isShiftActive = currentShift?.status === 'active';

  const value = {
    currentShift,
    isShiftActive,
    startShift,
    endShift,
    recordTransaction
  };

  return (
    <ShiftContext.Provider value={value}>
      {children}
    </ShiftContext.Provider>
  );
}

export function useShift() {
  const context = useContext(ShiftContext);
  if (!context) {
    throw new Error('useShift must be used within a ShiftProvider');
  }
  return context;
}
