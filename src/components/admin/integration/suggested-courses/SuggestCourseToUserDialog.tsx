
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface User {
  id: string;
  display_name: string;
  email: string;
}

interface Company {
  id: string;
  nome: string;
}

interface Course {
  id: string;
  title: string;
  instructor?: string;
}

interface SuggestCourseToUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuggestionCreated: () => void;
}

export const SuggestCourseToUserDialog: React.FC<SuggestCourseToUserDialogProps> = ({
  open,
  onOpenChange,
  onSuggestionCreated
}) => {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .order('display_name');

      if (usersError) {
        console.error('Error fetching users:', usersError);
        toast.error('Erro ao carregar usuários');
        return;
      }

      setUsers(usersData || []);

      // Fetch companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('empresas')
        .select('id, nome')
        .order('nome');

      if (companiesError) {
        console.error('Error fetching companies:', companiesError);
        toast.error('Erro ao carregar empresas');
        return;
      }

      setCompanies(companiesData || []);

      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, instructor')
        .order('title');

      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        toast.error('Erro ao carregar cursos');
        return;
      }

      setCourses(coursesData || []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser || !selectedCompany || !selectedCourse || !reason.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!userProfile?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('user_course_suggestions')
        .insert({
          user_id: selectedUser,
          course_id: selectedCourse,
          company_id: selectedCompany,
          suggested_by: userProfile.id,
          reason: reason.trim()
        });

      if (error) {
        console.error('Error creating suggestion:', error);
        if (error.code === '23505') {
          toast.error('Este curso já foi sugerido para este usuário nesta empresa');
        } else {
          toast.error('Erro ao criar sugestão');
        }
        return;
      }

      toast.success('Sugestão de curso criada com sucesso');
      onSuggestionCreated();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error creating suggestion:', error);
      toast.error('Erro ao criar sugestão');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedUser('');
    setSelectedCompany('');
    setSelectedCourse('');
    setReason('');
  };

  useEffect(() => {
    if (open) {
      fetchInitialData();
    } else {
      resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sugerir Curso para Usuário</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user">Usuário *</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
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
              <Label htmlFor="company">Empresa *</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course">Curso *</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
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
              <Label htmlFor="reason">Motivo da Sugestão *</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explique por que este curso é adequado para este usuário..."
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Sugestão'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
