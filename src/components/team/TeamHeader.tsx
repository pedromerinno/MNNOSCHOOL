
import { Company } from "@/types/company";
import { Users } from "lucide-react";

interface TeamHeaderProps {
  company: Company;
  memberCount: number;
}

export const TeamHeader = ({ company, memberCount }: TeamHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-2">
        <Users className="h-6 w-6 text-gray-500" />
        <h1 className="text-3xl font-bold dark:text-white">Equipe</h1>
      </div>
      <p className="text-gray-600 dark:text-gray-300">
        Conheça os {memberCount} membros da equipe {company.nome} e compartilhe feedbacks.
      </p>
    </div>
  );
};
