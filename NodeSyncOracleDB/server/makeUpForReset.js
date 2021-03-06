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
const oracledbHelper_1 = require("../util/oracledbHelper");
const dtUtil = require("../util/DateTimeUtil");
const config_1 = require("../config");
var commonArea = ["430921000000", "430922000000", "430923000000", "430981000000"]; //设置地区
main();
function main() {
    for (var i = 0; i < commonArea.length; i++) {
        makeUpForReset(commonArea[i]);
    }
    // deleteBatch();
}
function deleteBatch() {
    return __awaiter(this, void 0, void 0, function* () {
        var odb = new oracledbHelper_1.default();
        var conn = yield odb.connect(config_1.default.orgOrcale);
        var sql = "delete from hd_xchdpc where bbex0001  in( select * from (select  bbex0001 from hd_xchdpc where bbex0001 not in(select * from (select bbex0001 from hd_xchddx group by bbex0001) a)) b)";
        yield odb.sqlAsync(conn, sql, []);
        //odb.close
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
            //var s = "select * from jz_hddx where BBEE0001 not in(select BBEE0001 from HD_XCHDDX)"
            //to_date('2016-07-12 20:58:12','yyyy-mm-dd hh24:mi:ss')
            var sql_1 = "select BBEX0002,BXCP0013,BBEE0026,count(1) count from jz_hddx where BBEE0001 not in(select BBEE0001 from HD_XCHDDX) group by BBEX0002,BXCP0013,BBEE0026";
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
//# sourceMappingURL=makeUpForReset.js.map