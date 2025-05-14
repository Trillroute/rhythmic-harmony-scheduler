
/// <reference types="vite/client" />

// Add additional global type definitions
declare type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

