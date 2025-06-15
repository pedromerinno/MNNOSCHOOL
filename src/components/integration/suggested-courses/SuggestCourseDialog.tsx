
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";

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
        console.error('Error fetching courses:', error);
        return;
      }

      const coursesList = data?.map(item => item.course).filter(Boolean) || [];
      setCourses(coursesList);
    } catch (error) {
      console.error('Error fetching courses:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourse || !selectedUser || !reason.trim()) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_course_suggestions')
        .insert({
          course_id: selectedCourse,
          user_id: selectedUser,
          suggested_by: userProfile?.id,
          company_id: companyId,
          reason: reason.trim()
        });

      if (error) {
        console.error('Error suggesting course:', error);
        toast.error('Erro ao sugerir curso');
        return;
      }

      toast.success('Curso sugerido com sucesso!');
      onCourseSuggested();
      onOpenChange(false);
      resetForm();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sugerir Curso</DialogTitle>
          <DialogDescription>
            Selecione um curso para sugerir a um colaborador
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user">Colaborador</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar colaborador..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
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

          <div className="space-y-2">
            <Label htmlFor="course">Curso</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar curso..."
                value={searchCourse}
                onChange={(e) => setSearchCourse(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
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

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo da sugestão</Label>
            <Textarea
              id="reason"
              placeholder="Por que você está sugerindo este curso?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
              style={{ backgroundColor: companyColor }}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Sugerir
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
