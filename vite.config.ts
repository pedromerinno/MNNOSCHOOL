import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins = [
    react({
      // Ensure React is properly transformed
      jsxRuntime: 'automatic',
    })
  ];

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
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: [
        'pdfjs-dist', 
        'react', 
        'react-dom',
        '@supabase/supabase-js',
      ],
      exclude: [],
      esbuildOptions: {
        // Ensure proper handling of CommonJS modules
        target: 'es2020',
        // Preserve class names and structure for crypto libraries
        keepNames: true,
      },
    },
    build: {
      // Enable code splitting for better performance
      rollupOptions: {
        output: {
          // Ensure chunks are loaded in the correct order
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: (chunkInfo) => {
            // Ensure Supabase-related code is loaded first
            if (chunkInfo.name === 'index' || !chunkInfo.name) {
              return 'assets/[name]-[hash].js';
            }
            return 'assets/[name]-[hash].js';
          },
          assetFileNames: 'assets/[name]-[hash].[ext]',
          manualChunks: (id) => {
            // CRITICAL: Supabase and ALL its crypto dependencies MUST be in the main bundle
            // This prevents "Cannot access 'bn' before initialization" errors
            // Check both node_modules and source files that import Supabase
            if (
              id.includes('@supabase') ||
              id.includes('bn.js') ||
              id.includes('@noble') ||
              id.includes('elliptic') ||
              id.includes('hash.js') ||
              id.includes('@scure') ||
              id.includes('js-sha3') ||
              id.includes('micro-starknet')
            ) {
              // Return undefined to keep in main bundle
              return undefined;
            }
            
            // Also keep ALL source files in main bundle to avoid chunk loading order issues
            // This ensures Supabase is always available when components try to use it
            // AND prevents circular dependency issues between UI components
            if (id.includes('src/')) {
              return undefined;
            }
            
            // Vendor chunks - separate large dependencies
            if (id.includes('node_modules')) {
              // React and React DOM - Keep together to ensure proper loading order
              // This prevents "createContext is undefined" errors in production
              // Use more specific checks to avoid false matches with other packages
              if (
                id.includes('/react/') || 
                id.includes('/react-dom/') || 
                id.includes('/react-router') ||
                id.includes('\\react\\') ||
                id.includes('\\react-dom\\') ||
                id.includes('\\react-router')
              ) {
                return 'react-vendor';
              }
              // Radix UI components - Keep in vendor but ensure proper loading order
              // Note: UI components from src/ are already in main bundle above
              if (id.includes('@radix-ui')) {
                return 'ui-vendor';
              }
              // TanStack Query
              if (id.includes('@tanstack/react-query')) {
                return 'query-vendor';
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
      // Ensure proper module resolution
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
        // Ensure proper handling of circular dependencies
        requireReturnsDefault: 'auto',
      },
      // Prevent issues with dynamic imports and circular dependencies
      modulePreload: {
        polyfill: true,
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable source maps for debugging production builds
    sourcemap: true,
    // Minify for production
    minify: mode === 'production' ? 'esbuild' : false,
    // Target modern browsers for smaller bundles
    target: 'esnext',
  };
});
