const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': { 
        target: 'http://localhost:3000', 
        changeOrigin: true, 
        pathRewrite: { '^/api': '' } 
      }
    }
  },
  configureWebpack: {
    plugins: [
      new (require('webpack')).DefinePlugin({
        __VUE_OPTIONS_API__: JSON.stringify(true),
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false) // Добавляем флаг
      })
    ]
  }
});
