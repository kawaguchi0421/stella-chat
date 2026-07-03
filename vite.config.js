import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Viteの設定オブジェクトを定義してエクスポートします
export default defineConfig({
  
  // プロジェクトで使用するプラグインの配列を定義します
  plugins: [
    
    // React用のプラグインを配列に追加します
    react(),
    
    // Tailwind CSS用のプラグインを配列に追加します
    tailwindcss(),
  ],
})