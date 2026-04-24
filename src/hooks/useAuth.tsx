import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, getStoredUser, getToken, setStoredUser, setToken, AuthUser } from "@/lib/api";

interface AuthCtx {
  user: AuthUser | null;
  // session kept for compatibility with existing components
  session: { user: AuthUser } | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: {
    email: string;
    password: string;
    full_name: string;
    whatsapp: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const stored = getStoredUser();
    if (token && stored) setUser(stored);
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await api<{ token: string; user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
    setToken(res.token);
    setStoredUser(res.user);
    setUser(res.user);
  };

  const signUp = async (data: {
    email: string;
    password: string;
    full_name: string;
    whatsapp: string;
  }) => {
    const res = await api<{ token: string; user: AuthUser }>("/api/auth/signup", {
      method: "POST",
      body: data,
    });
    setToken(res.token);
    setStoredUser(res.user);
    setUser(res.user);
  };

  const signOut = async () => {
    setToken(null);
    setStoredUser(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session: user ? { user } : null,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
