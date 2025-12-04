import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useBackgroundUpload } from '@/hooks/useBackgroundUpload';
import { MediaTypeSelector } from './background/MediaTypeSelector';
import { FileUpload } from './background/FileUpload';
import { UrlInput } from './background/UrlInput';
import { MediaPreview } from './background/MediaPreview';
import { AdminPageTitle } from './AdminPageTitle';
import { 
  Globe, 
  Image, 
  Info, 
  Settings as SettingsIcon,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanies } from '@/hooks/useCompanies';

export const BackgroundManager = () => {
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"video" | "image">("video");
  const [isSaving, setIsSaving] = useState(false);
  const [platformStats, setPlatformStats] = useState<{
    totalUsers: number;
    totalCompanies: number;
    totalCourses: number;
  } | null>(null);
  const { userProfile } = useAuth();
  const { companies } = useCompanies();
  
  const {
    uploadFile,
    isUploading
  } = useBackgroundUpload();

  useEffect(() => {
    const fetchCurrentBackground = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('settings').select('value, media_type').eq('key', 'login_background').maybeSingle();
        if (!error && data) {
          setMediaUrl(data.value || "");
          setMediaType(data.media_type as "video" | "image" || "video");
        }
      } catch (error) {
        console.error("Error fetching background settings:", error);
      }
    };
    fetchCurrentBackground();
  }, []);

  useEffect(() => {
    const fetchPlatformStats = async () => {
      try {
        const [usersResult, companiesResult, coursesResult] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('empresas').select('id', { count: 'exact', head: true }),
          supabase.from('courses').select('id', { count: 'exact', head: true })
        ]);

        setPlatformStats({
          totalUsers: usersResult.count || 0,
          totalCompanies: companiesResult.count || 0,
          totalCourses: coursesResult.count || 0
        });
      } catch (error) {
        console.error("Error fetching platform stats:", error);
      }
    };
    fetchPlatformStats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const {
        data: existingRecord
      } = await supabase.from('settings').select('id').eq('key', 'login_background').maybeSingle();
      const {
        error
      } = await supabase.from('settings').upsert({
        id: existingRecord?.id || undefined,
        key: 'login_background',
        value: mediaUrl,
        media_type: mediaType,
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      toast.success(`Background ${mediaType === 'video' ? 'vídeo' : 'imagem'} atualizado com sucesso`);
      window.dispatchEvent(new Event('background-updated'));
    } catch (error: any) {
      console.error(`Erro ao salvar ${mediaType} de background:`, error);
      toast.error(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (mediaType === 'video' && !file.type.startsWith('video/')) {
      toast.error('Por favor, selecione um arquivo de vídeo');
      return;
    }
    if (mediaType === 'image' && !file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }
    const url = await uploadFile(file, mediaType);
    if (url) {
      setMediaUrl(url);
      handleSubmit(new Event('submit') as any);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageTitle
        title="Plataforma"
        description="Gerencie as configurações globais da plataforma"
        size="xl"
      />

      <Tabs defaultValue="background" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="background" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Background
          </TabsTrigger>
          <TabsTrigger value="info" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Informações
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* Tab: Background */}
        <TabsContent value="background" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Image className="h-4 w-4" />
                Background da Página de Login
              </CardTitle>
              <CardDescription className="text-sm">
                Configure o background visual da página de login. Você pode usar uma imagem ou vídeo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <MediaTypeSelector mediaType={mediaType} onMediaTypeChange={setMediaType} />

                <FileUpload mediaType={mediaType} onFileUpload={handleFileUpload} isUploading={isUploading} />

                <UrlInput mediaUrl={mediaUrl} mediaType={mediaType} onUrlChange={setMediaUrl} />

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button 
                    type="submit" 
                    disabled={isSaving || isUploading} 
                    className="bg-merinno-dark hover:bg-black text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {mediaUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Pré-visualização</CardTitle>
                <CardDescription className="text-sm">
                  Visualize como o background aparecerá na página de login
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MediaPreview mediaUrl={mediaUrl} mediaType={mediaType} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Informações da Plataforma */}
        <TabsContent value="info" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Usuários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformStats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Total de usuários cadastrados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  Empresas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformStats?.totalCompanies || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Empresas ativas na plataforma</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-500" />
                  Cursos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformStats?.totalCourses || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Cursos disponíveis</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Info className="h-4 w-4" />
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Versão da Plataforma</p>
                  <p className="text-sm font-semibold">MNNO School v1.0</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Status do Sistema</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <p className="text-sm font-semibold">Operacional</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Permissões</p>
                  <p className="text-sm font-semibold">
                    {userProfile?.super_admin ? 'Super Administrador' : 'Administrador'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Empresa Selecionada</p>
                  <p className="text-sm font-semibold">
                    {companies.find(c => c.selected)?.nome || 'Nenhuma'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Configurações Gerais */}
        <TabsContent value="settings" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <SettingsIcon className="h-4 w-4" />
                Configurações da Plataforma
              </CardTitle>
              <CardDescription className="text-sm">
                Gerencie as configurações gerais e globais da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium mb-1">Configurações Adicionais</h4>
                    <p className="text-xs text-muted-foreground">
                      Mais opções de configuração estarão disponíveis em breve.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};