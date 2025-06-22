
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.merinno.school',
  appName: 'MNNO School',
  webDir: 'dist',
  server: {
    url: 'https://school.merinno.com/',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1EAEDB',
      showSpinner: false
    },
    StatusBar: {
      style: 'default',
      backgroundColor: '#F8F7F4'
    }
  },
  ios: {
    contentInset: 'automatic'
  }
};

export default config;
