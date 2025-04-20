import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/user';
import { toast } from 'sonner';

interface AuthContextType {
  user: any;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, displayName: string, metadata?: { interests?: string[] }) => Promise<void>;
  updateUserProfile: (userData: Partial<UserProfile>) => Promise<void>;
  updateUserData: (userData: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const setupAuth = async () => {
      try {
        setLoading(true);
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log(`Auth event: ${event}`);
            
            setSession(newSession);
            setUser(newSession?.user || null);
            
            if (newSession?.user) {
              setTimeout(async () => {
                await fetchUserProfile(newSession.user.id);
              }, 0);
            } else if (event === 'SIGNED_OUT') {
              setUserProfile(null);
            }
          }
        );
        
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
          await fetchUserProfile(data.session.user.id);
        }
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Erro ao configurar autenticação:', error);
        toast.error('Erro ao carregar a sessão. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    setupAuth();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log(`Buscando perfil do usuário: ${userId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return;
      }

      if (data) {
        const profile: UserProfile = {
          id: data.id,
          email: data.email,
          display_name: data.display_name,
          is_admin: data.is_admin,
          super_admin: data.super_admin,
          avatar: data.avatar,
          cargo_id: data.cargo_id,
          interesses: data.interesses
        };
        
        console.log('Perfil de usuário carregado:', profile);
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        await fetchUserProfile(data.session.user.id);
        navigate('/');
      }

      return { error: null };
    } catch (error: any) {
      console.error('Erro no login:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      
      setUser(null);
      setSession(null);
      setUserProfile(null);
      
      navigate('/');
      toast.success('Você saiu da sua conta');
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    displayName: string, 
    metadata?: { interests?: string[] }
  ) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            interests: metadata?.interests || [],
          },
          emailRedirectTo: window.location.origin
        },
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            display_name: displayName,
            interesses: metadata?.interests || []
          })
          .eq('id', data.user.id);
          
        if (profileError) {
          console.error('Erro ao atualizar perfil:', profileError);
        }
      }

      toast.success('Verifique seu email para confirmar o cadastro.');
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast.error(error.error_description || error.message || 'Falha no cadastro');
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (userData: Partial<UserProfile>) => {
    setUserProfile(prev => prev ? ({
      ...prev,
      ...userData,
    }) : null);
  };

  const updateUserData = async (userData: Partial<UserProfile>) => {
    if (!user) {
      toast.error('Nenhum usuário logado');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', user.id);

      if (error) {
        console.error('Erro ao atualizar dados do usuário:', error);
        toast.error('Erro ao atualizar dados: ' + error.message);
        return;
      }

      setUserProfile(prevProfile => prevProfile ? ({
        ...prevProfile,
        ...userData,
      }) : null);
      
      toast.success('Perfil atualizado com sucesso');
    } catch (error: any) {
      console.error('Erro ao atualizar dados do usuário:', error);
      toast.error('Erro ao atualizar dados: ' + error.message);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    userProfile,
    loading,
    signInWithPassword,
    signOut,
    signUp,
    updateUserProfile,
    updateUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
