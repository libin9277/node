import express = require('express');
import { SocietyApi, PostOption } from "../util/httpUtil";
import MySqlHelper from '../util/mySqlhelp'
import AppLogger from "../util/AppLogger";
import oracledb from '../util/oracledbHelper';
import dtUtil = require('../util/DateTimeUtil');
import config from '../config';
import fs = require('fs');
import path = require('path');
import schedule = require('node-schedule');
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
async function saynsData() {

    var Helplog = new MySqlHelper();
    Helplog.conSetting = config.orgMySql;

    var odb = new oracledb();
    var conn = await odb.connect(config.orgOrcale);

    var dt = new dtUtil.DateTimeUtil();
    console.log('启动时间:' + dt.format(new Date(), 'yyyy-MM-dd hh:mm:ss'));
    var date = dt.format(new Date(), 'yyyy-MM-dd');
    var sql = '';
    var rows;
    for (var i = 0; i < config.tables.length; i++) {
        sql = "select * from " + config.tables[i].name + " where DATE_FORMAT(create_time,'%Y-%m-%d') = ?";
        rows = await Helplog.queryAsync(sql, [date]);
        if ((<any[]>rows).length > 0) {
            for (var j = 0; j < (<any[]>rows).length; j++) {
                var setList = [];
                var valueList = [];
                var statementList = [];
                for (var key in rows[j]) {
                    setList.push(`${key}`);
                    valueList.push(rows[j][key]);
                    statementList.push('?');
                }
                var sql = "INSERT INTO " + config.tables[i].name + ` ( ${setList.join(",")}) values (${statementList.join(",")})`;
                var data = await odb.queryAsync(conn, sql, valueList);
            }
        } else {
            console.log("暂无数据")
        }
    }

    //var odb = new oracledb();
    //var conn = await odb.connect(config.orgOrcale);
    //var sql = "select * from JZ_WTHDDX";
    //var param = [];
    //var rnt = await odb.queryAsync(conn, sql, param);

    //console.log(rnt);
}
//demo();
async function demo() {

    var odb = new oracledb();
    var conn = await odb.connect(config.orgOrcale);
    //50-市州已反馈核对结果
    var sql = "select * from JZ_WTHDDX";
    var data = await odb.queryAsync(conn, sql, []);
    if ((<any[]>data).length > 0) {
        console.log(data[0].BBEX0001)
    }
    
    odb.close(conn);
}

var scheduleCronstyle = () => {
    //每分钟的第30秒定时执行一次:
    schedule.scheduleJob('* * * * * *', () => {
        console.log('scheduleCronstyle:' + new Date());
        //testSync();
    });
}
scheduleCronstyle();

var commonArea = ["430922"]; //设置地区

//testSync();
async function testSync() {
    let that = this;
    try {
            var Helplog = new MySqlHelper();
            Helplog.conSetting = config.orgMySql;

            var dt = new dtUtil.DateTimeUtil();
            var date = dt.format(new Date(), 'yyyy-MM-dd');
            console.log(date);
            var log = new AppLogger();
        for (var n = 0; n < commonArea.length; n++) {
            //SELECT b.id,a.idCard,c.Serial FROM Col_RequireFamily a INNER JOIN Col_Require b ON a.requireID = b.id INNER JOIN Col_Batch c ON b.batchID = c.id
            //WHERE DATE_FORMAT(c.createTime, '%Y-%m-%d') = '2020-12-25' AND b.areaCode LIKE '430921%'
            var sql = "SELECT cr.id,cr.idCard,cb.Serial FROM Col_Require cr LEFT JOIN Col_Batch cb ON cr.batchID = cb.id WHERE DATE_FORMAT(cb.createTime, '%Y-%m-%d') = ? and cr.areaCode like ?";
            var rows = await Helplog.queryAsync(sql, [date, commonArea[n].substring(0,6)+"%"]);
            console.log(rows);
            var odb;
            var conn;
            if ((<any[]>rows).length > 0) {
                for (var i = 0; i < (<any[]>rows).length; i++) {
                    //同步中台的委托核对结果信息表
                    await addJZWTHDJG(rows[i].Serial, rows[i].idCard, rows[i].id);

                    odb = new oracledb();
                    conn = await odb.connect(config.orgOrcale);
                    //更新中台委托核对对象信息 50-市州已反馈核对结果
                    var sql = "update JZ_WTHDDX set BBEX0003='50' where BBEX0001='" + rows[i].Serial + "' and BBEE0005='" + rows[i].idCard + "'";
                    var data = await odb.sqlAsync(conn, sql, []);
                }
            } else {
                console.log("该地区暂无对象数据");
            }
        }
    } catch (err) {
        console.log(err);
        log.error("更新失败" + JSON.stringify(err), "核对中台更新错误", "错误");
    }
}

//更新中台委托核对对象信息表（JZ_WTHDDX）的核对状态
async function updateZTCheckObj(serial, IdCard) {
    try {
        
        
    } catch (err) {
        console.log(err);
    }

}
//添加委托核对结果信息表
async function addJZWTHDJG(Serial, idCard, id) {
    try {
        console.log("开始执行");
        var log = new AppLogger();
        var odb = new oracledb();
        var conn = await odb.connect(config.orgOrcale);
        //50-市州已反馈核对结果
        var sql = "select * from JZ_WTHDDX  where BBEX0001='" + Serial + "' and BBEE0005='" + idCard + "'";
        var data = await odb.queryAsync(conn, sql, []);
        console.log(data);
        if ((<any[]>data).length == 0) {
            console.log("没有对象信息");
            return;
        }
        var Helplog = new MySqlHelper();
        Helplog.conSetting = config.orgMySql;
        var sql = "select path from col_Report where RequireID = ?";
        var rows = await Helplog.queryAsync(sql, [id]);
        if ((<any[]>rows).length == 0) {
            console.log("没有核对报告的pdf");
            return;
        }
        //上传文件到中台 路径需要自己配置
        var filename = "F:\\code\\QxCollating\\Server\\" + rows[0].path;
        filename = path.resolve(__dirname, '/tmp/file/');
        console.log(filename);
        var filePdf = '';//核对报告附件
        var api = new SocietyApi();
        var opt = new PostOption("http://10.74.0.80:9005/dm/fileshare/api/2.0/upload", "", {
            file: fs.createReadStream(filename),
            username: "DC_API_JZ",
            password: "h02vuyBJ"
        })
        var rnt = await api.postAsync(opt);
        console.log(rnt);
        if (rnt.code == 0 && rnt.success) {
            filePdf = rnt.data.fileName;
        }
        var odb = new oracledb();
        var conn = await odb.connect(config.orgOrcale);
        //BBEX0001批次编号BBEE0001申请唯一号
        var sql = "INSERT INTO JZ_WTHDJG (BBEX0001, BBEE0001, BBEE0002, BXEX0013, BBEX0014, BBEX0026, BBEX0027, BBEX0015, BBEX0016, BBEX0012, BBEX0003, BBEX0004,BBEX0005) \
                    VALUES('"+ data[0].BBEX0001 + "', '" + data[0].BBEE0001 + "', '" + data[0].BBEE0002 + "'," + new Date() + ", '01', '" + data[0].BBEX0026 + "', '" + filePdf + "', '', '','', '60', '核对数据推送', '')";
        var data = await odb.sqlAsync(conn, sql, []);
    } catch (err) {
        console.log(err);
        console.log("添加委托核对结果信息表异常");
        log.error("添加委托核对结果信息表异常" + JSON.stringify(err), "核对中台", "错误");
    }
   
}