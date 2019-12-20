// vue.config.js
module.exports = {
  devServer: {
    proxy: 'http://ffastaging.computablelabs.com/',
    disableHostCheck: true
  },
  chainWebpack: config => {
    config.module.rule('md')
      .test(/\.md/)
      .use('vue-loader')
      .loader('vue-loader')
      .end()
      .use('vue-markdown-loader')
      .loader('vue-markdown-loader/lib/markdown-compiler')
      .options({
        raw: true,
        breaks: true,
      })
  },
};