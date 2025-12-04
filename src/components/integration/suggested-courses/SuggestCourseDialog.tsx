import React, { useState, useEffect, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HorizontalSettingsDialog, SettingsSection } from "@/components/ui/horizontal-settings-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Search } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  image_url: string;
  instructor: string;
}

interface User {
  id: string;
  display_name: string;
  email: string;
}

interface SuggestCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyColor: string;
  onCourseSuggested: () => void;
}

export const SuggestCourseDialog: React.FC<SuggestCourseDialogProps> = ({
  open,
  onOpenChange,
  companyId,
  companyColor,
  onCourseSuggested
}) => {
  const { userProfile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchCourse, setSearchCourse] = useState('');
  const [searchUser, setSearchUser] = useState('');

  const fetchCourses = async () => {
    try {
      console.log('[SuggestCourseDialog] Fetching courses for company:', companyId);
      const { data, error } = await supabase
        .from('company_courses')
        .select(`
          course:courses(
            id,
            title,
            description,
            image_url,
            instructor
          )
        `)
        .eq('empresa_id', companyId);

      if (error) {
        console.error('[SuggestCourseDialog] Error fetching courses:', error);
        toast.error(`Erro ao carregar cursos: ${error.message}`);
        return;
      }

      console.log('[SuggestCourseDialog] Courses data:', data);
      const coursesList = data?.map(item => item.course).filter(Boolean) || [];
      console.log('[SuggestCourseDialog] Processed courses:', coursesList);
      setCourses(coursesList);
      
      if (coursesList.length === 0) {
        console.warn('[SuggestCourseDialog] No courses found for company:', companyId);
        toast.error('Nenhum curso encontrado para esta empresa');
      }
    } catch (error) {
      console.error('[SuggestCourseDialog] Error fetching courses:', error);
      toast.error('Erro ao carregar cursos');
    }
  };

  const fetchCompanyUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_empresa')
        .select(`
          user:profiles(
            id,
            display_name,
            email
          )
        `)
        .eq('empresa_id', companyId);

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      const usersList = data?.map(item => item.user).filter(Boolean) || [];
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async () => {
    // Validações com feedback
    if (!selectedCourse) {
      toast.error('Por favor, selecione um curso');
      return;
    }
    
    if (!selectedUser) {
      toast.error('Por favor, selecione um colaborador');
      return;
    }
    
    if (!reason.trim()) {
      toast.error('Por favor, informe o motivo da sugestão');
      return;
    }

    if (!userProfile?.id) {
      toast.error('Erro de autenticação. Por favor, faça login novamente.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_course_suggestions')
        .insert({
          course_id: selectedCourse,
          user_id: selectedUser,
          suggested_by: userProfile.id,
          company_id: companyId,
          reason: reason.trim()
        });

      if (error) {
        console.error('Error suggesting course:', error);
        if (error.code === '23505') {
          toast.error('Este curso já foi sugerido para este colaborador nesta empresa');
        } else if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('row-level security')) {
          toast.error('Você não tem permissão para criar sugestões. Verifique se você é um administrador.');
        } else {
          toast.error(`Erro ao sugerir curso: ${error.message || 'Erro desconhecido'}`);
        }
        return;
      }

      toast.success('Curso sugerido com sucesso!');
      onCourseSuggested();
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error suggesting course:', error);
      toast.error('Erro ao sugerir curso');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCourse('');
    setSelectedUser('');
    setReason('');
    setSearchCourse('');
    setSearchUser('');
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchCourse.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.display_name?.toLowerCase().includes(searchUser.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchUser.toLowerCase())
  );

  const isFormValid = () => {
    return selectedCourse.trim() !== '' && 
           selectedUser.trim() !== '' && 
           reason.trim() !== '';
  };

  useEffect(() => {
    if (open && companyId) {
      fetchCourses();
      fetchCompanyUsers();
    }
  }, [open, companyId]);

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const sections: SettingsSection[] = useMemo(() => {
    const generalSectionContent = (
      <div className="space-y-8">
        {/* Colaborador */}
        <div className="space-y-2">
          <Label htmlFor="user" className="text-sm font-semibold text-gray-900">
            Colaborador
          </Label>
          <p className="text-xs text-gray-500 mt-1">
            Selecione o colaborador que receberá a sugestão
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar colaborador..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Selecione um colaborador" />
            </SelectTrigger>
            <SelectContent>
              {filteredUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.display_name || user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Curso */}
        <div className="space-y-2">
          <Label htmlFor="course" className="text-sm font-semibold text-gray-900">
            Curso
          </Label>
          <p className="text-xs text-gray-500 mt-1">
            Selecione o curso que será sugerido
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar curso..."
              value={searchCourse}
              onChange={(e) => setSearchCourse(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Selecione um curso" />
            </SelectTrigger>
            <SelectContent>
              {filteredCourses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Motivo da sugestão */}
        <div className="space-y-2">
          <Label htmlFor="reason" className="text-sm font-semibold text-gray-900">
            Motivo da Sugestão
          </Label>
          <p className="text-xs text-gray-500 mt-1">
            Explique por que este curso seria útil para este colaborador
          </p>
          <Textarea
            id="reason"
            placeholder="Por que você está sugerindo este curso?"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="resize-none"
            required
          />
        </div>
      </div>
    );

    return [
      {
        id: 'general',
        label: 'General',
        content: generalSectionContent
      }
    ];
  }, [selectedUser, selectedCourse, reason, searchUser, searchCourse, filteredUsers, filteredCourses]);

  return (
    <HorizontalSettingsDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Sugerir Curso"
      sections={sections}
      defaultSectionId="general"
      onCancel={() => {
        resetForm();
        onOpenChange(false);
      }}
      onSave={handleSubmit}
      saveLabel="Sugerir"
      cancelLabel="Cancelar"
      isSaving={isLoading}
      isFormValid={isFormValid()}
      saveButtonStyle={isFormValid() ? { 
        backgroundColor: companyColor,
        borderColor: companyColor
      } : undefined}
    />
  );
};
