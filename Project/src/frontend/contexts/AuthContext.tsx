import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => { },
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("[AuthContext] State change:", _event, "Session:", !!session);
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    console.log("[AuthContext] signOut() called");

    // First clear state immediately
    setSession(null);
    setUser(null);

    // Then sign out from Supabase AND force clear storage
    await supabase.auth.signOut();

    // Force clear AsyncStorage to prevent session restoration
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const keys = await AsyncStorage.getAllKeys();
    const supabaseKeys = keys.filter(key => key.startsWith('supabase') || key.includes('auth'));
    await AsyncStorage.multiRemove(supabaseKeys);

    console.log("[AuthContext] signOut() complete, cleared", supabaseKeys.length, "keys");
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
