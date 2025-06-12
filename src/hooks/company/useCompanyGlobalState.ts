
import { useRef, useMemo } from 'react';

// Global state for managing company hooks
class CompanyGlobalState {
  private hooks = new Set<string>();
  
  registerHook(hookId: string) {
    this.hooks.add(hookId);
  }
  
  unregisterHook(hookId: string) {
    this.hooks.delete(hookId);
  }
  
  getActiveHooks() {
    return Array.from(this.hooks);
  }
}

// Singleton instance
const globalState = new CompanyGlobalState();

export const useCompanyGlobalState = () => {
  const hookId = useRef(`hook-${Math.random().toString(36).substr(2, 9)}`).current;
  
  return useMemo(() => ({
    hookId,
    globalState
  }), [hookId]);
};
