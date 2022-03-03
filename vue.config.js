module.exports = {
    devServer: {
        proxy: {
          '/api': {
            target: 'https://od.moi.gov.tw/',
            ws: true,
            changeOrigin: true
          }
        }
      }
}