const crypto = require('crypto');

const auth = require('./auth');

class DingSign {
    constructor() { }

    static getJsapiSign(params) {
        let plain = `jsapi_ticket=${params.ticket}&noncestr=${params.nonceStr}&timestamp=${params.timeStamp}&url=${params.url}`
        console.log(plain);
        let sha1 = crypto.createHash("sha1");
        sha1.update(plain, "utf8");
        return sha1.digest("hex");
    }

    static async getSign(params) {
        try {
            let data = await auth.getAccessToken();
            if (!data || !data.access_token) {
                throw(new Error("没有拿到access_token"))
                return
            }
            let accessToken = data.access_token;
            console.log('sign accessToken: ' + accessToken);
            let ticketResult = await auth.getTicket(accessToken);
            if (!ticketResult || !ticketResult.ticket) {
                throw(new Error("没有拿到jsapi_ticket"));
                return
            }
            let jsapiTicket = ticketResult.ticket;
            console.log('sign ticket: ' + jsapiTicket);
            params.ticket = jsapiTicket;
            let signature = this.getJsapiSign(params);
            console.log('sign signature:' + signature);
            return  signature           
        } catch (error) {
            console.log(error.message)
            throw(error)
        }
    }
}

module.exports = DingSign;