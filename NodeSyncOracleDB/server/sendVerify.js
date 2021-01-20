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
const httpUtil_1 = require("../util/httpUtil");
const mySqlhelp_1 = require("../util/mySqlhelp");
const oracledbHelper_1 = require("../util/oracledbHelper");
const dtUtil = require("../util/DateTimeUtil");
const config_1 = require("../config");
const schedule = require("node-schedule");
var Helplog = new mySqlhelp_1.default();
Helplog.conSetting = config_1.default.orgMySql;
var mcMySql = new mySqlhelp_1.default();
mcMySql.conSetting = config_1.default.mcSaveMySql;
var commonArea = ["430921000000", "430922000000", "430923000000", "430981000000"]; //设置地区
var scheduleCronstyle = () => {
    var rule = new schedule.RecurrenceRule();
    //rule.minute = [0, 5];
    rule.minute = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
    //每分钟的第30秒定时执行一次:
    schedule.scheduleJob(rule, () => {
        console.log('scheduleCronstyle:' + new Date());
        resultDate();
        for (var i = 0; i < commonArea.length; i++) {
            queryJZHDDX(commonArea[i]);
        }
    });
};
scheduleCronstyle();
/**
 * 复查的市级向省级推送数据,获取报告流程
 * */
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var odb = new oracledbHelper_1.default();
            var conn = yield odb.connect(config_1.default.orgOrcale);
            var dt = new dtUtil.DateTimeUtil();
            var date = dt.format(new Date(), 'yyyy-MM-dd');
            console.log(date);
            for (var n = 0; n < commonArea.length; n++) {
                //var sql = "SELECT cr.id,cr.idCard,cb.Serial,cr.orderId,cr.familyID FROM Col_Require cr LEFT JOIN Col_Batch cb ON cr.batchID = cb.id WHERE DATE_FORMAT(cb.createTime, '%Y-%m-%d') = ? and cr.areaCode like ?";
                var sql = "select check_batch_no as batchNo,check_request_no as requestNo,idcard_no as idcard from busi_recheck where DATE_FORMAT(create_time, '%Y-%m-%d') = ? and area_code like ?";
                var rows = yield Helplog.queryAsync(sql, [date, commonArea[n].substring(0, 6) + "%"]);
                console.log(rows);
                if (rows.length > 0) {
                    for (var i = 0; i < rows.length; i++) {
                        //更新 15-市州已接收核对委托
                        var sql_1 = "update JZ_HDDX set BBEX0003 = '15' where BBEX0001 ='" + rows[i].Serial + "'";
                        var rnt = yield odb.sqlAsync(conn, sql_1, []);
                    }
                }
            }
        }
        catch (err) {
            console.log(err);
        }
        finally {
            odb.close(conn);
        }
    });
}
//
function queryJZHDDX(areaCode) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var odb = new oracledbHelper_1.default();
            var conn = yield odb.connect(config_1.default.orgOrcale);
            var sql_1 = "SELECT bbex0001,bbee0001,bbee0002,bbee0003,bbee0004,bbee0005,axcp0004,axcp0003," +
                "axcp0002,bxcp0024,bxcp0025,bxcp0013,bxcp0012,bbee0026,bbee0019,bbee0020,bbex0002," +
                "bbex0004,bbex0005,bbee0021,bbee0022,bbex0003,bbex0011,bbex0012 FROM jz_hddx where  bbex0003='10'";
            var rnt = yield odb.queryAsync(conn, sql_1, []);
            if (rnt.length == 0) {
                console.log("未找到相关数据");
                return;
            }
            //for (var i = 0; i < (<any>rnt).length;i++) {
            //市级接收委托数据，并将数据状态修改为 20-市级已进入核对阶段；
            //var sql_2 = "update JZ_HDDX set BBEX0003 = '20' where BBEX0001 ='" + rnt[i].BBEX0001 + "'";
            //await odb.sqlAsync(conn, sql_2, []);
            //}
            console.log(rnt);
            console.log("开始生成批次,并生成协查批次信息和对象信息");
            sendRquerstBatch(areaCode);
        }
        catch (err) {
            console.log("0000");
            console.log(err);
        }
        finally {
            odb.close(conn);
        }
    });
}
//queryResourceList();
function queryResourceList() {
    return __awaiter(this, void 0, void 0, function* () {
        var str = 'EX_HJXX,EX_CLXX,EX_CKXX,EX_XNHXX,EX_CZGYRYXX';
        var url = "http://59.231.222.29:9005/dm/datashare/api/2.0/queryResourceList";
        var api = new httpUtil_1.SocietyApi();
        var opt = new httpUtil_1.PostOption(url, '', {
            username: 'DC_API_430900000000',
            password: 'kbzxd53r',
        });
        var rnt = yield api.getAsync(opt);
        console.log(rnt);
        //url = "http://59.231.222.29:9005/dm/datashare/api/2.0/queryResourceMetadata";
        //opt = new PostOption(url, '', {
        //    username: 'DC_API_430900000000',
        //    password: 'kbzxd53r',
        //    resourceId:'',
        //})
        //var data = await api.postJsonAsync(opt);
    });
}
/**
 * 市州发送省级协查请求//EX_HJXX,EX_CLXX,EX_CKXX,EX_XNHXX,EX_CZGYRYXX
 * @param rows
 */
