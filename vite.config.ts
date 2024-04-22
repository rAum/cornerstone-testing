import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    // below are required to have SharedArrayBuffer working
    // this is because of Spectre mitigation in browsers (lol)
    // see: https://stackoverflow.com/questions/64650119/react-error-sharedarraybuffer-is-not-defined-in-firefox
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    }
  },
  resolve: {
    alias: {
      // this is required to have the  cornerstone tools package working
      // with vite. See for example:
      //  https://github.com/cornerstonejs/cornerstone3D/issues/1071
      // and cyclic dependencies in the cornerstone tools package issue
      "@cornerstonejs/tools": "@cornerstonejs/tools/dist/umd/index.js"
    },
  },
})
