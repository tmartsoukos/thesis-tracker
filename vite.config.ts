/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_BASE is set by the GitHub Actions workflow to "/<repo-name>/".
// The relative default works for local preview and any static host.
export default defineConfig({
  base: process.env.VITE_BASE ?? './',
  plugins: [react()],
  test: { environment: 'node' },
})
