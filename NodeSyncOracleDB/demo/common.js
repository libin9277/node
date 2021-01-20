"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const oracledb = require("oracledb");
var config = {
    user: 'CDDATA',
    password: '123456',
    connectString: '192.168.0.112:1521/CSDATA' //连接地址
};
var orgOrcale = {
    user: 'xj_data',
    password: 'mcxx1234',
    connectString: '192.168.0.112:1521/XJ_DATA' //连接地址
};
oracledb.getConnection(orgOrcale, function (err, connection) {
    console.log(connection);
    if (err) {
        console.error("错误--");
        console.error(err.message);
        return;
    }
    var sql = "insert into JZ_WTHDDX(BBEX0001,BBEE0001,BBEE0002,BBEE0003,BBEE0004,BBEE0005,AXCP0004,AXCP0003,AXCP0002,BXCP0024 \
                    ,BXCP0025,BXCP0013,BXCP0012,BBEE0026,BBEE0019,BBEE0020,BBEX0002,BBEX0004,BBEX0005,BBEE0021,BBEE0022,BBEX0003,BBEX0011,BBEX0012) \
                    VALUES('20201023430921002','4706E6010C1C4E85A74CDF45EED7B4F6','1EBE36252FAE48129275F47229A4357E','龚富贵','01','432322197411074820','龚富贵','01','432322197411074820',\
                    1,'01','430921103236','测试','1000001','','','01','','','','','00','','')";
    //var sql = "select * from JZ_WTHDDX where BBEX0001='43032111400020200731164250' and BBEE0005='430321196801312553'";
    //var sql = "select * from JZ_WTHDDX";
    //查询某表十条数据测试，注意替换你的表名
    //connection.execute(sql, [],
    //    function (err, result) {
    //        if (err) {
    //            console.error(err.message);
    //            doRelease(connection);
    //            return;
    //        }
    //        //打印返回的表结构
    //        console.log(result.metaData);
    //        //打印返回的行数据
    //        console.log(result.rows);
    //        //doRelease(connection);
    //    });
    connection.execute(sql, [], { autoCommit: true }, function (err, result) {
        if (err) {
            console.error(err.message);
            doRelease(connection);
            return;
        }
        //打印返回的行数据
        console.log(result);
        doRelease(connection);
    });
});
function doRelease(connection) {
    connection.close(function (err) {
        if (err) {
            console.error(err.message);
        }
    });
}
//# sourceMappingURL=common.js.map