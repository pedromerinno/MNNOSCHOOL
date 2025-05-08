
import { TabsContent } from "@/components/ui/tabs";
import { SettingsInfoTab } from "./SettingsInfoTab";
import { SettingsVideosTab } from "./SettingsVideosTab";
import { SettingsCoursesTab } from "./SettingsCoursesTab";
import { SettingsJobRolesTab } from "./SettingsJobRolesTab";
import { SettingsAccessTab } from "./SettingsAccessTab";
import { SettingsCollaboratorsTab } from "./SettingsCollaboratorsTab";
import { CompanyNoticesTab } from "./CompanyNoticesTab";
import { SettingsTabContentProps } from "./types";

export function SettingsTabContent({ 
  value, 
  company, 
  onSubmit,
  isSaving 
}: SettingsTabContentProps) {
  // Render different content based on tab value
  const getTabContent = () => {
    switch (value) {
      case "info":
        return <SettingsInfoTab company={company} onSubmit={onSubmit} isSaving={isSaving} />;
      case "videos":
        return <SettingsVideosTab company={company} />;
      case "courses":
        return <SettingsCoursesTab company={company} />;
      case "cargo":
        return <SettingsJobRolesTab company={company} />;
      case "access":
        return <SettingsAccessTab company={company} />;
      case "collaborators":
        return <SettingsCollaboratorsTab company={company} />;
      case "notices":
        return <CompanyNoticesTab />;
      default:
        return <div>Tab content not implemented.</div>;
    }
  };

  return (
    <TabsContent value={value} className="mt-4">
      {getTabContent()}
    </TabsContent>
  );
}
