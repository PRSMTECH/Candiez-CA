import { createContext, useContext, useState, useCallback } from 'react';

const TutorialContext = createContext(null);

const TUTORIAL_STORAGE_KEY = 'candiez_tutorial_completed';

export function TutorialProvider({ children }) {
  const [showTutorial, setShowTutorial] = useState(() => {
    // Check if user has already completed the tutorial
    const completed = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    return !completed;
  });

  const completeTutorial = useCallback(() => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    setShowTutorial(false);
  }, []);

  const resetTutorial = useCallback(() => {
    localStorage.removeItem(TUTORIAL_STORAGE_KEY);
    setShowTutorial(true);
  }, []);

  const value = {
    showTutorial,
    completeTutorial,
    resetTutorial
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}

export default TutorialContext;
