// src/vite-env.d.ts

/**
 * Declaración de tipos para variables de entorno de Vite
 * 
 * ¿Por qué esto?
 * - TypeScript no conoce import.meta.env por defecto
 * - Necesitamos decirle qué propiedades tiene
 * - Esto da autocompletado y validación de tipos
 */

/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
    // Agregar más variables aquí si las necesitas
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }