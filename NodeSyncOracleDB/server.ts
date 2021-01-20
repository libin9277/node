import express = require("express");
import dtUtil = require('./util/DateTimeUtil');
import handlerCheck = require('./server/handlerCheckData');
var app = express();

//跨域支持,必须放在其他处理前面
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    //Access-Control-Allow-Headers ,可根据浏览器的F12查看,把对应的粘贴在这里就行
    res.header('Access-Control-Allow-Headers', 'Content-Type,access_token,sign');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Content-Type', 'application/json;charset=utf-8');
    next();
});

app.use('/demo', handlerCheck);
//处理未知错误
process.on('uncaughtException', function (err) {
    //打印出错误
    console.log(err);
    //打印出错误的调用栈方便调试
    console.log(err.stack);
})

//启动服务
var server = app.listen(9999, function () {
    var dt = new dtUtil.DateTimeUtil();
    console.log('启动时间:' + dt.format(new Date(), 'yyyy-MM-dd hh:mm:ss'));
    var host = server.address().address
    var port = server.address().port
    console.log("访问地址为 http://%s:%s", host, port);
})
