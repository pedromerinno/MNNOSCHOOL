
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.5cae13a192c04c6b93bcbb999597eb98',
  appName: 'MNNO School',
  webDir: 'dist',
  server: {
    url: 'https://5cae13a1-92c0-4c6b-93bc-bb999597eb98.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1EAEDB',
      showSpinner: false
    }
  }
};

export default config;
