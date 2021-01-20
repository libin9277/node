import dtUtil = require('./DateTimeUtil');
import format = require('string-format');
import fs = require("fs");
/**
 * 文件写入日志信息
 * @param err 日志内容
 */
export function fileLogger(err, prefix: string="") {
    var dutl = new dtUtil.DateTimeUtil();
    try {
        var nowDate = dutl.format(new Date(), 'yyyyMMdd');

        var nowTime = dutl.format(new Date(),'yyyy-MM-dd hh:mm:ss');
        var filePath = format("./{}loginfo{}.log", prefix, nowDate);
        fs.appendFile(filePath, nowTime + '--->' + JSON.stringify(err) + '\n', function (err) {
        });
    }
    catch (ex) {
        console.log(ex);
    }
}
export function errLogger(err, prefix: string = "") {
    var dutl = new dtUtil.DateTimeUtil();
    try {
        var nowDate = dutl.format(new Date(), 'yyyyMMdd');

        var nowTime = dutl.format(new Date(), 'yyyy-MM-dd hh:mm:ss');
        var filePath = format("./{}err{}.log", prefix,nowDate);
        fs.appendFile(filePath, nowTime + '--->' + JSON.stringify(err) + '\n', function (err) {
        });
    }
    catch (ex) {
        console.log(ex);
    }
}