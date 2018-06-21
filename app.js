const Koa = require('koa')
const app = new Koa()

const mongo = require('./model/db')
const sokectIO = require('./utils/socket')
const config = require('./config')
const router = require('./routes')
const middleWare = require("./middlewares")
require("./service/deviceService").deviceHearts();

// 加载总间件
middleWare(app);
// 加载路由
router(app);


// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
  ctx.body = {
    success: false,
    error: err.message
  }
});

module.exports = app
