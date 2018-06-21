const router = require('koa-router')()
const user = require("./route/user");
const meetingRoom = require("./route/meetingRoom");
const company = require("./route/company")
const meeting = require("./route/meeting");
const device = require("./route/device");

module.exports = app => {
  user(router)
  meetingRoom(router)
  company(router)
  meeting(router)
  device(router)
  app.use(router.routes())
    .use(router.allowedMethods());
}
