const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const session = require('koa-generic-session')
/*const redis = require('../redis/index')*/
const koaJwt = require("koa-jwt");
const errHandle = require('./error-handler');
const cors = require('koa2-cors');
const secret = require("../config").token.secret;
const path = require('path')

// 不需要token验证的路由集合
const filterPath = [
    /^\/register/,
    /^\/login/,
    /^\/ifExist/,
    /^\/json/,
    /^\/upload/,

]

module.exports = (app) => {
    // error handler
    // onerror(app)
    app.use(async (ctx, next) => {
        const start = new Date()
        await next()
        const ms = new Date() - start
        console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
    })
    app.use(cors({
        origin: "*",
        exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
        maxAge: 5,
        credentials: true,
        allowMethods: ['GET', 'POST', 'DELETE', "PUT"],
        allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
    }));
    app.use(errHandle());
    app.use(views(__dirname + '/views', {
        extension: 'pug'
    }))
    app.use(bodyparser({
        enableTypes: ['json', 'form', 'text']
    }))
    // token
    app.use(koaJwt({ secret }).unless({ path: filterPath }));

    app.use(json())
    /*app.use(session({
        store: redis
    }));*/
    app.use(require('koa-static')(path.dirname(__dirname) + '/public'));

}