function sendRquerstBatch(areaCode) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var dt = new dtUtil.DateTimeUtil();
            var date = dt.format(new Date(), 'yyyy-MM-dd hh-mm-ss');
            //市州发送省级-协查批次信息表
            var odb = new oracledbHelper_1.default();
            var conn = yield odb.connect(config_1.default.orgOrcale);
            //to_date('2016-07-12 20:58:12','yyyy-mm-dd hh24:mi:ss')
            var sql_1 = "select BBEX0002,BXCP0013,BBEE0026,count(1) count from jz_hddx where bbex0003='10' group by BBEX0002,BXCP0013,BBEE0026";
            var rnt = yield odb.queryAsync(conn, sql_1, []);
            for (var n = 0; n < rnt.length; n++) {
                var serial = yield createBatchSerial(areaCode);
                console.log("生成的批次号为：" + serial);
                var sql_3 = "SELECT bbex0001,bbee0001,bbee0002,bbee0003,bbee0004,bbee0005,axcp0004,axcp0003," +
                    "axcp0002,bxcp0024,bxcp0025,bxcp0013,bxcp0012,bbee0026,bbee0019,bbee0020,bbex0002," +
                    "bbex0004,bbex0005,bbee0021,bbee0022,bbex0003,bbex0011,bbex0012 FROM jz_hddx where bbex0003='10' and  BBEX0002='" + rnt[n].BBEX0002 + "' and BXCP0013 ='" + rnt[n].BXCP0013 + "' and BBEE0026 ='" + rnt[n].BBEE0026 + "'";
                var rows = yield odb.queryAsync(conn, sql_3, []);
                if (!rntData[0] && rntData["rows"][0][0] == 0) {
                    var sql = "insert into HD_XCHDPC(BBEX0001,BBEE0002,BXCP0013,BBEE0026,BXCP0012,BBEE0006,BBEX0011," +
                        "BBEX0015,BBEX0003, BBEX0004, BBEX0005) values " +
                        "('" + serial + "','" + rnt[n].BBEX0002 + "','" + rnt[n].BXCP0013 + "','" + rnt[n].BBEE0026 + "',to_date('" + date +
                        "','yyyy-mm-dd hh24:mi:ss')," + rnt[n].COUNT + ",to_date('" + date + "','yyyy-mm-dd hh24:mi:ss'),'EX_HJXX,EX_CLXX,EX_CKXX,EX_XNHXX,EX_CZGYRYXX','30','市州发送省级','正常')"; //30 - 市州已请求省级协查
                    yield odb.sqlAsync(conn, sql, []);
                }
                for (var i = 0; i < rows.length; i++) {
                    var sqlCount = "select count(1) count from HD_XCHDDX where BBEE0001 = '" + rows[i].BBEE0001 + "'";
                    var rntData = yield odb.sqlAsync(conn, sqlCount, []);
                    if (!rntData[0] && rntData["rows"][0][0] == 0) {
                        sql = "insert into HD_XCHDDX(BBEX0001,BBEE0001,BBEE0002,BBEE0003,BBEE0004,BBEE0005,AXCP0004,AXCP0003,\
                                     AXCP0002,BXCP0024,BXCP0025,BXCP0013,BXCP0012,BBEE0026,BBEX0002\
                                     ) values ('" + serial + "','" + rows[i].BBEE0001 + "','" + rows[i].BBEE0002 + "',\
                                    '" + rows[i].BBEE0003 + "','" + rows[i].BBEE0004 + "','" + rows[i].BBEE0005 + "','" + rows[i].AXCP0004 + "',\
                                    '" + rows[i].AXCP0003 + "','" + rows[i].AXCP0002 + "','" + rows[i].BXCP0024 + "',\
                                    '" + rows[i].BXCP0025 + "','" + rows[i].BXCP0013 + "','" + rows[i].BXCP0012 + "','" + rows[i].BBEE0026 + "','" + rows[i].BBEX0002 + "')";
                        var dataRnt = yield odb.sqlAsync(conn, sql, []);
                    }
                    var sql_2 = "update JZ_HDDX set BBEX0003 = '30' where BBEE0001 ='" + rows[i].BBEE0001 + "'";
                    yield odb.sqlAsync(conn, sql_2, []);
                }
            }
            //市级发送协查数据，并将数据状态修改为 30-市级已请求省级协查；
            //省级同步将救助中间库的数据状态修改为 30-市级已请求省级协查；
            // updateJZWTHDDXState(rows[0].BBEX0001, '30');
        }
        catch (err) {
            console.log("addBatch");
            console.log(err);
        }
        finally {
            odb.close(conn);
        }
    });
}
/**
 * 生成批次号12位行政区划代码+yyyymmdd+4位序号
 * @param areaCode
 */
