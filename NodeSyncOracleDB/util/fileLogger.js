"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dtUtil = require("./DateTimeUtil");
const format = require("string-format");
const fs = require("fs");
/**
 * 文件写入日志信息
 * @param err 日志内容
 */
function fileLogger(err, prefix = "") {
    var dutl = new dtUtil.DateTimeUtil();
    try {
        var nowDate = dutl.format(new Date(), 'yyyyMMdd');
        var nowTime = dutl.format(new Date(), 'yyyy-MM-dd hh:mm:ss');
        var filePath = format("./{}loginfo{}.log", prefix, nowDate);
        fs.appendFile(filePath, nowTime + '--->' + JSON.stringify(err) + '\n', function (err) {
        });
    }
    catch (ex) {
        console.log(ex);
    }
}
exports.fileLogger = fileLogger;
function errLogger(err, prefix = "") {
    var dutl = new dtUtil.DateTimeUtil();
    try {
        var nowDate = dutl.format(new Date(), 'yyyyMMdd');
        var nowTime = dutl.format(new Date(), 'yyyy-MM-dd hh:mm:ss');
        var filePath = format("./{}err{}.log", prefix, nowDate);
        fs.appendFile(filePath, nowTime + '--->' + JSON.stringify(err) + '\n', function (err) {
        });
    }
    catch (ex) {
        console.log(ex);
    }
}
exports.errLogger = errLogger;
//# sourceMappingURL=fileLogger.js.map