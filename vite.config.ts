import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { alphaTab } from '@coderline/alphatab-vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
export default defineConfig({ plugins: [react(), tailwindcss(), alphaTab(), ...(process.env.PWM_HTTPS==='1'?[basicSsl()]:[])] });
