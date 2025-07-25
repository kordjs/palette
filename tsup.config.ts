import { defineConfig } from 'tsup';

export default defineConfig({
        entry: ['./src/index.ts'],
        outDir: 'dist',
        format: ['esm', 'cjs'],
        dts: true,
        splitting: false,
        clean: true,
        sourcemap: false,
        shims: true
});
