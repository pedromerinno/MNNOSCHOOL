
import { useRef } from "react";
import { CompanyFetchState } from "../types/fetchingTypes";
import { Company } from "@/types/company";

export const useCompanyFetchState = () => {
  const fetchInProgressRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSuccessfulFetchRef = useRef<number>(0);
  const didFetchOnPageLoadRef = useRef<boolean>(false);
  const hookInstanceIdRef = useRef<string>(`fetch-${Math.random().toString(36).substring(2, 9)}`);
  const fetchedCompaniesRef = useRef<Set<string>>(new Set());
  const memoryCacheRef = useRef<{ companies: Company[] | null; timestamp: number }>({ 
    companies: null, 
    timestamp: 0 
  });

  return {
    fetchInProgressRef,
    abortControllerRef,
    lastSuccessfulFetchRef,
    didFetchOnPageLoadRef,
    hookInstanceIdRef,
    fetchedCompaniesRef,
    memoryCacheRef
  };
};
