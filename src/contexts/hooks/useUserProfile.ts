
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "../types/auth-types";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    displayName: null,
    avatar: null,
    isAdmin: false,
    cargo: null
  });
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
        
        setUserProfile({
          displayName: profileData.display_name ?? null,
          avatar: profileData.avatar ?? null,
          isAdmin: isAdminColumnExists && profileData.is_admin === true,
          cargo: profileData.cargo ?? null
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const createUserProfile = async (userId: string, user?: User) => {
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
        .eq('id', supabase.auth.getUser().data.user?.id);

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
        .eq('id', supabase.auth.getUser().data.user?.id);
      
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

  return {
    userProfile,
    fetchUserProfile,
    createUserProfile,
    updateUserProfile,
    makeAdmin
  };
};
