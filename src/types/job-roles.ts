
import { Database } from "@/integrations/supabase/types";

export type JobRole = Database["public"]["Tables"]["job_roles"]["Row"];
