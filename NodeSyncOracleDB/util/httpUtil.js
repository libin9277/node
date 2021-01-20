"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const format = require("string-format");
const AppLogger_1 = require("./AppLogger");
class SocietyApi {
    /**
     * 同步调用社会救助API ,按表单方式提交
     * @param url  地址
     * @param option  参数
     */
    postAsync(option) {
        // var fun = function () {
        return new Promise(function (resolve, reject) {
            request.post({
                url: option.url,
                headers: option.headers,
                formData: option.body
            }, function (error, response, body) {
                var log = new AppLogger_1.default();
                if (error) {
                    reject(error);
                    var msg = format('option:{}\n', JSON.stringify(option)) + error + "-->" + (error.stack || '');
                    log.error(msg, "app服务", '系统日志');
                }
                else {
                    resolve(body);
                    var msg = format('option:{}\n', JSON.stringify(option)) + "return-->" + JSON.stringify(body);
                    log.info(msg, "app服务", '系统日志');
                }
            });
        });
        // };
        // return fun();
    }
    /**
    * 同步调用社会救助API ,按表单方式提交
    * @param url  地址
    * @param option  参数
    */
    postFormAsync(option) {
        // var fun = function () {
        return new Promise(function (resolve, reject) {
            request.post({
                url: option.url,
                headers: option.headers,
                form: option.body
            }, function (error, response, body) {
                var log = new AppLogger_1.default();
                if (error) {
                    reject(error);
                    var msg = format('option:{}\n', JSON.stringify(option)) + error + "-->" + (error.stack || '');
                    log.error(msg, "app服务", '系统日志');
                }
                else {
                    resolve(body);
                    var msg = format('option:{}\n', JSON.stringify(option)) + "return-->" + JSON.stringify(body);
                    log.info(msg, "app服务", '系统日志');
                }
            });
        });
        // };
        // return fun();
    }
    /**
     * 异步调用社会救助API,按表单方式提交
     * @param option  参数
     * @param success  成功回调
     * @param falut   失败回调
     * isSign 是否签名
     */
    post(option, success, falut) {
        request.post({
            url: option.url,
            headers: option.headers,
            formData: option.body
        }, function (error, response, body) {
            var log = new AppLogger_1.default();
            if (error) {
                falut(error);
                var msg = format('option:{}\n', JSON.stringify(option)) + error + "-->" + (error.stack || '');
                log.error(msg, "app服务", '系统日志');
            }
            else {
                success(body);
                var msg = format('option:{}\n', JSON.stringify(option)) + "return-->" + JSON.stringify(body);
                log.info(msg, "app服务", '系统日志');
            }
        });
    }
    postJson(option, success, falut) {
        request({
            url: option.url,
            method: "POST",
            json: true,
            headers: option.headers,
            body: option.body
        }, function (error, response, body) {
            var log = new AppLogger_1.default();
            if (error) {
                falut(error);
                var msg = format('option:{}\n', JSON.stringify(option)) + error + "-->" + (error.stack || '');
                log.error(msg, "app服务", '系统日志');
            }
            else {
                success(body);
                var msg = format('option:{}\n', JSON.stringify(option)) + "return-->" + JSON.stringify(body);
                log.info(msg, "app服务", '系统日志');
            }
        });
    }
    postJsonAsync(option) {
        var that = this;
        return new Promise(function (resolve, reject) {
            option.headers['content-type'] = "application/json";
            request({
                url: option.url,
                method: "POST",
                json: true,
                headers: option.headers,
                body: option.body
            }, function (error, response, body) {
                var log = new AppLogger_1.default();
                if (error) {
                    reject(error);
                    var msg = format('option:{}\n', JSON.stringify(option)) + error + "-->" + (error.stack || '');
                    log.error(msg, "app服务", '系统日志');
                }
                else {
                    resolve(body);
                    var msg = format('option:{}\n', JSON.stringify(option)) + "return-->" + JSON.stringify(body);
                    log.info(msg, "app服务", '系统日志');
                }
            });
        });
    }
    getAsync(option) {
        var that = this;
        return new Promise(function (resolve, reject) {
            var paramStr = '';
            for (var key in option.body) {
                paramStr += key + "=" + option.body[key];
            }
            var opt = {
                url: option.url + "?" + paramStr,
                method: "GET",
            };
            request(opt, function (error, response, body) {
                var log = new AppLogger_1.default();
                if (error) {
                    reject(error);
                    var msg = format('option:{}\n', JSON.stringify(option)) + error + "-->" + (error.stack || '');
                    log.error(msg, "app服务", '系统日志');
                }
                else {
                    //var parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });   //xml -> json
                    //parser.parseString(body, function (err, result) {
                    //    console.log('xml解析成json:' + JSON.stringify(result));
                    //    resolve(result);
                    //});
                    resolve(body);
                    var msg = format('option:{}\n', JSON.stringify(option)) + "return-->" + JSON.stringify(body);
                    log.info(msg, "app服务", '系统日志');
                }
            });
        });
    }
}
exports.SocietyApi = SocietyApi;
/**
 * 提交参数
 * */
class PostOption {
    /**
     * 构造提交参数
     * @param url  请求地址
     * @param token
     * @param body  提交参数对象
     */
    constructor(url, token, body = null) {
        this.headers = { access_token: '' };
        this.url = url;
        this.headers.access_token = token;
        this.body = body;
    }
}
exports.PostOption = PostOption;
//# sourceMappingURL=httpUtil.js.map