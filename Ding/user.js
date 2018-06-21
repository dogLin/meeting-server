var querystring = require("querystring");
var httpUtil = require('./http');

class User {
    constructor() { }

    /**
     * 根据成员id获取成员详情
     * @param {*} accessToken 
     * @param {*} userid 
     */
    static async get(access_token, userid) {
        let path = '/user/get?' + querystring.stringify({access_token,userid});
        return await httpUtil.get(path)
    }

    static async list(access_token, department_id) {
        let path = '/user/list?' + querystring.stringify({access_token,department_id})
        return await httpUtil.get(path);
    }

    static async getAdmin(access_token) {
        let path = '/user/get_admin?' +querystring.stringify({access_token})
        return await httpUtil.get(path);
    }
}

module.exports = User