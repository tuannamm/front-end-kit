import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '../core/button/button';

export type ThemeMode = 'system' | 'light' | 'dark';
/** Stores the choice per browser and applies data-theme on <html>. */
export function useTheme(): [ThemeMode, (m: ThemeMode) => void] {
  const [mode, setMode] = useState<ThemeMode>(() => { try { return (localStorage.getItem('dtx-theme') as ThemeMode) || 'system'; } catch { return 'system'; } });
  useEffect(() => {
    const el = document.documentElement;
    if (mode === 'system') el.removeAttribute('data-theme'); else el.dataset.theme = mode;
    try { localStorage.setItem('dtx-theme', mode); } catch { /* storage blocked */ }
  }, [mode]);
  return [mode, setMode];
}

export function ThemeToggle() {
  const [mode, setMode] = useTheme();
  const next: Record<ThemeMode, ThemeMode> = { system: 'light', light: 'dark', dark: 'system' };
  const icon = { system: <Monitor />, light: <Sun />, dark: <Moon /> }[mode];
  return <Button variant="secondary" icon aria-label={`Giao diện: ${mode}`} title={`Giao diện: ${mode}`} onClick={() => setMode(next[mode])}>{icon}</Button>;
}
