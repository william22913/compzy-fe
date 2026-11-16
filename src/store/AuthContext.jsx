import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  fetchCurrentUser,
  register as registerRequest,
  signIn as signInRequest,
  signOut as signOutRequest,
} from '../core/services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // status: loading | guest | member
  const [state, setState] = useState({ status: 'loading', user: null });

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    fetchCurrentUser({ signal: controller.signal })
      .then((user) => {
        if (!active) return;
        setState(user ? { status: 'member', user } : { status: 'guest', user: null });
      })
      .catch(() => {
        if (active) setState({ status: 'guest', user: null });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const signIn = useCallback(async (credentials) => {
    const user = await signInRequest(credentials);
    setState({ status: 'member', user });
    return user;
  }, []);

  const register = useCallback(async (details) => {
    const user = await registerRequest(details);
    setState({ status: 'member', user });
    return user;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await signOutRequest();
    } finally {
      setState({ status: 'guest', user: null });
    }
  }, []);

  const expireSession = useCallback(() => {
    setState({ status: 'guest', user: null });
  }, []);

  const value = useMemo(
    () => ({ status: state.status, user: state.user, signIn, register, signOut, expireSession }),
    [state, signIn, register, signOut, expireSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
