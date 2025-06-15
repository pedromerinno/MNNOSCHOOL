
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";

interface Course {
  id: string;
  title: string;
  instructor?: string;
}

interface CompanyUser {
  id: string;
  display_name: string;
  email: string;
}

interface EditingSuggestion {
  id: string;
  course_id: string;
  user_id: string;
  reason: string;
}

interface SuggestCourseToUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuggestionCreated: () => void;
  editingSuggestion?: EditingSuggestion | null;
}

export const SuggestCourseToUserDialog: React.FC<SuggestCourseToUserDialogProps> = ({
  open,
  onOpenChange,
  onSuggestionCreated,
  editingSuggestion = null
}) => {
  const { selectedCompany } = useCompanies();
  const { userProfile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = Boolean(editingSuggestion);

  // Load data when dialog opens or when editing suggestion changes
  useEffect(() => {
    if (open && selectedCompany?.id) {
      fetchCourses();
      fetchUsers();
    }
  }, [open, selectedCompany?.id]);

  // Set form data when editing
  useEffect(() => {
    if (editingSuggestion) {
      setSelectedCourseId(editingSuggestion.course_id);
      setSelectedUserId(editingSuggestion.user_id);
      setReason(editingSuggestion.reason);
    } else {
      // Reset form for new suggestion
      setSelectedCourseId('');
      setSelectedUserId('');
      setReason('');
    }
  }, [editingSuggestion]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('company_courses')
        .select(`
          course_id,
          courses!inner(id, title, instructor)
        `)
        .eq('empresa_id', selectedCompany!.id);

      if (error) {
        console.error('Error fetching courses:', error);
        return;
      }

      const courseList = data?.map(item => item.courses).filter(Boolean) || [];
      setCourses(courseList);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_empresa')
        .select(`
          user_id,
          profiles!inner(id, display_name, email)
        `)
        .eq('empresa_id', selectedCompany!.id);

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      const userList = data?.map(item => ({
        id: item.profiles.id,
        display_name: item.profiles.display_name || 'Usuário sem nome',
        email: item.profiles.email || ''
      })) || [];

      setUsers(userList);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCourseId || !selectedUserId || !reason.trim()) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (!userProfile?.id || !selectedCompany?.id) {
      toast.error('Erro de autenticação');
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing) {
        // Update existing suggestion
        const { error } = await supabase
          .from('user_course_suggestions')
          .update({
            course_id: selectedCourseId,
            user_id: selectedUserId,
            reason: reason.trim(),
          })
          .eq('id', editingSuggestion!.id);

        if (error) {
          console.error('Error updating suggestion:', error);
          toast.error('Erro ao atualizar sugestão de curso');
          return;
        }

        toast.success('Sugestão de curso atualizada com sucesso!');
      } else {
        // Create new suggestion
        const { error } = await supabase
          .from('user_course_suggestions')
          .insert({
            course_id: selectedCourseId,
            user_id: selectedUserId,
            suggested_by: userProfile.id,
            company_id: selectedCompany.id,
            reason: reason.trim(),
          });

        if (error) {
          if (error.code === '23505') {
            toast.error('Este curso já foi sugerido para este usuário nesta empresa');
          } else {
            console.error('Error creating suggestion:', error);
            toast.error('Erro ao criar sugestão de curso');
          }
          return;
        }

        toast.success('Sugestão de curso criada com sucesso!');
      }

      // Reset form and close dialog
      setSelectedCourseId('');
      setSelectedUserId('');
      setReason('');
      onSuggestionCreated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      toast.error('Erro ao processar sugestão');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedCourseId('');
    setSelectedUserId('');
    setReason('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Sugestão de Curso' : 'Sugerir Curso para Usuário'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="course">Curso *</Label>
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um curso" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                    {course.instructor && ` - ${course.instructor}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user">Usuário *</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.display_name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo da Sugestão *</Label>
            <Textarea
              id="reason"
              placeholder="Explique por que este curso seria útil para este usuário..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !selectedCourseId || !selectedUserId || !reason.trim()}
          >
            {isLoading ? 'Processando...' : (isEditing ? 'Atualizar' : 'Sugerir Curso')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
