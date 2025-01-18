export default {
  base: "./",
  build: {
    sourcemap: true,
    assetsDir: "assets",
    rollupOptions: {
      input: {
        main: "./index.html",
      },
      output: {
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
};
