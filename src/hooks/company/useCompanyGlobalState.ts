
import { useRef } from 'react';

// Global state to prevent multiple simultaneous operations
class CompanyGlobalState {
  private static instance: CompanyGlobalState;
  
  public isInitializing = false;
  public initializationPromise: Promise<void> | null = null;
  public lastInitTime = 0;
  public activeHooks = new Set<string>();
  
  static getInstance(): CompanyGlobalState {
    if (!CompanyGlobalState.instance) {
      CompanyGlobalState.instance = new CompanyGlobalState();
    }
    return CompanyGlobalState.instance;
  }
  
  canInitialize(hookId: string): boolean {
    const now = Date.now();
    
    // If we just initialized recently, skip
    if (now - this.lastInitTime < 5000) {
      console.log(`[${hookId}] Skipping initialization - too recent`);
      return false;
    }
    
    // If already initializing, skip
    if (this.isInitializing) {
      console.log(`[${hookId}] Skipping initialization - already in progress`);
      return false;
    }
    
    return true;
  }
  
  startInitialization(hookId: string): void {
    this.isInitializing = true;
    this.lastInitTime = Date.now();
    this.activeHooks.add(hookId);
    console.log(`[${hookId}] Starting global initialization`);
  }
  
  endInitialization(hookId: string): void {
    this.isInitializing = false;
    this.initializationPromise = null;
    this.activeHooks.delete(hookId);
    console.log(`[${hookId}] Ending global initialization`);
  }
  
  registerHook(hookId: string): void {
    this.activeHooks.add(hookId);
    console.log(`[${hookId}] Hook registered, active hooks: ${this.activeHooks.size}`);
  }
  
  unregisterHook(hookId: string): void {
    this.activeHooks.delete(hookId);
    console.log(`[${hookId}] Hook unregistered, active hooks: ${this.activeHooks.size}`);
  }
}

export const useCompanyGlobalState = () => {
  const hookIdRef = useRef(`hook-${Math.random().toString(36).substring(2, 9)}`);
  const globalState = CompanyGlobalState.getInstance();
  
  return {
    hookId: hookIdRef.current,
    globalState
  };
};
