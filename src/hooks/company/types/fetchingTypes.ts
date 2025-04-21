
import { Company } from "@/types/company";

export interface CompanyFetchState {
  lastSuccessfulFetch: number;
  fetchInProgress: boolean;
  abortController: AbortController | null;
  didFetchOnPageLoad: boolean;
  hookInstanceId: string;
  fetchedCompanies: Set<string>;
  memoryCache: {
    companies: Company[] | null;
    timestamp: number;
  };
}

export interface CompanyFetchActions {
  onSuccess: (companies: Company[]) => void;
  onError: (error: Error) => void;
  onLoading: (loading: boolean) => void;
  incrementFetchCount: () => void;
}

