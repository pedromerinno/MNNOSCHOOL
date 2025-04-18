
import { Users } from "lucide-react";
import { Company } from "@/types/company";

interface TeamHeaderProps {
  company: Company;
  memberCount: number;
}

export const TeamHeader = ({ company, memberCount }: TeamHeaderProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Equipe</h1>
      </div>
      <p className="text-muted-foreground text-lg">
        {memberCount} {memberCount === 1 ? 'membro' : 'membros'} fazem parte da equipe <span className="font-medium text-foreground">{company.nome}</span>
      </p>
    </div>
  );
};
