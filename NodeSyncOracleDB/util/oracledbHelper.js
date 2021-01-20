"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const oracledb = require("oracledb");
var config = {
    user: 'xj_data',
    password: 'mcxx1234',
    connectString: '192.168.0.112:1521/xjdata' //连接地址
};
//export var query = function (sql,param, callback) {
//    oracledb.getConnection(
//        config,
//        function (err, connection) {
//            if (err) {
//                console.error(err.message);
//                return;
//            } else {
//                console.log("连接成功");
//            }
//            connection.execute(sql, param, function (err, result) {
//                if (err) {
//                    console.error(err.message);
//                    doRelease(connection);
//                    return;
//                }
//                //console.log(result.metaData);
//callback(result.rows.map((v) => {
//    return result.metaData.reduce((p, key, i) => {
//        p[key.name] = v[i];
//        return p;
//    }, {})
//}));
//                doRelease(connection);
//            });
//        }
//    )
//}
//function doRelease(connection) {
//    connection.close(
//        function (err) {
//            if (err)
//                console.error(err.message);
//        });
//}
class Connect {
    connect(connectInfo) {
        return new Promise(function (resolve, reject) {
            oracledb.getConnection(connectInfo, function (err, conn) {
                if (err) {
                    console.log("oracleDB连接失败");
                    console.log(err.message);
                    reject(err);
                    return;
                }
                resolve(conn);
            });
        });
    }
    close(conn) {
        conn.close(err => {
            if (err)
                console.error(err.message);
        });
    }
    /**
     * 查询方法
     * @param conn
     * @param query
     * @param param
     */
    queryAsync(conn, query, param) {
        let that = this;
        return new Promise(function (resolve, reject) {
            conn.execute(query, function (err, result) {
                if (err) {
                    console.log(err.message);
                    that.close(conn);
                    reject(err);
                    return;
                }
                resolve(result.rows.map((v) => {
                    return result.metaData.reduce((p, key, i) => {
                        p[key.name] = v[i];
                        return p;
                    }, {});
                }));
                //that.close(conn);
            });
        });
    }
    /**
     * 增删改方法
     * @param conn
     * @param query
     * @param param
     */
    sqlAsync(conn, query, param) {
        let that = this;
        return new Promise(function (resolve, reject) {
            conn.execute(query, [], { autoCommit: true }, function (err, result) {
                if (err) {
                    console.log(err.message);
                    that.close(conn);
                    reject(err);
                    return;
                }
                resolve(result);
                //that.close(conn);
            });
        });
    }
}
exports.default = Connect;
//# sourceMappingURL=oracledbHelper.js.map