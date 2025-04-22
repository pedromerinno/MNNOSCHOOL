
import { Database } from "@/integrations/supabase/types";

export type JobRole = Database["public"]["Tables"]["job_roles"]["Row"];

export interface JobRoleFormData {
  id?: string;
  title: string;
  description?: string | null;
  responsibilities?: string | null;
  requirements?: string | null;
  expectations?: string | null;
  order_index?: number;
  company_id: string;
}
