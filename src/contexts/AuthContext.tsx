import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { initializeStorage } from "@/utils/setupStorage";

type UserProfile = {
  displayName: string | null;
  avatar: string | null;
  isAdmin?: boolean;
  cargo?: string | null;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userProfile: UserProfile;
  updateUserProfile: (profile: UserProfile) => Promise<void>;
  makeAdmin: () => Promise<void>;
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

/**
 * Helper function to clear all company-related cache when logging in or out
 */
const clearCompanyCache = () => {
  localStorage.removeItem('userCompanies');
  localStorage.removeItem('userCompaniesTimestamp');
  localStorage.removeItem('selectedCompanyId');
  localStorage.removeItem('selectedCompany');
  console.log('All company cache cleared during auth state change');
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    displayName: null,
    avatar: null,
    isAdmin: false,
    cargo: null
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: columnExists, error: columnCheckError } = await supabase
        .from('profiles')
        .select('is_admin')
        .limit(1)
        .maybeSingle();
      
      const isAdminColumnExists = !columnCheckError || !columnCheckError.message.includes("column 'is_admin' does not exist");
      
      const columnsToSelect = isAdminColumnExists 
        ? 'display_name, avatar, is_admin, cargo' 
        : 'display_name, avatar, cargo';
      
      const { data, error } = await supabase
        .from('profiles')
        .select(columnsToSelect)
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

      if (data && typeof data === 'object') {
        const profileData = data as any;
        
        const displayName = profileData.display_name !== undefined ? profileData.display_name : null;
        const avatar = profileData.avatar !== undefined ? profileData.avatar : null;
        const cargo = profileData.cargo !== undefined ? profileData.cargo : null;
        const isAdmin = isAdminColumnExists && profileData.is_admin === true;
        
        setUserProfile({
          displayName,
          avatar,
          isAdmin,
          cargo
        });
      } else {
        console.error('Invalid data format received from database:', data);
        setUserProfile({
          displayName: null,
          avatar: null,
          isAdmin: false,
          cargo: null
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
      
      const { data: columnExists, error: columnCheckError } = await supabase
        .from('profiles')
        .select('is_admin')
        .limit(1)
        .maybeSingle();
      
      const isAdminColumnExists = !columnCheckError || !columnCheckError.message.includes("column 'is_admin' does not exist");
      
      const insertData: any = {
        id: userId,
        display_name: displayName,
        avatar: null,
        cargo: null
      };
      
      if (isAdminColumnExists) {
        insertData.is_admin = false;
      }
      
      const { error } = await supabase
        .from('profiles')
        .insert(insertData);

      if (error) {
        console.error('Error creating profile:', error);
        return;
      }

      setUserProfile({
        displayName,
        avatar: null,
        isAdmin: false,
        cargo: null
      });
      
      console.log('User profile created successfully');
    } catch (error) {
      console.error('Error in createUserProfile:', error);
    }
  };

  const updateUserProfile = async (profile: UserProfile) => {
    if (!user) return;

    try {
      const { data: columnExists, error: columnCheckError } = await supabase
        .from('profiles')
        .select('is_admin')
        .limit(1)
        .maybeSingle();
      
      const isAdminColumnExists = !columnCheckError || !columnCheckError.message.includes("column 'is_admin' does not exist");
      
      const updateData: any = {
        display_name: profile.displayName,
        avatar: profile.avatar,
        updated_at: new Date().toISOString()
      };
      
      if (isAdminColumnExists && profile.isAdmin !== undefined) {
        updateData.is_admin = profile.isAdmin;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
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

  const makeAdmin = async () => {
    if (!user) return;
    
    try {
      const { data: columnExists, error: columnCheckError } = await supabase
        .from('profiles')
        .select('is_admin')
        .limit(1)
        .maybeSingle();
      
      const isAdminColumnExists = !columnCheckError || !columnCheckError.message.includes("column 'is_admin' does not exist");
      
      if (!isAdminColumnExists) {
        toast({
          title: "Funcionalidade não disponível",
          description: "A funcionalidade de administrador ainda não está disponível. Por favor, configure o banco de dados primeiro.",
          variant: "destructive",
        });
        return;
      }
      
      const updatedProfile = {
        ...userProfile,
        isAdmin: true
      };
      
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
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await initializeStorage();
          
          fetchUserProfile(session.user.id);
        }
        
        if (event === 'SIGNED_IN') {
          clearCompanyCache();
          toast({
            title: "Login bem-sucedido",
            description: "Você foi conectado com sucesso.",
          });
        } else if (event === 'SIGNED_OUT') {
          clearCompanyCache();
          toast({
            title: "Desconectado",
            description: "Você foi desconectado com sucesso.",
          });
          setUserProfile({
            displayName: null,
            avatar: null,
            cargo: null
          });
        }
      }
    );

    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await initializeStorage();
        
        fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
    };
    
    initialize();

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
      
      clearCompanyCache();
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
    clearCompanyCache();
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
