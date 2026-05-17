'use client';

import Script from 'next/script';
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  storageKey?: string;
}

interface ThemeContextValue {
  theme: string | undefined;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: undefined, setTheme: () => {} });

export { ThemeContext };

export function useTheme() {
  return useContext(ThemeContext);
}

function getSystemTheme(): string {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(storageKey: string): string | null {
  try {
    return localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function resolveTheme(storageKey: string, defaultTheme: string, enableSystem: boolean): string {
  const stored = getStoredTheme(storageKey);
  if (stored) return stored;
  if (defaultTheme === 'system' && enableSystem) return getSystemTheme();
  return defaultTheme;
}

function applyThemeToDOM(
  attribute: string | string[],
  theme: string,
  disableTransitionOnChange: boolean,
) {
  const attrs = Array.isArray(attribute) ? attribute : [attribute];
  const root = document.documentElement;

  if (disableTransitionOnChange) {
    const css = document.createElement('style');
    css.id = 'next-style-disable-transition';
    css.textContent = '*,*::before,*::after{transition:none!important}';
    document.head.appendChild(css);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById('next-style-disable-transition');
        if (el) el.remove();
      });
    });
  }

  const prev = ['light', 'dark'];
  attrs.forEach((attr) => {
    if (attr === 'class') {
      root.classList.remove(...prev);
      root.classList.add(theme);
    } else {
      if (root.getAttribute(attr) !== theme) {
        root.setAttribute(attr, theme);
      }
    }
  });

  if (theme === 'light' || theme === 'dark') {
    root.style.colorScheme = theme;
  }
}

export function ThemeProvider({
  children,
  attribute = 'data-theme',
  defaultTheme = 'system',
  enableSystem = true,
  disableTransitionOnChange = false,
  storageKey = 'theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<string>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const resolved = resolveTheme(storageKey, defaultTheme, enableSystem);
    setThemeState(resolved);
    applyThemeToDOM(attribute, resolved, disableTransitionOnChange);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!enableSystem) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const current = getStoredTheme(storageKey);
      if (!current || current === 'system') {
        const newTheme = getSystemTheme();
        setThemeState(newTheme);
        applyThemeToDOM(attribute, newTheme, disableTransitionOnChange);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [enableSystem, storageKey, attribute, disableTransitionOnChange]);

  const setTheme = useCallback(
    (newTheme: string) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch {}
      applyThemeToDOM(attribute, newTheme, disableTransitionOnChange);
    },
    [storageKey, attribute, disableTransitionOnChange],
  );

  const value = useMemo(
    () => ({ theme: mounted ? theme : undefined, setTheme }),
    [theme, mounted, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <Script id="theme-init" strategy="beforeInteractive">
        {`
          (function() {
            var key = '${storageKey}';
            var def = '${defaultTheme}';
            var sys = ${enableSystem};
            var attr = '${typeof attribute === 'string' ? attribute : 'class'}';

            var root = document.documentElement;
            var theme;
            try { theme = localStorage.getItem(key); } catch(e) {}
            if (!theme) {
              if (def === 'system' && sys) {
                theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              } else {
                theme = def;
              }
            }
            if (attr === 'class') {
              root.classList.remove('light', 'dark');
              root.classList.add(theme);
            } else {
              root.setAttribute(attr, theme);
            }
            if (theme === 'light' || theme === 'dark') {
              root.style.colorScheme = theme;
            }
          })();
        `}
      </Script>
      {children}
    </ThemeContext.Provider>
  );
}
