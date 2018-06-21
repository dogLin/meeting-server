/**
 * 系统配置文件
 */
const path = require('path');

const config = {
  // 本地调试模式
  debug: true,
  // 网站名称
  sitename: 'CviMeeting',
  describute: "cvi网络广播会议",
  // 板块列表
  tags: ['首页', '会议', '音乐库', '设备'],
  // 论坛管理员，username
  admins: ['daiyang'],
  // 数据库连接
  mongodb: {
    user: 'meeting',
    pass: 'toor',
    // host: '192.168.8.132',
    host: 'localhost',
    port: 27017,
    database: 'meeting'
  },
  // Redis配置
  redis: {
    //host: 'localhost',
    host: '169.254.56.114',
    port: 6379,
    password: 'foobared'
  },

  default_avatar: '/public/images/photo.png', // 默认头像

  upload: {
    path: path.join(__dirname, 'public/upload/'),
    url: '/public/upload',
    extnames: ['jpeg', 'jpg', 'gif', 'png'],
    fileSize: 1024 * 1024
  },
  deviceHeartPort: 30313,
  log: {
    appenders: {
      error: {
        "category": "errorLogger", //logger名称
        "type": "dateFile", //日志类型
        "filename": path.resolve(__dirname, "./logs/error/err"), //日志输出位置
        "alwaysIncludePattern": true, //是否总是有后缀名
        "pattern": "-yyyy-MM-dd-hh.log", //后缀，每小时创建一个新的日志文件
        "path": '/error',
      },
      response: {
        "category": "resLogger",
        "type": "dateFile",
        "filename": path.resolve(__dirname, "./logs/response/res"),
        "alwaysIncludePattern": true,
        "pattern": "-yyyy-MM-dd-hh.log",
        "path": '/response',
      }
    },
    categories: {
      error: {
        appenders: ['error'],
        level: 'error'
      },
      response: {
        appenders: ['response'],
        level: 'info'
      },
      default: {
        appenders: ['response'],
        level: 'info'
      },
    }
  },

  // token加密密钥 
  token: {
    secret: "zhongxie",
  },

  Ding: {
    corpid: 'ding0ef9dd5f1b68d975',
    corpsecret: 'QF87A-t38vE20PWlRupmuE6fclWs_XKyE7cw8xqz5PFuzyd7XCUQH9JOLVlX5fjd',
    AccessToken: '',
    AccessTokenTime:'',
    AccessTokenReGet: 7000, //
  }
}

module.exports = config;