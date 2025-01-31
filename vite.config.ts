import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import terser from '@rollup/plugin-terser';
import polyfillNode from 'rollup-plugin-polyfill-node';

// Vite configuration with detailed optimization settings
export default defineConfig({
  define: {
    global: 'window',  // Fix the "global is not defined" error
  },

  // Plugin configuration with React support
  plugins: [
    react({
      // Enable Fast Refresh for better development experience
      fastRefresh: true,
      // Optimize JSX compilation
      jsxRuntime: 'automatic'
    }),
    polyfillNode() // Polyfill for Node.js modules like "stream"
  ],

  // Build configuration for production
  build: {
    // Enable source maps for debugging in production
    sourcemap: true,

    // Configure minification settings
    minify: 'terser',
    terserOptions: {
      // Remove console logs and debugger statements in production
      compress: {
        drop_console: true,
        drop_debugger: true
      },
      // Preserve class names for better error tracking
      keep_classnames: true,
      // Preserve function names for better error tracking
      keep_fnames: true
    },

    // Optimize chunk splitting and bundling
    rollupOptions: {
      output: {
        // Organize chunks by functionality
        manualChunks: {
          // Core React dependencies
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Backend and state management
          'vendor-backend': ['@supabase/supabase-js', 'zustand'],
          // UI components and icons
          'vendor-ui': ['lucide-react']
        },
        // Configure chunk naming format
        chunkFileNames: 'assets/[name]-[hash].js',
        // Configure asset naming format
        assetFileNames: 'assets/[name]-[hash][extname]'
      },
      // Add terser plugin for better minification
      plugins: [terser()]
    },

    // Increase chunk size warning limit for vendor bundles
    chunkSizeWarningLimit: 1500,

    // Configure output directory and format
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    
    // Optimize CSS handling
    cssCodeSplit: true,
    cssMinify: true
  },

  // Development server settings
  server: {
    // Use a consistent port for development
    port: 5173,
    strictPort: true,
    // Enable HMR for faster development
    hmr: {
      overlay: true
    },
    // Configure headers for better security
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },

  // Preview server settings (for testing production builds)
  preview: {
    port: 4173,
    strictPort: true
  },

  // Dependency optimization settings
  optimizeDeps: {
    // Exclude packages that should not be pre-bundled
    exclude: ['lucide-react'],
    // Include frequently used dependencies
    include: ['react', 'react-dom', 'react-router-dom', 'zustand']
  },

  // Enable type checking during build
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        jsx: 'react-jsx'
      }
    }
  },

  // Configure resolution of modules
  resolve: {
    // Enable proper handling of package exports
    mainFields: ['module', 'jsnext:main', 'jsnext'],
    // Configure module aliases if needed
    alias: {
      '@': '/src',
      'stream': 'stream-browserify'  // Fix for "Module stream has been externalized" error
    }
  }
});
