const config = require('../config')

const RedisStore = require('koa-redis')

const redisStore = new RedisStore(config.redis)

redisStore.on("ready", function () {
    console.log("Redis连接成功!");
});

redisStore.on("error", function (err) {
    console.log("Error " + err);
});

redisStore.on("end", function () {
    console.log("Redis关闭连接成功!");
});