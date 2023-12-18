import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // below are required to have SharedArrayBuffer working
    // this is because of Spectre mitigation in browsers (lol)
    // see: https://stackoverflow.com/questions/64650119/react-error-sharedarraybuffer-is-not-defined-in-firefox
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    }
  }
})