function createBatchSerial(areaCode) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((success, fault) => __awaiter(this, void 0, void 0, function* () {
            try {
                var odb = new oracledbHelper_1.default();
                var conn = yield odb.connect(config_1.default.orgOrcale);
                var step;
                var dt = new dtUtil.DateTimeUtil();
                var date = dt.format(new Date(), 'yyyyMMdd');
                var param = areaCode + date + "%";
                var sql_1 = "select max(BBEX0001) as serial from HD_XCHDPC where BBEX0001 like '" + param + "'";
                var data = yield odb.queryAsync(conn, sql_1, []);
                if (data[0].SERIAL != null) {
                    //430921100000202012290001
                    var rnt = data[0].SERIAL.substring(20, 24);
                    step = (parseInt(rnt) + 1) + 10000;
                    success(areaCode + date + step.toString().substring(1));
                }
                else {
                    success(areaCode + date + '0001');
                }
            }
            catch (err) {
                console.log("错误");
                console.log(err);
                fault(err);
            }
        }));
    });
}
/**
 * 市州接收省级核对结果
 * @param serial
 */
function resultDate() {
    return __awaiter(this, void 0, void 0, function* () {
        //1) 省级反馈协查数据，并将数据状态修改为 40 - 省级已反馈协查结果；
        //2) 省级同步将救助中间库的数据状态修改为 40 - 省级已接收协查结果;
        try {
            var dtime = new dtUtil.DateTimeUtil();
            var odb = new oracledbHelper_1.default();
            var conn = yield odb.connect(config_1.default.orgOrcale);
            var sql = "select dx.BBEX0001,dx.BBEE0001,dx.BBEE0002,dx.AXCP0002 from HD_XCHDDX dx left JOIN HD_XCHDPC pc on dx.BBEX0001=pc.BBEX0001  and  pc.BBEX0003='40'";
            var rnt = yield odb.queryAsync(conn, sql, []);
            if (rnt.length == 0) {
                console.log("未找到相关数据");
                return;
            }
            //需要同步的表 03类型是省级的核对项
            var sql_2 = "select id,TempTableName from chg_AreaStandard where type = '03' and AreaCode = ?";
            var tableName = yield Helplog.queryAsync(sql_2, [commonArea[0]]);
            console.log(tableName);
            for (var n = 0; n < tableName.length; n++) {
                for (var i = 0; i < rnt.length; i++) {
                    var sql_3 = "select * from " + tableName[n].TempTableName + " where BBEX0001='" + rnt[i].BBEX0001 +
                        "' and BBEE0001 ='" + rnt[i].BBEE0001 + "' and BBEE0002 ='" + rnt[i].BBEE0002 + "'";
                    var hdData = yield odb.queryAsync(conn, sql_3, []);
                    if (hdData.length > 0) {
                        //取key和值
                        for (var key in hdData) {
                            var filed = [];
                            var value = [];
                            for (var hd in hdData[key]) {
                                filed.push(hd);
                                var val;
                                if (hdData[key][hd] instanceof Date) {
                                    hdData[key][hd] = dtime.format(hdData[key][hd], "yyyy-MM-dd");
                                }
                                val = hdData[key][hd] ? hdData[key][hd] : '';
                                value.push("'" + val + "'");
                            }
                            var sql_4 = "insert into " + tableName[n].TempTableName + "(" + filed.join(",") + ") values (" + value.join(",") + ")";
                            yield Helplog.queryAsync(sql_4, []);
                        }
                    }
                    //市州接收协查结果，并将数据状态修改为 45-市州已接收协查结果；
                    var sql_6 = "update HD_XCHDPC set BBEX0003='45' where BBEX0001='" + rnt[i].BBEX0001 + "'";
                    yield odb.sqlAsync(conn, sql_6, []);
                    yield updateRqurie(rnt[i].AXCP0002, rnt[i].BBEE0002);
                    //省级同步将救助中间库的数据状态修改为 45-市州已接收协查结果；
                    //updateJZWTHDDXState(rnt[i].BBEX0001, '45'); 
                }
            }
        }
        catch (err) {
            console.log("获取结果失败");
            console.log(err);
        }
        finally {
            odb.close(conn);
        }
    });
}
function updateRqurie(idCard, orderID) {
    return __awaiter(this, void 0, void 0, function* () {
        var sql_1 = "select id,state from Col_Require where idCard =? and orderID=? order by createTime desc limit 1";
        var rnt = yield Helplog.queryAsync(sql_1, [idCard, orderID]);
        if (rnt.length > 0) {
            if (rnt[0].state == 3) {
                var sql = "update Col_Require set state = 5,updateState='02' where id=?";
                yield Helplog.queryAsync(sql, [rnt[0].id]);
            }
            else {
                var sql = "update Col_Require set updateState='02' where id=?";
                yield Helplog.queryAsync(sql, [rnt[0].id]);
            }
        }
    });
}
/**
 * 生成报告
 * */
