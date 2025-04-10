
import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Save, 
  Plus, 
  Trash2, 
  PlusCircle, 
  Edit, 
  BriefcaseBusiness,
  FileText
} from "lucide-react";
import { Company } from "@/types/company";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Schema for job roles
const jobRoleSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(100, "Título muito longo"),
  description: z.string().min(1, "Descrição é obrigatória").max(2000, "Descrição muito longa"),
  responsibilities: z.string().max(2000, "Texto muito longo").optional(),
  requirements: z.string().max(2000, "Texto muito longo").optional(),
  expectations: z.string().max(2000, "Texto muito longo").optional(),
});

type JobRole = z.infer<typeof jobRoleSchema>;

interface JobRolesManagerProps {
  company: Company;
}

export const JobRolesManager: React.FC<JobRolesManagerProps> = ({
  company
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState<JobRole | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<JobRole>({
    resolver: zodResolver(jobRoleSchema),
    defaultValues: {
      title: "",
      description: "",
      responsibilities: "",
      requirements: "",
      expectations: "",
    },
  });

  useEffect(() => {
    // Fetch job roles when company changes
    fetchJobRoles();
  }, [company]);

  const fetchJobRoles = async () => {
    if (!company?.id) return;
    
    setIsLoading(true);
    
    try {
      // For now we'll simulate this with a mock - in a real implementation, this would fetch from the database
      setTimeout(() => {
        const mockRoles: JobRole[] = [
          {
            title: "Desenvolvedor Full Stack",
            description: "Responsável pelo desenvolvimento de aplicações web completas, desde o backend até o frontend.",
            responsibilities: "- Desenvolver e manter aplicações web\n- Colaborar com equipes de design e produto\n- Implementar testes automatizados",
            requirements: "- Experiência com React, Node.js\n- Conhecimento de bancos de dados SQL e NoSQL\n- Boas práticas de desenvolvimento",
            expectations: "- Entrega de código de qualidade\n- Participação ativa em code reviews\n- Aprendizado contínuo"
          },
          {
            title: "Designer UX/UI",
            description: "Criar experiências de usuário excepcionais e interfaces visualmente atraentes.",
            responsibilities: "- Criar wireframes e protótipos\n- Conduzir pesquisas com usuários\n- Desenvolver design systems",
            requirements: "- Experiência com Figma ou Adobe XD\n- Portfolio com projetos relevantes\n- Conhecimento de princípios de design",
            expectations: "- Soluções centradas no usuário\n- Inovação em design\n- Colaboração com desenvolvedores"
          }
        ];
        
        setJobRoles(mockRoles);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("Erro ao buscar cargos:", error);
      toast.error("Não foi possível carregar os cargos");
      setIsLoading(false);
    }
  };

  const handleAddRole = (data: JobRole) => {
    // In a real implementation, this would save to the database
    // For now, we'll just update the local state
    
    if (currentRole) {
      // Edit existing role
      setJobRoles(prev => 
        prev.map(r => r.title === currentRole.title ? { ...data } : r)
      );
      toast.success("Cargo atualizado com sucesso");
    } else {
      // Add new role
      setJobRoles(prev => [...prev, data]);
      toast.success("Cargo adicionado com sucesso");
    }
    
    // Reset form and close dialog
    form.reset();
    setCurrentRole(null);
    setIsDialogOpen(false);
  };

  const handleRemoveRole = (role: JobRole) => {
    // In a real implementation, this would delete from the database
    setJobRoles(prev => prev.filter(r => r.title !== role.title));
    toast.success("Cargo removido com sucesso");
  };

  const handleEditRole = (role: JobRole) => {
    setCurrentRole(role);
    form.reset({
      title: role.title,
      description: role.description,
      responsibilities: role.responsibilities || "",
      requirements: role.requirements || "",
      expectations: role.expectations || "",
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Cargos da Empresa</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gerencie as informações dos cargos que serão exibidas na integração
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => {
                  setCurrentRole(null);
                  form.reset({
                    title: "",
                    description: "",
                    responsibilities: "",
                    requirements: "",
                    expectations: "",
                  });
                }}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Cargo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {currentRole ? "Editar Cargo" : "Adicionar Novo Cargo"}
                  </DialogTitle>
                  <DialogDescription>
                    {currentRole 
                      ? "Modifique as informações do cargo abaixo."
                      : "Insira as informações do cargo que será adicionado."}
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAddRole)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título do Cargo</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: Desenvolvedor Front-end" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva brevemente o cargo"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="responsibilities"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsabilidades</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Liste as responsabilidades principais do cargo"
                              className="min-h-[100px]"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="requirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Requisitos</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Liste os requisitos para o cargo"
                              className="min-h-[100px]"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="expectations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expectativas</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva as expectativas para quem ocupar este cargo"
                              className="min-h-[100px]"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit" className="w-full">
                        {currentRole ? "Atualizar Cargo" : "Adicionar Cargo"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : jobRoles.length > 0 ? (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {jobRoles.map((role, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader className="py-3 px-4 bg-gray-50 dark:bg-gray-800 flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BriefcaseBusiness className="h-5 w-5 text-gray-500" />
                        <h4 className="font-medium">{role.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditRole(role)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveRole(role)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                          <span className="sr-only">Remover</span>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        {role.description}
                      </p>
                      
                      <Accordion type="single" collapsible className="w-full">
                        {role.responsibilities && (
                          <AccordionItem value="responsibilities">
                            <AccordionTrigger className="text-sm font-medium py-2">
                              Responsabilidades
                            </AccordionTrigger>
                            <AccordionContent className="text-sm whitespace-pre-line">
                              {role.responsibilities}
                            </AccordionContent>
                          </AccordionItem>
                        )}
                        
                        {role.requirements && (
                          <AccordionItem value="requirements">
                            <AccordionTrigger className="text-sm font-medium py-2">
                              Requisitos
                            </AccordionTrigger>
                            <AccordionContent className="text-sm whitespace-pre-line">
                              {role.requirements}
                            </AccordionContent>
                          </AccordionItem>
                        )}
                        
                        {role.expectations && (
                          <AccordionItem value="expectations">
                            <AccordionTrigger className="text-sm font-medium py-2">
                              Expectativas
                            </AccordionTrigger>
                            <AccordionContent className="text-sm whitespace-pre-line">
                              {role.expectations}
                            </AccordionContent>
                          </AccordionItem>
                        )}
                      </Accordion>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="p-8 text-center border border-dashed rounded-lg bg-gray-50 dark:bg-gray-800">
              <FileText className="mx-auto h-8 w-8 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum cargo cadastrado</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
                Adicione informações sobre os cargos da empresa para que os novos funcionários possam entender seu papel e responsabilidades.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeiro Cargo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
