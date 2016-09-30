/**
 * Created by wangchao on 2016/9/30.
 */
//如果部署生产需要文件输出只要修改log.js中dateFileLog级别，然后设置exports.logger=dateFileLog即可
//调用的方法,先引入这个模块(var logger = require('./log').logger;),
// 然后使用下面语句,logger.debug("123");logger.info("123");logger.warn("123");logger.error("123");
var log4js = require('log4js');

log4js.configure({

    appenders: [
        //下面三个大括号,相当于三类,我们定义了三种不同的输出规则,当然我们可以定义更多种规则
        //下面的category就相当于每个规则的名字,需要注意的是
        {
            //规则1
            category: "console",
            type: 'console'
        },
        {
            //规则2
            category: 'dateFileLog',
            type: "file",
            filename: 'logs/log.log',
            pattern: "_yyyy-MM-dd",
            maxLogSize: 20480,
            backups: 3
        },//日期文件格式
        {
            //规则3
            "category":"log_file",
            "type": "console",
            "filename": "./logs/log_file/file.log",
            "maxLogSize": 104800,
            "backups": 100
        }
    ],
    replaceConsole: true,   //写上这条规则后,(console.log  console.error)的内容将会以log4js格式输出到控制台中
    levels:{
        //冒号后面一共8个级别分别为,ALL TRACE DEBUG INFO WARN ERROR FATAL OFF
        //只有大于等于日志配置级别的信息才能输出出来
        //设置规则1的级别
        console: 'DEBUG',
        //设置规则2的级别
        dateFileLog: 'DEBUG',
        //设置规则3的级别
        log_file: 'INFO'  // 我可以将这个设为INFO,使其与上面不同,这样只有大于INFO的时候才会被输出
    }
});



var consoleLog = log4js.getLogger('console');
var dateFileLog = log4js.getLogger('dateFileLog');
var log_file = log4js.getLogger('log_file');

//选中其中一种规则将其暴露出去
exports.logger = consoleLog;  //启用规则1
//exports.logger = dateFileLog;  //启用规则2
//exports.logger = log_file;   //启用规则3


exports.use = function(app) {
    //调整日志输出的格式,自动调整日志输出级别
    app.use(log4js.connectLogger(consoleLog, {level:'auto', format:':method :url'}));
}