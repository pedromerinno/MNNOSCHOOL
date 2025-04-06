
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type UserProfile = {
  displayName: string | null;
  avatar: string | null;
  isAdmin?: boolean; // Add isAdmin property
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userProfile: UserProfile;
  updateUserProfile: (profile: UserProfile) => Promise<void>;
  makeAdmin: () => Promise<void>; // Add function to make user admin
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
    avatar: null,
    isAdmin: false // Initialize as non-admin
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, avatar, is_admin')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating a new one...');
          await createUserProfile(userId);
          return;
        }
        return;
      }

      if (data) {
        setUserProfile({
          displayName: data.display_name,
          avatar: data.avatar,
          isAdmin: data.is_admin || false
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      const email = user?.email || '';
      const displayName = email.split('@')[0];
      
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          display_name: displayName,
          avatar: null,
          is_admin: false
        });

      if (error) {
        console.error('Error creating profile:', error);
        return;
      }

      setUserProfile({
        displayName,
        avatar: null,
        isAdmin: false
      });
      
      console.log('User profile created successfully');
    } catch (error) {
      console.error('Error in createUserProfile:', error);
    }
  };

  const updateUserProfile = async (profile: UserProfile) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profile.displayName,
          avatar: profile.avatar,
          is_admin: profile.isAdmin,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile in database:', error);
        toast({
          title: "Erro ao atualizar perfil",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      setUserProfile(profile);
      
      console.log('Profile updated successfully in database');
      toast({
        title: "Perfil atualizado",
        description: "Seu perfil foi atualizado com sucesso na base de dados.",
      });
    } catch (error: any) {
      console.error('Exception updating profile in database:', error);
      throw error;
    }
  };

  // Function to make the current user an admin
  const makeAdmin = async () => {
    if (!user) return;
    
    try {
      // Update local state
      const updatedProfile = {
        ...userProfile,
        isAdmin: true
      };
      
      // Update in the database
      const { error } = await supabase
        .from('profiles')
        .update({
          is_admin: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) {
        console.error('Error making user admin:', error);
        toast({
          title: "Erro ao atualizar perfil",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      setUserProfile(updatedProfile);
      
      toast({
        title: "Perfil atualizado",
        description: "Você agora é um administrador.",
      });
    } catch (error: any) {
      console.error('Exception making user admin:', error);
      throw error;
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
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
          setUserProfile({
            displayName: null,
            avatar: null
          });
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
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
      
      navigate("/");
      
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
        makeAdmin,
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
