import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SettingsSection {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface HorizontalSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  sections: SettingsSection[];
  defaultSectionId?: string;
  activeSectionId?: string;
  onSectionChange?: (sectionId: string) => void;
  onCancel?: () => void;
  onSave?: () => void | Promise<void>;
  saveLabel?: string;
  cancelLabel?: string;
  cancelButton?: React.ReactNode;
  getCancelButton?: (activeSection: string) => React.ReactNode | null;
  isSaving?: boolean;
  isFormValid?: boolean;
  saveButtonStyle?: React.CSSProperties;
  className?: string;
  maxWidth?: string;
  contentPadding?: string;
  alwaysShowSidebar?: boolean;
}

export const HorizontalSettingsDialog: React.FC<HorizontalSettingsDialogProps> = ({
  open,
  onOpenChange,
  title,
  sections,
  defaultSectionId,
  activeSectionId,
  onSectionChange,
  onCancel,
  onSave,
  saveLabel = "Save",
  cancelLabel = "Cancel",
  cancelButton,
  getCancelButton,
  isSaving = false,
  isFormValid = true,
  saveButtonStyle,
  className,
  maxWidth = "max-w-5xl",
  contentPadding = "p-8 space-y-8",
  alwaysShowSidebar = false
}) => {
  const [internalActiveSection, setInternalActiveSection] = useState<string>(
    defaultSectionId || sections[0]?.id || ''
  );

  // Use controlled section if provided, otherwise use internal state
  const activeSection = activeSectionId !== undefined ? activeSectionId : internalActiveSection;

  // Update internal state when activeSectionId changes
  React.useEffect(() => {
    if (activeSectionId !== undefined) {
      setInternalActiveSection(activeSectionId);
    }
  }, [activeSectionId]);

  const handleSectionChange = (sectionId: string) => {
    // Verificar se a seção está desabilitada
    const section = sections.find(s => s.id === sectionId);
    if (section?.disabled) {
      return; // Não permitir mudança se a seção estiver desabilitada
    }
    
    if (activeSectionId === undefined) {
      setInternalActiveSection(sectionId);
    }
    if (onSectionChange) {
      onSectionChange(sectionId);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave();
    }
  };

  const activeSectionContent = sections.find(section => section.id === activeSection)?.content;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(maxWidth, "max-h-[90vh] p-0 overflow-hidden flex flex-col", className)}>
        <DialogHeader className="px-6 py-5 border-b border-gray-200">
          <DialogTitle className="text-base font-semibold text-gray-900">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Navigation */}
          {(sections.length > 1 || alwaysShowSidebar) && (
            <div className="w-56 border-r border-gray-200 bg-white flex flex-col">
              <nav className="flex-1 p-2 space-y-0.5">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => !section.disabled && handleSectionChange(section.id)}
                    disabled={section.disabled}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded text-sm font-normal transition-colors",
                      section.disabled
                        ? "text-gray-400 cursor-not-allowed opacity-50"
                        : activeSection === section.id
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          )}

          {/* Right Content Area */}
          <div className="flex-1 overflow-y-auto bg-white">
            <div className={cn(contentPadding)}>
              {activeSectionContent}
            </div>

            {/* Footer with buttons */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3 bg-white">
              {(() => {
                // Se getCancelButton for fornecido, usar ele baseado na seção ativa
                if (getCancelButton) {
                  const dynamicButton = getCancelButton(activeSection);
                  if (dynamicButton) {
                    return dynamicButton;
                  }
                }
                // Caso contrário, usar cancelButton ou o botão padrão
                if (cancelButton) {
                  return cancelButton;
                }
                if (onCancel) {
                  return (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="min-w-[100px] border-gray-300 hover:bg-gray-50 text-gray-700 font-normal"
                    >
                      {cancelLabel}
                    </Button>
                  );
                }
                return null;
              })()}
              {onSave && (
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || !isFormValid}
                  className={cn(
                    "min-w-[100px] font-normal",
                    (!isFormValid) && "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
                  )}
                  style={isFormValid ? saveButtonStyle : {}}
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Salvando...
                    </span>
                  ) : (
                    saveLabel
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

