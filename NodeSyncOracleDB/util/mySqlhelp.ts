import mysql = require('mysql');
import { MySqlSetting } from '../config';
import AppLogger from '../util/AppLogger';

/**
 * mySql 控制类 ver 1.01
 * */
export default class MySqlHelper {
    pool = null;
    conSetting: MySqlSetting;
    _connection= null;
    constructor() {
        
    }
    private execSql(backFunction: Function) {
        var log = new AppLogger();
        if (this._connection != null) {
            backFunction(this._connection);
            return;
        }     
        if (!this.pool) {
            //console.log(this.conSetting);
            this.pool = mysql.createPool(
                this.conSetting
            );
        }
        var that = this;
        this.pool.getConnection(function (err, connection) {            
            if (err) {
                log.error(err, "数据访问", "sql日志");
                console.log(err);
            } else {
                that._connection = connection;
                backFunction(connection);
            }
        });
    }
    public close() {
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
    query(sql: string, param: any[], success: Function, error: Function) {
        var log = new AppLogger();
        // mysql.createConnection(this.conSetting);
        var connt = this.execSql(function (conn) {
            var query = conn.query(sql, param, function (err, result) {
                if (err) {
                    error(err);
                    log.error("数据库错误:" + err, "db", "错误");
                    console.error("数据库错误:" + err);
                } else {
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
    queryAsync(sql: string, param: any[]) {
        var log = new AppLogger();
        var that = this;
        return new Promise(function (resolve, reject) {
            //var conn = mysql.createConnection(that.conSetting);
            that.execSql(function (conn) {
                var query = conn.query(sql, param, function (err, result) {
                    if (err) {
                        reject(err);
                        //log.error("数据库错误:" + err, "db", "错误");
                        console.error("数据库错误:" + err);
                    } else {
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
    //update(sql: string, param: any[] | object, success: Function, error: Function) {
    //    var log = new AppLogger();
    //    var conn = mysql.createConnection(this.conSetting);
    //    conn.connect();
    //    var query = conn.query(sql, param, function (err, result) {
    //        if (err) {
    //            error(err);
    //            log.error("数据库错误:" + err, "db", "错误");
    //        } else {
    //            success(result);
    //        }
    //    });
    //    //console.log(query.sql);
    //    log.info("sql语句:" + query.sql, "db", "sql日志");
    //    conn.end();
    //}
    //updateAsync(sql: string, param: any[] | object) {
    //    var log = new AppLogger();
    //    var that = this;
    //    return new Promise(function (resolve, reject) {
    //        var conn = mysql.createConnection(that.conSetting);
    //        conn.connect();
    //        var query = conn.query(sql, param, function (err, result) {
    //            if (err) {
    //                reject(err);
    //                log.error("数据库错误:" + err, "db", "错误");
    //            } else {
    //                resolve(result);
    //            }
    //        });
    //        log.info("sql语句:" + query.sql, "db", "sql日志");
    //        conn.end();
    //    });
    //}
}