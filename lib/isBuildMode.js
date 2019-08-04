const env = process.env.NODE_ENV

module.exports = env === 'dev' || env === 'test' || env === 'preprod' || env === 'production'
