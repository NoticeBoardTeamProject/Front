import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    react(),
    svgr({
      // Опционально: можно настроить поведение SVGR
      svgrOptions: {
        icon: true, // Оптимизация для иконок
      },
    }),
  ],
});