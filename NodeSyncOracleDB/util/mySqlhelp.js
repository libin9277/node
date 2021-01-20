"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mysql = require("mysql");
const AppLogger_1 = require("../util/AppLogger");
/**
 * mySql 控制类 ver 1.01
 * */
class MySqlHelper {
    constructor() {
        this.pool = null;
        this._connection = null;
    }
    execSql(backFunction) {
        var log = new AppLogger_1.default();
        if (this._connection != null) {
            backFunction(this._connection);
            return;
        }
        if (!this.pool) {
            //console.log(this.conSetting);
            this.pool = mysql.createPool(this.conSetting);
        }
        var that = this;
        this.pool.getConnection(function (err, connection) {
            if (err) {
                log.error(err, "数据访问", "sql日志");
                console.log(err);
            }
            else {
                that._connection = connection;
                backFunction(connection);
            }
        });
    }
    close() {
        if (this._connection) {
            this._connection.release();
            this._connection = null;
        }
    }
    /**
     * 执行查询语句
     * @param sql 查询语句
     * @param param 语句参数
     * @param success 成功回调函数
     * @param error  失败回调函数
     */
    query(sql, param, success, error) {
        var log = new AppLogger_1.default();
        // mysql.createConnection(this.conSetting);
        var connt = this.execSql(function (conn) {
            var query = conn.query(sql, param, function (err, result) {
                if (err) {
                    error(err);
                    log.error("数据库错误:" + err, "db", "错误");
                    console.error("数据库错误:" + err);
                }
                else {
                    success(result);
                }
                // conn.release();
            });
            log.info("sql语句:" + query.sql, "db", "sql日志");
            //console.log("sql语句:" + query.sql)
        });
        //console.log(query.sql);
        //  conn.end();
    }
    /**
     * 同步执行查询语句
     * @param sql  查询语句
     * @param param  查询参数
     */
    queryAsync(sql, param) {
        var log = new AppLogger_1.default();
        var that = this;
        return new Promise(function (resolve, reject) {
            //var conn = mysql.createConnection(that.conSetting);
            that.execSql(function (conn) {
                var query = conn.query(sql, param, function (err, result) {
                    if (err) {
                        reject(err);
                        //log.error("数据库错误:" + err, "db", "错误");
                        console.error("数据库错误:" + err);
                    }
                    else {
                        resolve(result);
                    }
                    // conn.release();
                });
                //log.info("sql语句:" + query.sql, "db", "sql日志");
                //console.log("sql语句:" + query.sql)
            });
            //conn.connect();
            // conn.end();
        });
    }
}
exports.default = MySqlHelper;
//# sourceMappingURL=mySqlhelp.js.map