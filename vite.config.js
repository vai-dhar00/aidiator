import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';


export default defineConfig({
    plugins: [glsl()],
    build: {
        target: 'esnext',
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    'three': ['three'],
                    'gsap': ['gsap'],
                },
            },
        },
    },
    server: {
        host: true,
        port: 3000,
    },
});
