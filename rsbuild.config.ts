import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  source: {
    define: {
      'import.meta.env.PUBLIC_FIREBASE_API_KEY': JSON.stringify(
        process.env.PUBLIC_FIREBASE_API_KEY ?? '',
      ),
      'import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN': JSON.stringify(
        process.env.PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
      ),
      'import.meta.env.PUBLIC_FIREBASE_PROJECT_ID': JSON.stringify(
        process.env.PUBLIC_FIREBASE_PROJECT_ID ?? '',
      ),
      'import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET': JSON.stringify(
        process.env.PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
      ),
      'import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(
        process.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
      ),
      'import.meta.env.PUBLIC_FIREBASE_APP_ID': JSON.stringify(
        process.env.PUBLIC_FIREBASE_APP_ID ?? '',
      ),
    },
  },
  html: {
    title: 'Mortgage Calculator',
  },
  server: {
    base: process.env.PUBLIC_BASE_PATH ?? '/',
  },
  output: {
    assetPrefix:
      process.env.PUBLIC_BASE_PATH ??
      (process.env.GITHUB_REPOSITORY
        ? `/${process.env.GITHUB_REPOSITORY.split('/')[1] ?? ''}/`
        : '/'),
  },
  plugins: [pluginReact()],
});
