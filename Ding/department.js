var querystring = require("querystring");
var httpUtil = require('./http');

class Department {
    constructor() { }

    static async create(accessToken, dept) {
        let path = '/department/create?' + querystring.stringify({
            access_token: accessToken,
        });
        return await httpUtil.post(path, JSON.stringify(dept))
    }

    /**
     * 获取部门列表
     * @param {*accessToken} accessToken 
     */
    static async list(accessToken) {
        let path = '/department/list?' + querystring.stringify({
            access_token: accessToken,
        });
        return await httpUtil.get(path)
    }
    

    /**
     * 获取部门详情
     * @param {*accessToken} accessToken 
     * @param {*id} id 
     */
    static async get(accessToken, id) {
        let path = '/department/get?' + querystring.stringify({
            access_token: accessToken,
            id
        });
        return await httpUtil.get(path)
    }

    static async delete(accessToken, id) {
        let path = '/department/delete?' + querystring.stringify({
            access_token: accessToken,
            id
        });
        return await httpUtil.get(path)
    }

    

}

module.exports = Department