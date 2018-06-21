const querystring = require("querystring");
const httpUtil = require('./http');

class Notidy{

    /**
     * 企业发送通知
     * 
     * @static
     * @param {any} access_token 
     * @param {any} content 
     * @returns 
     * @memberof Notidy
     */
    static sendByCode(access_token, content){
        let path = '/message/sendByCode?' + querystring.stringify({access_token});
        return httpUtil.post(path, JSON.stringify(content))
    }
}

module.exports = Notidy