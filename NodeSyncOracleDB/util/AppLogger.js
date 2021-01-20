"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//import request = require('request'); //web 请求
const config = require("../config");
const flog = require("./fileLogger");
class AppLogger {
    constructor() {
        this.error = function (msg, modName, ctxType) {
            if (this.level.error)
                this.log('error', msg, modName, ctxType);
        };
        this.warning = function (msg, modName, ctxType) {
            if (this.level.warning)
                this.log('warning', msg, modName, ctxType);
        };
        this.level = config.default.logSetting.level;
        this.prefix = "";
    }
    log(logtype, msg, modName, ctxType) {
        var pData = {
            logType: logtype || '',
            prjName: '数据采集',
            modName: modName || '',
            ctxType: ctxType || '',
            context: msg
        };
        try {
            if (logtype == "error")
                flog.errLogger(pData, this.prefix);
            else
                flog.fileLogger(pData, this.prefix);
            //request({
            //    url: config.setting.logSetting.addUrl,
            //    method: "POST",
            //    json: true,
            //    headers: {
            //        "content-type": "application/json",
            //    },
            //    body: pData
            //}, function (error, response, body) {
            //    if (error || response.statusCode != 200) {
            //        flog.fileLogger('日志调用失败:' + error + ",status=" + response.statusCode);
            //    }
            //});
        }
        catch (err) {
            console.log(err);
        }
    }
    /**
     * 调试日志
     * @param msg 日志内容
     * @param modName 模块名称
     * @param ctxType 日志类型
     */
    debug(msg, modName, ctxType) {
        if (this.level.debug)
            this.log('debug', msg, modName, ctxType);
    }
    info(msg, modName, ctxType) {
        if (this.level.info)
            this.log('info', msg, modName, ctxType);
    }
}
exports.default = AppLogger;
//# sourceMappingURL=AppLogger.js.map