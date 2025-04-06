
import { Dispatch, SetStateAction } from "react";
import { Company } from "@/types/company";

export interface UseCompanyFetchProps {
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setCompanies: Dispatch<SetStateAction<Company[]>>;
  setUserCompanies: Dispatch<SetStateAction<Company[]>>;
  setSelectedCompany: Dispatch<SetStateAction<Company | null>>;
}

export interface FetchError extends Error {
  context?: string;
  originalError?: unknown;
  retryCount?: number;
}

export interface RetryOptions {
  maxRetries: number;
  initialDelay: number;
  backoffFactor: number;
  shouldRetry?: (error: unknown) => boolean;
}

export interface CacheOptions {
  cacheKey: string;
  expirationMs?: number;
}
