/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GOOGLE_SERVICE_EMAIL: string
    readonly VITE_GOOGLE_PRIVATE_KEY: string
    readonly VITE_GOOGLE_SCOPES: string
    readonly VITE_SPREADSHEET_ID: string
    readonly VITE_TMDB_API_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
