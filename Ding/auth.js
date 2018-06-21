const querystring = require("querystring");
const httpUtil = require("./http");
const Ding = require('../config').Ding;

class Auth {
    constructor() { }

    /**
     * 获取accessToken
     * @param {*允许失败次数} limit 
     */
    static async getAccessToken(limit) {
        // 判断是否有accessToken 且未过期
        if (Ding.AccessToken && Ding.AccessTokenTime && new Date() - Ding.AccessTokenTime < Ding.AccessTokenReGet * 1000) {
            return Ding.AccessToken;
        }
        var limit = limit || 3;
        var path = '/gettoken?' + querystring.stringify({
            corpid: Ding.corpid,
            corpsecret: Ding.corpsecret,
        });
        try {
            let result = await httpUtil.get(path);
            if (result && result.access_token) {
                Ding.AccessToken = result.access_token;
                Ding.AccessTokenTime = new Date();
                return result.access_token;
            } else {
               throw new Error('cannot get access_token');
            }
        } catch (error) {
            if (limit == 0) {
                throw error
            } else {
                result = await getAccessToken(limit - 1);
                return result;
            }
        }
    }

    /**
     * 获取jsapi_ticket
     */
    static async getTicket(accessToken) {
        var path = "/get_jsapi_ticket?" + querystring.stringify({
            type: 'jsapi',
            access_token: accessToken
        });
        return await httpUtil.get(path);
    }
}

module.exports = Auth;