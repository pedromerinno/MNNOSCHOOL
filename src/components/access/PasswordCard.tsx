import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Key, Copy, Eye, EyeOff, MoreVertical, User, Globe, UserCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface PasswordItem {
  id: string;
  tool_name: string;
  username: string;
  password: string;
  url?: string | null;
  notes?: string | null;
}

interface PasswordCardProps {
  item: PasswordItem;
  onClick?: () => void;
  companyColor?: string;
  onEdit?: (item: PasswordItem) => void;
  onDelete?: (item: PasswordItem) => void;
  canEdit?: boolean;
}

export const PasswordCard: React.FC<PasswordCardProps> = ({
  item,
  onClick,
  companyColor,
  onEdit,
  onDelete,
  canEdit = false
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [accessType, setAccessType] = useState<'public' | 'roles' | 'users'>('public');

  // Debug: Log password when item changes
  useEffect(() => {
    console.log('[PasswordCard] Item changed:', {
      id: item.id,
      tool_name: item.tool_name,
      has_password: !!item.password,
      password_length: item.password?.length || 0,
      password_type: typeof item.password,
      password_value: item.password ? '[REDACTED]' : 'null/undefined'
    });
  }, [item]);

  // Fetch access type
  useEffect(() => {
    fetchAccessType();
  }, [item.id]);

  const fetchAccessType = async () => {
    try {
      // Check for role restrictions
      const { data: roleData, error: roleError } = await supabase
        .from('company_access_job_roles')
        .select('job_role_id')
        .eq('company_access_id', item.id)
        .limit(1);

      // Check for user restrictions
      const { data: userData, error: userError } = await supabase
        .from('company_access_users')
        .select('user_id')
        .eq('company_access_id', item.id)
        .limit(1);

      // Ignore 404 errors (table doesn't exist or no restrictions)
      if (roleError && roleError.code !== 'PGRST116') {
        console.warn('[PasswordCard] Error fetching role restrictions:', roleError);
      }
      if (userError && userError.code !== 'PGRST116') {
        console.warn('[PasswordCard] Error fetching user restrictions:', userError);
      }

      if (roleData && roleData.length > 0) {
        setAccessType('roles');
      } else if (userData && userData.length > 0) {
        setAccessType('users');
      } else {
        setAccessType('public');
      }
    } catch (error) {
      // If tables don't exist yet or any other error, assume public access
      console.warn('[PasswordCard] Error fetching access type, defaulting to public:', error);
      setAccessType('public');
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success(`${type} copiado para área de transferência`))
      .catch(() => toast.error('Falha ao copiar'));
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(item);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(item);
    }
  };

  return (
    <Card 
      className={`hover:shadow-sm transition-all duration-300 group relative overflow-hidden rounded-xl flex flex-col h-full ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      style={{
        borderColor: 'rgba(0, 0, 0, 0.06)',
        borderWidth: '1px',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        minHeight: '280px',
        backgroundColor: companyColor 
          ? `${companyColor}05`
          : '#1EAEDB05'
      }}
    >
      {/* Content section */}
      <CardContent className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                  {item.tool_name}
                </h3>
                {/* Visibility Badge */}
                <Badge 
                  variant="outline" 
                  className="text-xs flex items-center gap-1 flex-shrink-0"
                  style={{
                    borderColor: companyColor ? `${companyColor}40` : undefined,
                    color: companyColor || undefined
                  }}
                >
                  {accessType === 'public' && (
                    <>
                      <Globe size={12} />
                      <span>Público</span>
                    </>
                  )}
                  {accessType === 'roles' && (
                    <>
                      <UserCheck size={12} />
                      <span>Por Cargo</span>
                    </>
                  )}
                  {accessType === 'users' && (
                    <>
                      <Users size={12} />
                      <span>Por Usuário</span>
                    </>
                  )}
                </Badge>
              </div>
              {item.url && (
                <a 
                  href={item.url.startsWith('http') ? item.url : `https://${item.url}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={12} />
                  <span className="truncate">{item.url.length > 35 ? `${item.url.substring(0, 35)}...` : item.url}</span>
                </a>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {item.url && (
                <a 
                  href={item.url.startsWith('http') ? item.url : `https://${item.url}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={16} />
                </a>
              )}
              {canEdit && (onEdit || onDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <MoreVertical size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={handleEdit}>
                        Editar
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem 
                        onClick={handleDelete}
                        className="text-red-600 focus:text-red-600"
                      >
                        Remover
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-800 mb-4" />
        
        {/* Main info row */}
        <div className="space-y-4 flex-1">
          <div className="flex items-start gap-3">
            <div 
              className="p-2.5 rounded-lg flex-shrink-0 mt-0.5"
              style={{ 
                backgroundColor: companyColor ? `${companyColor}12` : undefined
              }}
            >
              <User 
                size={18} 
                style={{ color: companyColor }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Usuário</p>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                  {item.username}
                </p>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-5 w-5 hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(item.username, 'Usuário');
                  }}
                >
                  <Copy size={11} className="text-gray-500 dark:text-gray-400" />
                </Button>
              </div>
            </div>
          </div>

          {/* Password section */}
          <div className="flex items-start gap-3">
            <div 
              className="p-2.5 rounded-lg flex-shrink-0 mt-0.5"
              style={{ 
                backgroundColor: companyColor ? `${companyColor}12` : undefined
              }}
            >
              <Key 
                size={18} 
                style={{ color: companyColor }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Senha</p>
              <div className="flex items-center gap-2">
                <p className="font-mono font-semibold text-sm text-gray-900 dark:text-white truncate min-w-[100px]">
                  {(() => {
                    if (isPasswordVisible) {
                      // Quando visível, mostrar a senha
                      const passwordValue = item.password;
                      if (passwordValue === null || passwordValue === undefined) {
                        return '(senha não disponível)';
                      }
                      const trimmed = String(passwordValue).trim();
                      return trimmed || '(senha vazia)';
                    } else {
                      // Quando oculto, mostrar pontos
                      return '••••••••';
                    }
                  })()}
                </p>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-5 w-5 hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const newState = !isPasswordVisible;
                    console.log('[PasswordCard] Toggle password visibility:', {
                      current_state: isPasswordVisible,
                      new_state: newState,
                      has_password: !!item.password,
                      password_value: item.password ? `[${item.password.length} chars]` : 'null/undefined',
                      password_type: typeof item.password
                    });
                    setIsPasswordVisible(newState);
                  }}
                >
                  {isPasswordVisible ? (
                    <EyeOff size={11} className="text-gray-500 dark:text-gray-400" />
                  ) : (
                    <Eye size={11} className="text-gray-500 dark:text-gray-400" />
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-5 w-5 hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(item.password, 'Senha');
                  }}
                >
                  <Copy size={11} className="text-gray-500 dark:text-gray-400" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Notes indicator */}
        {item.notes && (
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Possui observações</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


