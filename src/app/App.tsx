/**
 * Root application component
 */

import { useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { currentRoute, initRouter } from './router.ts';
import { toggleTheme, getEffectiveTheme } from './theme.ts';
import { markVisited } from './state.ts';
import { ContentView } from './components/ContentView.tsx';

export function App() {
  const theme = useSignal(getEffectiveTheme());
  
  useEffect(() => {
    initRouter();
  }, []);
  
  // Mark nodes as visited when viewed
  useEffect(() => {
    const nodeId = currentRoute.value.nodeId;
    markVisited(nodeId);
  }, [currentRoute.value.nodeId]);
  
  const handleThemeToggle = () => {
    toggleTheme();
    theme.value = getEffectiveTheme();
  };
  
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <a href="#/" className="app-logo">
            Understanding Frontier AI
          </a>
          
          <button 
            className="theme-toggle" 
            onClick={handleThemeToggle}
            aria-label={`Switch to ${theme.value === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme.value === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>
      
      <main className="app-main">
        <ContentView />
      </main>
      
      <footer className="app-footer">
        <div className="content-width">
          <p>
            An open educational resource for understanding how AI actually works.
          </p>
        </div>
      </footer>
    </div>
  );
}

