"use strict";
/**
*  格式化日期字符串
*/
Object.defineProperty(exports, "__esModule", { value: true });
class DateTimeUtil {
    format(dt, fmt) {
        var o = {
            "M+": dt.getMonth() + 1,
            "d+": dt.getDate(),
            "h+": dt.getHours(),
            "m+": dt.getMinutes(),
            "s+": dt.getSeconds(),
            "S": dt.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (dt.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }
}
exports.DateTimeUtil = DateTimeUtil;
//module.exports =  DateTimeUtil;
//# sourceMappingURL=DateTimeUtil.js.map