function generateReport(tableId, tableName, BBEX0001, BBEE0001, BBEE0002) {
    return __awaiter(this, void 0, void 0, function* () {
        //1,查询表的对应列
        //2,查询表的对应列的值
    });
}
/**
 * 市级反馈委托核对结果
 **/
function feedBackJZ(param) {
    return __awaiter(this, void 0, void 0, function* () {
        var odb = new oracledbHelper_1.default();
        var conn = yield odb.connect(config_1.default.orgOrcale);
        //市州反馈救助 - 委托核对结果信息表（JZ_WTHDJG）
        //市州反馈核对结果，并将数据状态修改为 50-市州已反馈核对结果；
        //批次编号,申请唯一号,受理编号,核对反馈时间,核对结果类型,核对报告编号,核对报告附件,请求资源清单,反馈资源清单,更新时间,状态,备注,异常信息
        var sql = "insert into JZ_WTHDJG(BBEX0001,BBEE0001,BBEE0002,BXEX0013,BBEX0014,BBEX0026,BBEX0027,BBEX0015,BBEX0016," +
            "BBEX0012,BBEX0003,BBEX0004,BBEX0005) values('" + param.BBEX0001 + "','" + param.BBEE0001 + "','" + param.BBEE0002 + "'," +
            "'" + param.BXEX0013 + "','" + param.BBEX0014 + "','" + param.BBEX0026 + "','" + param.BBEX0027 + "','" + param.BBEX0015 + "'," +
            "'" + param.BBEX0016 + "','" + param.BBEX0012 + "','" + param.BBEX0003 + "','" + param.BBEX0004 + "','" + param.BBEX0005 + "')";
        yield odb.sqlAsync(conn, sql, []);
        //省级同步将救助中间库的数据状态修改为 50-市州已反馈核对结果；
        //var sql_2 = "update JZ_WTHDDX set BBEX0003='50' where BBEX0001='" + param.BBEX0001 + "'";
        //await odb.sqlAsync(conn, sql_2, []);
    });
}
/**
 * 同步将救助中间库的数据状态修改
 * @param serial
 * @param state
 */
