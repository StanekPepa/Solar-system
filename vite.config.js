export default {
  base: "./",
  build: {
    sourcemap: true,
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      input: {
        main: "./index.html",
      },
      output: {
        manualChunks: {
          three: ["three"],
        },
        assetFileNames: (assetInfo) => {
          if (
            assetInfo.name.endsWith(".jpg") ||
            assetInfo.name.endsWith(".png")
          ) {
            return "textures/[name][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
  resolve: {
    alias: {
      three: "three",
    },
  },
  publicDir: "public",
  server: {
    host: true,
    port: 3002,
  },
  preview: {
    host: true,
    port: 3002,
  },
};
