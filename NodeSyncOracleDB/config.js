"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TableSetting {
}
exports.TableSetting = TableSetting;
class MySqlSetting {
}
exports.MySqlSetting = MySqlSetting;
var syncSetting = {
    tables: [
        {
            name: "chg_economy_yybdcxx" //不动产
        },
        {
            name: "chg_economy_yygjjxx" //公积金
        },
        {
            name: "chg_economy_yyrsj_gryb" //个人医保
        },
        {
            name: "chg_economy_yyrsj_grsy" //个人失业
        },
        {
            name: "chg_economy_yyrsj_grgs" //个人工伤
        }
    ],
    redis: {
        host: "192.168.0.118",
        port: "6379"
    },
    DBchannel: "mcSocietyLog",
    interval: 2500,
    orgMySql: {
        host: "120.79.229.5",
        port: "13307",
        user: "mcadmin",
        password: "mcroot123",
        //host: "192.168.0.118",
        //port: "3306",
        //user: "mcadmin",
        //password: "mcroot123",
        database: "mc_collate"
    },
    mcSaveMySql: {
        host: "120.79.229.5",
        port: "13307",
        user: "mcadmin",
        password: "mcroot123",
        database: "mc_society_save"
    },
    orgOrcales: {
        user: 'CDDATA',
        password: '123456',
        connectString: '192.168.0.112:1521/CSDATA' //连接地址
    },
    orgOrcale: {
        user: 'xj_data',
        password: 'mcxx1234',
        connectString: '192.168.0.112:1521/XJ_DATA' //连接地址
    },
    orgOrcaleCS: {
        user: 'sz_data',
        password: 'mcxx1234',
        connectString: '192.168.0.112:1521/SZ_DATA' //连接地址
    },
    //应用日志设置
    logSetting: {
        //开启日志级别
        level: {
            info: true,
            debug: true,
            warning: true,
            error: true
        },
    },
};
exports.default = syncSetting;
//# sourceMappingURL=config.js.map