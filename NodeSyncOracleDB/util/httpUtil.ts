import request = require('request');
import format = require('string-format');
import fs = require("fs");
import config = require('../config');
import AppLogger from './AppLogger';



export class SocietyApi {
    /**
     * 同步调用社会救助API ,按表单方式提交
     * @param url  地址
     * @param option  参数
     */
    postAsync(option: PostOption) {
        // var fun = function () {
        return new Promise<any>(function (resolve, reject) {
            request.post({
                url: option.url,
                headers: option.headers,
                formData: option.body
            }, function (error, response, body) {
                var log = new AppLogger();
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
    postFormAsync(option: PostOption) {
        // var fun = function () {
        return new Promise<any>(function (resolve, reject) {
            request.post({
                url: option.url,
                headers: option.headers,//option.headers,
                form: option.body
            }, function (error, response, body) {
                var log = new AppLogger();
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
    post(option: PostOption, success: Function, falut: Function) {
        request.post({
            url: option.url,
            headers: option.headers,
            formData: option.body
        }, function (error, response, body) {
            var log = new AppLogger();
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
    postJson(option: PostOption, success: Function, falut: Function) {
        request({
            url: option.url,
            method: "POST",
            json: true,
            headers: option.headers,
            body: option.body
        }, function (error, response, body) {
            var log = new AppLogger();
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
    postJsonAsync(option: PostOption) {
        var that = this;
        return new Promise<any>(function (resolve, reject) {
            option.headers['content-type'] = "application/json";
            request({
                url: option.url,
                method: "POST",
                json: true,
                headers: option.headers,
                body: option.body
            }, function (error, response, body) {
                var log = new AppLogger();
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
    getAsync(option: PostOption) {
        var that = this;
        return new Promise<any>(function (resolve, reject) {
            var paramStr = '';
            for (var key in option.body) {
                paramStr += key + "=" + option.body[key];
            }
            var opt = {
                url: option.url + "?" + paramStr,
                method: "GET",
                //headers: option.headers
            }
            request(opt, function (error, response, body) {
                var log = new AppLogger();
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
/**
 * 提交参数
 * */
export class PostOption {
    url: string;
    headers = { access_token: '' };
    body: object;
    /**
     * 构造提交参数
     * @param url  请求地址
     * @param token  
     * @param body  提交参数对象
     */
    constructor(url: string, token: string, body: object = null) {
        this.url = url;
        this.headers.access_token = token;
        this.body = body;
    }
}