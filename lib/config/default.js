// 项目根目录下新建 fx.webpack.config.js  
module.exports = {
  fxVue: true, // 是否使用Vue
  fxReact: false, // 是否使用React
  fxLess: false, // 是否使用less
  fxSass: true, // 是否使用sass
  fxEntry: './src/main.js', // 单个应用入口,
  fxOutputPath: 'dist', // 输出目录名称
  fxAssetsPath: 'static', // 输出静态文件目录
  fxAppPublic: 'static',// 要拷贝的源文件目录名称
  fxHtml: {
    title: 'title', // 生成html文件的标题
    template: 'index.html', // html模板文件名，请放在fxAppPublic配置目录下
    filename: 'index.html', // 输出的html的文件名称，将输出到fxOutputPath配置目录下
  },
  fxAlias: {
    '@': 'src', // 创建import或require的别名，来确保模块引入变得更简单。
  },
  fxDevServer: {
    https: false,
    host: '0.0.0.0',
    port: 8088, // dev-server 服务端口号
    hot: true, // 启用webpack的热模块更新
    compress: false, //启用gzip压缩
    open: true, // 告诉dev-server在服务器启动后打开浏览器。将其设置为true以打开默认浏览器。
    clientLogLevel: 'warning', //配置在客户端的日志等级，这会影响到你在浏览器开发者工具控制台里看到的日志内容
    proxy: {
      // 代理一些URL。具体用法见https://github.com/chimurai/http-proxy-middleware
      // '/v1': {
      //   target: 'https://www.easy-mock.com/mock/58ff650c739ac1685205a1a7/foresee',
      //   changeOrigin: true
      // },
    },
  },
  fxWebpack: {
    // 以下配置已有默认值，一般无需配置，若有需要，请按webpack配置要求进行配置
    module: {
      rules: [],
    },
    optimization: {},
    performance: {},
    externals: {},
    plugins: []
  }
}