import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SettingsSection } from "./horizontal-settings-dialog";

interface HorizontalSheetProps {
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
  contentPadding?: string;
  alwaysShowSidebar?: boolean;
  side?: "left" | "right";
  maxWidth?: string;
}

export const HorizontalSheet: React.FC<HorizontalSheetProps> = ({
  open,
  onOpenChange,
  title,
  sections,
  defaultSectionId,
  activeSectionId,
  onSectionChange,
  onCancel,
  onSave,
  saveLabel = "Salvar",
  cancelLabel = "Cancelar",
  cancelButton,
  getCancelButton,
  isSaving = false,
  isFormValid = true,
  saveButtonStyle,
  className,
  contentPadding = "p-8 space-y-8",
  alwaysShowSidebar = false,
  side = "right",
  maxWidth = "sm:max-w-5xl"
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
    const section = sections.find(s => s.id === sectionId);
    if (section?.disabled) {
      return;
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={side} 
        className={cn(maxWidth, "p-0 overflow-hidden flex flex-col h-full [&>button]:hidden", className)}
      >
        <SheetHeader className="px-6 py-5 border-b border-gray-200">
          <div className="flex flex-row items-center justify-between gap-4">
            <SheetTitle className="text-base font-semibold text-gray-900 flex-1">
              {title}
            </SheetTitle>
            {getCancelButton && getCancelButton(activeSection)}
          </div>
        </SheetHeader>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Navigation */}
          {(sections.length > 1 || alwaysShowSidebar) && (
            <div className="w-56 border-r border-gray-200 bg-white flex flex-col">
              <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
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
          <div className="flex-1 overflow-y-auto bg-white flex flex-col">
            <div className={cn(contentPadding, "flex-1")}>
              {activeSectionContent}
            </div>

            {/* Footer with buttons */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3 bg-white">
              {(() => {
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
                      size="sm"
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
                    "min-w-[100px] font-medium",
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
      </SheetContent>
    </Sheet>
  );
};

