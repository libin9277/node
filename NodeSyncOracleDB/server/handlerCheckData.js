"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const httpUtil_1 = require("../util/httpUtil");
const mySqlhelp_1 = require("../util/mySqlhelp");
const AppLogger_1 = require("../util/AppLogger");
const oracledbHelper_1 = require("../util/oracledbHelper");
const dtUtil = require("../util/DateTimeUtil");
const config_1 = require("../config");
const fs = require("fs");
const path = require("path");
const schedule = require("node-schedule");
var router = express.Router();
module.exports = router;
//var api = new So  cietyApi();
//var log = new AppLogger();
//router.get('/get',async function (req, res) {
//    var opt = new PostOption("http://220.170.152.28:7001/services/mzj_sgs_qyjbxx.HTTPEndpoint/select", "", {
//        uniscid: "93430923MA4LHA1G0Y"
//    })
//    var apiRnt = await api.getAsync(opt);
//    console.log(apiRnt);
//    res.send({ code: 0, msg: "测试" });
//})
//saynsData();
/**
 * 同步数据
 * @param param
 * @param success
 */
function saynsData() {
    return __awaiter(this, void 0, void 0, function* () {
        var Helplog = new mySqlhelp_1.default();
        Helplog.conSetting = config_1.default.orgMySql;
        var odb = new oracledbHelper_1.default();
        var conn = yield odb.connect(config_1.default.orgOrcale);
        var dt = new dtUtil.DateTimeUtil();
        console.log('启动时间:' + dt.format(new Date(), 'yyyy-MM-dd hh:mm:ss'));
        var date = dt.format(new Date(), 'yyyy-MM-dd');
        var sql = '';
        var rows;
        for (var i = 0; i < config_1.default.tables.length; i++) {
            sql = "select * from " + config_1.default.tables[i].name + " where DATE_FORMAT(create_time,'%Y-%m-%d') = ?";
            rows = yield Helplog.queryAsync(sql, [date]);
            if (rows.length > 0) {
                for (var j = 0; j < rows.length; j++) {
                    var setList = [];
                    var valueList = [];
                    var statementList = [];
                    for (var key in rows[j]) {
                        setList.push(`${key}`);
                        valueList.push(rows[j][key]);
                        statementList.push('?');
                    }
                    var sql = "INSERT INTO " + config_1.default.tables[i].name + ` ( ${setList.join(",")}) values (${statementList.join(",")})`;
                    var data = yield odb.queryAsync(conn, sql, valueList);
                }
            }
            else {
                console.log("暂无数据");
            }
        }
        //var odb = new oracledb();
        //var conn = await odb.connect(config.orgOrcale);
        //var sql = "select * from JZ_WTHDDX";
        //var param = [];
        //var rnt = await odb.queryAsync(conn, sql, param);
        //console.log(rnt);
    });
}
//demo();
function demo() {
    return __awaiter(this, void 0, void 0, function* () {
        var odb = new oracledbHelper_1.default();
        var conn = yield odb.connect(config_1.default.orgOrcale);
        //50-市州已反馈核对结果
        var sql = "select * from JZ_WTHDDX";
        var data = yield odb.queryAsync(conn, sql, []);
        if (data.length > 0) {
            console.log(data[0].BBEX0001);
        }
        odb.close(conn);
    });
}
var scheduleCronstyle = () => {
    //每分钟的第30秒定时执行一次:
    schedule.scheduleJob('* * * * * *', () => {
        console.log('scheduleCronstyle:' + new Date());
        //testSync();
    });
};
scheduleCronstyle();
var commonArea = ["430922"]; //设置地区
//testSync();
function testSync() {
    return __awaiter(this, void 0, void 0, function* () {
        let that = this;
        try {
            var Helplog = new mySqlhelp_1.default();
            Helplog.conSetting = config_1.default.orgMySql;
            var dt = new dtUtil.DateTimeUtil();
            var date = dt.format(new Date(), 'yyyy-MM-dd');
            console.log(date);
            var log = new AppLogger_1.default();
            for (var n = 0; n < commonArea.length; n++) {
                //SELECT b.id,a.idCard,c.Serial FROM Col_RequireFamily a INNER JOIN Col_Require b ON a.requireID = b.id INNER JOIN Col_Batch c ON b.batchID = c.id
                //WHERE DATE_FORMAT(c.createTime, '%Y-%m-%d') = '2020-12-25' AND b.areaCode LIKE '430921%'
                var sql = "SELECT cr.id,cr.idCard,cb.Serial FROM Col_Require cr LEFT JOIN Col_Batch cb ON cr.batchID = cb.id WHERE DATE_FORMAT(cb.createTime, '%Y-%m-%d') = ? and cr.areaCode like ?";
                var rows = yield Helplog.queryAsync(sql, [date, commonArea[n].substring(0, 6) + "%"]);
                console.log(rows);
                var odb;
                var conn;
                if (rows.length > 0) {
                    for (var i = 0; i < rows.length; i++) {
                        //同步中台的委托核对结果信息表
                        yield addJZWTHDJG(rows[i].Serial, rows[i].idCard, rows[i].id);
                        odb = new oracledbHelper_1.default();
                        conn = yield odb.connect(config_1.default.orgOrcale);
                        //更新中台委托核对对象信息 50-市州已反馈核对结果
                        var sql = "update JZ_WTHDDX set BBEX0003='50' where BBEX0001='" + rows[i].Serial + "' and BBEE0005='" + rows[i].idCard + "'";
                        var data = yield odb.sqlAsync(conn, sql, []);
                    }
                }
                else {
                    console.log("该地区暂无对象数据");
                }
            }
        }
        catch (err) {
            console.log(err);
            log.error("更新失败" + JSON.stringify(err), "核对中台更新错误", "错误");
        }
    });
}
//更新中台委托核对对象信息表（JZ_WTHDDX）的核对状态
function updateZTCheckObj(serial, IdCard) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
        }
        catch (err) {
            console.log(err);
        }
    });
}
//添加委托核对结果信息表
function addJZWTHDJG(Serial, idCard, id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("开始执行");
            var log = new AppLogger_1.default();
            var odb = new oracledbHelper_1.default();
            var conn = yield odb.connect(config_1.default.orgOrcale);
            //50-市州已反馈核对结果
            var sql = "select * from JZ_WTHDDX  where BBEX0001='" + Serial + "' and BBEE0005='" + idCard + "'";
            var data = yield odb.queryAsync(conn, sql, []);
            console.log(data);
            if (data.length == 0) {
                console.log("没有对象信息");
                return;
            }
            var Helplog = new mySqlhelp_1.default();
            Helplog.conSetting = config_1.default.orgMySql;
            var sql = "select path from col_Report where RequireID = ?";
            var rows = yield Helplog.queryAsync(sql, [id]);
            if (rows.length == 0) {
                console.log("没有核对报告的pdf");
                return;
            }
            //上传文件到中台 路径需要自己配置
            var filename = "F:\\code\\QxCollating\\Server\\" + rows[0].path;
            filename = path.resolve(__dirname, '/tmp/file/');
            console.log(filename);
            var filePdf = ''; //核对报告附件
            var api = new httpUtil_1.SocietyApi();
            var opt = new httpUtil_1.PostOption("http://10.74.0.80:9005/dm/fileshare/api/2.0/upload", "", {
                file: fs.createReadStream(filename),
                username: "DC_API_JZ",
                password: "h02vuyBJ"
            });
            var rnt = yield api.postAsync(opt);
            console.log(rnt);
            if (rnt.code == 0 && rnt.success) {
                filePdf = rnt.data.fileName;
            }
            var odb = new oracledbHelper_1.default();
            var conn = yield odb.connect(config_1.default.orgOrcale);
            //BBEX0001批次编号BBEE0001申请唯一号
            var sql = "INSERT INTO JZ_WTHDJG (BBEX0001, BBEE0001, BBEE0002, BXEX0013, BBEX0014, BBEX0026, BBEX0027, BBEX0015, BBEX0016, BBEX0012, BBEX0003, BBEX0004,BBEX0005) \
                    VALUES('" + data[0].BBEX0001 + "', '" + data[0].BBEE0001 + "', '" + data[0].BBEE0002 + "'," + new Date() + ", '01', '" + data[0].BBEX0026 + "', '" + filePdf + "', '', '','', '60', '核对数据推送', '')";
            var data = yield odb.sqlAsync(conn, sql, []);
        }
        catch (err) {
            console.log(err);
            console.log("添加委托核对结果信息表异常");
            log.error("添加委托核对结果信息表异常" + JSON.stringify(err), "核对中台", "错误");
        }
    });
}
//# sourceMappingURL=handlerCheckData.js.map