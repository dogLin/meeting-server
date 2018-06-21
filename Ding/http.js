var https = require("https");

class DingHttp {

    static constructor() { }
    
    static async get(path) {
        return new Promise((resolve, reject) => {
            https.get('https://' + DingHttp.oapiHost + path, response => {
                if (response.statusCode === 200) {
                    var body = '';
                    response.on('data', data => {
                        body += data;
                    }).on('end', () => {
                        var result = JSON.parse(body);
                        if (result && 0 === result.errcode) {
                            resolve(result);
                        }
                        else {
                            reject(result);
                        }
                    });
                }
                else {
                    reject(response.statusCode);
                }
            });
        });
    }

    static post(path, data) {
        let pro = new Promise();
        var opt = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            host: DingHttp.oapiHost,
            path: path,
        };
        var req = https.request(opt, function (response) {
            if (response.statusCode === 200) {
                var body = '';
                response.on('data', data => {
                    body += data;
                }).on('end', () => {
                    var result = JSON.parse(body);
                    if (result && 0 === result.errcode) {
                        pro.resolve(result);
                    }
                    else {
                        pro.reject(result);
                    }
                });
            }
            else {
                pro.reject(response.statusCode);
            }
        });
        req.write(data + '\n');
        req.end();
        return pro;
    }
}

DingHttp.oapiHost = 'oapi.dingtalk.com';


module.exports = DingHttp;