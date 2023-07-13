/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}
declare module 'path-browserify'

interface ImportMetaEnv {
  readonly VITE_MPC_HTTP_PMS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
