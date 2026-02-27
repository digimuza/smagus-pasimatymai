'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface PlayerSubscription {
  plan: 'free' | 'monthly' | 'yearly';
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'expired';
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  trialEnd?: string;
}

export interface Player {
  id: number;
  email: string;
  name?: string;
  avatar?: string;
  provider: 'email' | 'google' | 'apple';
  locale?: string;
  preferredAudience?: string;
  activeCategories?: string[];
  spicySettings?: {
    enabled?: boolean;
    rarity?: string;
    enabledTypes?: string[];
  };
}

interface AuthContextType {
  player: Player | null;
  subscription: PlayerSubscription | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  refreshPlayer: () => Promise<void>;
  updatePlayer: (data: Partial<Player>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [subscription, setSubscription] = useState<PlayerSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check current session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const fetchSubscription = async (playerId: number) => {
    try {
      const res = await fetch(`/api/subscriptions?where[player][equals]=${playerId}&limit=1`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.docs?.[0]) {
          const sub = data.docs[0];
          setSubscription({
            plan: sub.plan,
            status: sub.status,
            currentPeriodEnd: sub.currentPeriodEnd,
            cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
            trialEnd: sub.trialEnd,
          });
          return;
        }
      }
    } catch {
      // ignore
    }
    setSubscription({ plan: 'free', status: 'active' });
  };

  const checkSession = async () => {
    try {
      const res = await fetch('/api/players/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setPlayer(data.user);
          await fetchSubscription(data.user.id);
        }
      }
    } catch {
      // Not authenticated
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPlayer = useCallback(async () => {
    try {
      const res = await fetch('/api/players/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setPlayer(data.user);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch('/api/players/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        setPlayer(data.user);
        return { success: true };
      }

      const error = await res.json().catch(() => ({}));
      return { success: false, error: error.message || 'Login failed' };
    } catch {
      return { success: false, error: 'Network error' };
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, name, provider: 'email' }),
      });

      if (res.ok) {
        // Auto-login after registration
        const loginResult = await login(email, password);
        return loginResult;
      }

      const error = await res.json().catch(() => ({}));
      const errorMsg = error.errors?.[0]?.message || error.message || 'Registration failed';
      return { success: false, error: errorMsg };
    } catch {
      return { success: false, error: 'Network error' };
    }
  }, [login]);

  const loginWithGoogle = useCallback(() => {
    window.location.href = '/api/auth/google';
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/players/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignore
    }
    setPlayer(null);
    setSubscription(null);
  }, []);

  const updatePlayer = useCallback(async (data: Partial<Player>) => {
    if (!player) return;
    try {
      const res = await fetch(`/api/players/${player.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setPlayer(updated.doc);
      }
    } catch {
      // ignore
    }
  }, [player]);

  return (
    <AuthContext.Provider
      value={{
        player,
        subscription,
        isAuthenticated: !!player,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshPlayer,
        updatePlayer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
