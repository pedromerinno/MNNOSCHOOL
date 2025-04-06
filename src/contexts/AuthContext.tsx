
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type UserProfile = {
  displayName: string | null;
  avatar: string | null;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userProfile: UserProfile;
  updateUserProfile: (profile: UserProfile) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    displayName: null,
    avatar: null
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Function to fetch user profile from Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, avatar')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        setUserProfile({
          displayName: data.display_name,
          avatar: data.avatar
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  // Update user profile in Supabase
  const updateUserProfile = async (profile: UserProfile) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profile.displayName,
          avatar: profile.avatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Erro ao atualizar perfil",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setUserProfile(profile);
      
      toast({
        title: "Perfil atualizado",
        description: "Seu perfil foi atualizado com sucesso.",
      });
    } catch (error: any) {
      console.error('Exception updating profile:', error);
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user profile when auth state changes and user exists
        if (session?.user) {
          fetchUserProfile(session.user.id);
        }
        
        if (event === 'SIGNED_IN') {
          toast({
            title: "Login bem-sucedido",
            description: "Você foi conectado com sucesso.",
          });
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Desconectado",
            description: "Você foi desconectado com sucesso.",
          });
          // Reset user profile on sign out
          setUserProfile({
            displayName: null,
            avatar: null
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Fetch user profile for existing session
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const signUp = async (email: string, password: string) => {
    try {
      const response = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (response.error) throw response.error;
      
      toast({
        title: "Conta criada",
        description: "Verifique seu e-mail para confirmar sua conta.",
      });
      
      return { data: response.data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (response.error) throw response.error;
      
      navigate("/"); // Changed from "/dashboard" to "/" to redirect to home page
      return { data: response.data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        userProfile,
        updateUserProfile,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
