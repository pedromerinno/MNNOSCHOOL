
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
    isAdmin: false // Initialize as non-admin
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      // First, check if the is_admin column exists
      const { data: columnExists, error: columnCheckError } = await supabase
        .from('profiles')
        .select('is_admin')
        .limit(1)
        .maybeSingle();
      
      // If there's an error specifically about is_admin column not existing
      const isAdminColumnExists = !columnCheckError || !columnCheckError.message.includes("column 'is_admin' does not exist");
      
      // Select only columns that are guaranteed to exist
      const columnsToSelect = isAdminColumnExists 
        ? 'display_name, avatar, is_admin' 
        : 'display_name, avatar';
      
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

      // Properly check if data exists and is a valid object
      if (data && typeof data === 'object') {
        // Explicitly cast data to any to safely access properties
        const profileData = data as any;
        
        // Extract properties with type safety
        const displayName = profileData.display_name !== undefined ? profileData.display_name : null;
        const avatar = profileData.avatar !== undefined ? profileData.avatar : null;
        // For is_admin, check if the column exists and has a valid boolean value
        const isAdmin = isAdminColumnExists && profileData.is_admin === true;
        
        setUserProfile({
          displayName,
          avatar,
          isAdmin
        });
      } else {
        console.error('Invalid data format received from database:', data);
        // Set default values if data is invalid
        setUserProfile({
          displayName: null,
          avatar: null,
          isAdmin: false
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
      
      // Check if is_admin column exists before trying to insert it
      const { data: columnExists, error: columnCheckError } = await supabase
        .from('profiles')
        .select('is_admin')
        .limit(1)
        .maybeSingle();
      
      // If there's an error specifically about is_admin column not existing
      const isAdminColumnExists = !columnCheckError || !columnCheckError.message.includes("column 'is_admin' does not exist");
      
      // Create the insert object with only the columns that exist
      const insertData: any = {
        id: userId,
        display_name: displayName,
        avatar: null
      };
      
      // Only add is_admin if the column exists
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
      // Check if is_admin column exists before trying to update it
      const { data: columnExists, error: columnCheckError } = await supabase
        .from('profiles')
        .select('is_admin')
        .limit(1)
        .maybeSingle();
      
      // If there's an error specifically about is_admin column not existing
      const isAdminColumnExists = !columnCheckError || !columnCheckError.message.includes("column 'is_admin' does not exist");
      
      // Create update object with only the columns that exist
      const updateData: any = {
        display_name: profile.displayName,
        avatar: profile.avatar,
        updated_at: new Date().toISOString()
      };
      
      // Only add is_admin if the column exists
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

  // Function to make the current user an admin
  const makeAdmin = async () => {
    if (!user) return;
    
    try {
      // Check if is_admin column exists before trying to update it
      const { data: columnExists, error: columnCheckError } = await supabase
        .from('profiles')
        .select('is_admin')
        .limit(1)
        .maybeSingle();
      
      // If there's an error specifically about is_admin column not existing
      const isAdminColumnExists = !columnCheckError || !columnCheckError.message.includes("column 'is_admin' does not exist");
      
      if (!isAdminColumnExists) {
        // If column doesn't exist, notify the user
        toast({
          title: "Funcionalidade não disponível",
          description: "A funcionalidade de administrador ainda não está disponível. Por favor, configure o banco de dados primeiro.",
          variant: "destructive",
        });
        return;
      }
      
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
          // Clear cache on sign in to ensure fresh data is loaded
          clearCompanyCache();
          toast({
            title: "Login bem-sucedido",
            description: "Você foi conectado com sucesso.",
          });
        } else if (event === 'SIGNED_OUT') {
          // Clear cache on sign out
          clearCompanyCache();
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
      
      // Clear cache and fetch fresh data on sign in
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
    // Clear cache before signing out
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
