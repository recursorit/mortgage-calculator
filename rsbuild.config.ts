import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
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
