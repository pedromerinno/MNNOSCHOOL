import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Only include react plugin - lovable-tagger is development-only
  // and should not be loaded in production builds
  const plugins = [react()];

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    optimizeDeps: {
      include: ['pdfjs-dist'],
      // Exclude lovable-tagger from optimization in production
      exclude: mode === 'production' ? ['lovable-tagger'] : [],
    },
    build: {
      // Enable code splitting for better performance
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Vendor chunks - separate large dependencies
            if (id.includes('node_modules')) {
              // Exclude lovable-tagger from production builds
              if (id.includes('lovable-tagger')) {
                return null;
              }
              // React and React DOM
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'react-vendor';
              }
              // Radix UI components
              if (id.includes('@radix-ui')) {
                return 'ui-vendor';
              }
              // TanStack Query
              if (id.includes('@tanstack/react-query')) {
                return 'query-vendor';
              }
              // Supabase
              if (id.includes('@supabase')) {
                return 'supabase-vendor';
              }
              // Utility libraries
              if (id.includes('date-fns') || id.includes('lodash') || id.includes('zod')) {
                return 'utils-vendor';
              }
              // PDF.js
              if (id.includes('pdfjs-dist')) {
                return 'pdf-vendor';
              }
              // Other large vendor libraries
              if (id.includes('framer-motion') || id.includes('recharts')) {
                return 'charts-vendor';
              }
              // Default vendor chunk for other node_modules
              return 'vendor';
            }
          },
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable source maps only in development
    sourcemap: mode === 'development',
    // Minify for production
    minify: mode === 'production' ? 'esbuild' : false,
    // Target modern browsers for smaller bundles
    target: 'esnext',
  };
});
