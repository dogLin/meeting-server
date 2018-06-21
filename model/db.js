const db = require('../config').mongodb

const mongoose = require("mongoose")

const url = `mongodb://${db.host}:${db.port}/${db.database}`
const option = {
    user: db.user,
    pass: db.pass,
}

// mongoose.connect(url)
mongoose.connect(url, option)
const connection = mongoose.connection;
connection.on("open", () => {
    console.log("数据库连接成功");
})

connection.on("error", (err) => {
    console.error("error in mongodb connection", err);
    mongoose.disconnect()
})

connection.on("close", () => {
    console.log("数据库连接断开，重新链接中...")
    mongoose.connect(uel, option);
})

module.exports = connection;

