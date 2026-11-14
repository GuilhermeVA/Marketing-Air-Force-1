// Arquivo gerado por `npm run db:types` a partir do banco remoto (schema public).
// Placeholder até a primeira geração: ainda não há tabelas `af1_*`.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