function updateJZWTHDDXState(serial, state) {
    return __awaiter(this, void 0, void 0, function* () {
        var odb = new oracledbHelper_1.default();
        var conn = yield odb.connect(config_1.default.orgOrcaleCS);
        var sql = "update JZ_WTHDDX set BBEX0003='" + state + "' where BBEX0001='" + serial + "'";
        yield odb.sqlAsync(conn, sql, []);
        odb.close;
    });
}
function deleteBatch() {
    return __awaiter(this, void 0, void 0, function* () {
        var odb = new oracledbHelper_1.default();
        var conn = yield odb.connect(config_1.default.orgOrcaleCS);
        var sql = "delete from HD_XCHDPC BBEX0001 in( select * from (select BBEX0001 from HD_XCHDPC where BBEX0001 not in(" +
            "select BBEX0001 from HD_XCHDDX) a ) b)";
        yield odb.sqlAsync(conn, sql, []);
        odb.close;
    });
}
function makeUpForReset(areaCode) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var dt = new dtUtil.DateTimeUtil();
            var date = dt.format(new Date(), 'yyyy-MM-dd hh-mm-ss');
            //市州发送省级-协查批次信息表
            var odb = new oracledbHelper_1.default();
            var conn = yield odb.connect(config_1.default.orgOrcale);
            var s = "select * from jz_hddx where BBEE0001 not in(select BBEE0001 from HD_XCHDDX)";
            //to_date('2016-07-12 20:58:12','yyyy-mm-dd hh24:mi:ss')
            var sql_1 = "select BBEX0002,BXCP0013,BBEE0026,count(1) count from jz_hddx where bbex0003='10' group by BBEX0002,BXCP0013,BBEE0026";
            var rnt = yield odb.queryAsync(conn, sql_1, []);
            for (var n = 0; n < rnt.length; n++) {
                var serial = yield createBatchSerial(areaCode);
                console.log("生成的批次号为：" + serial);
                var sql = "insert into HD_XCHDPC(BBEX0001,BBEE0002,BXCP0013,BBEE0026,BXCP0012,BBEE0006,BBEX0011," +
                    "BBEX0015,BBEX0003, BBEX0004, BBEX0005) values " +
                    "('" + serial + "','" + rnt[n].BBEX0002 + "','" + rnt[n].BXCP0013 + "','" + rnt[n].BBEE0026 + "',to_date('" + date +
                    "','yyyy-mm-dd hh24:mi:ss')," + rnt[n].COUNT + ",to_date('" + date + "','yyyy-mm-dd hh24:mi:ss'),'EX_HJXX,EX_CLXX,EX_CKXX,EX_XNHXX,EX_CZGYRYXX','30','市州发送省级','正常')"; //30 - 市州已请求省级协查
                yield odb.sqlAsync(conn, sql, []);
                var sql_3 = "SELECT bbex0001,bbee0001,bbee0002,bbee0003,bbee0004,bbee0005,axcp0004,axcp0003," +
                    "axcp0002,bxcp0024,bxcp0025,bxcp0013,bxcp0012,bbee0026,bbee0019,bbee0020,bbex0002," +
                    "bbex0004,bbex0005,bbee0021,bbee0022,bbex0003,bbex0011,bbex0012 FROM jz_hddx where bbex0003='10' and  BBEX0002='" + rnt[n].BBEX0002 + "' and BXCP0013 ='" + rnt[n].BXCP0013 + "' and BBEE0026 ='" + rnt[n].BBEE0026 + "'";
                var rows = yield odb.queryAsync(conn, sql_3, []);
                for (var i = 0; i < rows.length; i++) {
                    var sqlCount = "select count(1) count from HD_XCHDDX where BBEE0001 = '" + rows[i].BBEE0001 + "'";
                    var rntData = yield odb.sqlAsync(conn, sqlCount, []);
                    if (!rntData[0]) {
                        sql = "insert into HD_XCHDDX(BBEX0001,BBEE0001,BBEE0002,BBEE0003,BBEE0004,BBEE0005,AXCP0004,AXCP0003,\
                                     AXCP0002,BXCP0024,BXCP0025,BXCP0013,BXCP0012,BBEE0026,BBEX0002\
                                     ) values ('" + serial + "','" + rows[i].BBEE0001 + "','" + rows[i].BBEE0002 + "',\
                                    '" + rows[i].BBEE0003 + "','" + rows[i].BBEE0004 + "','" + rows[i].BBEE0005 + "','" + rows[i].AXCP0004 + "',\
                                    '" + rows[i].AXCP0003 + "','" + rows[i].AXCP0002 + "','" + rows[i].BXCP0024 + "',\
                                    '" + rows[i].BXCP0025 + "','" + rows[i].BXCP0013 + "','" + rows[i].BXCP0012 + "','" + rows[i].BBEE0026 + "','" + rows[i].BBEX0002 + "')";
                        var dataRnt = yield odb.sqlAsync(conn, sql, []);
                        var sql_2 = "update JZ_HDDX set BBEX0003 = '30' where BBEE0001 ='" + rows[i].BBEE0001 + "'";
                        yield odb.sqlAsync(conn, sql_2, []);
                    }
                }
            }
            //市级发送协查数据，并将数据状态修改为 30-市级已请求省级协查；
            //省级同步将救助中间库的数据状态修改为 30-市级已请求省级协查；
            // updateJZWTHDDXState(rows[0].BBEX0001, '30');
        }
        catch (err) {
            console.log("补偿数据");
            console.log(err);
        }
        finally {
            odb.close(conn);
        }
    });
}
//# sourceMappingURL=sendVerify.js.map