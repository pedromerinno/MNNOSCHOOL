
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { UseProfileActions, UseProfileState } from "./types";
import { UserProfile } from "@/contexts/types/auth-types";

export const useProfileActions = ({ setUserProfile }: Pick<UseProfileState, 'setUserProfile'>): UseProfileActions => {
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

      const userData = await supabase.auth.getUser();
      const userId = userData.data.user?.id;

      if (!userId) {
        toast({
          title: "Erro ao atualizar perfil",
          description: "Usuário não encontrado",
          variant: "destructive",
        });
        throw new Error("User not found");
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

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

  return {
    fetchUserProfile,
    createUserProfile,
    updateUserProfile
  };
};
