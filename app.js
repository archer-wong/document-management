/**
 * Created by wangchao on 2016/9/28.
 */
var express = require("express");
var app = express();
//引入路由router.js,因为在controller的package.json中已经写了入口文件所有不用写./controller/router.js
var router = require("./controller")
var logger = require('./log').logger;

//设置模板引擎
app.set("view engine","ejs");

//路由中间件
//静态页面
app.use(express.static("./public"));
app.use(express.static("./uploads"));
//首页
app.get("/",router.showIndex);
app.get("/:albumName",router.showAlbum);
app.get("/up",router.showUp);
app.post("/up", router.doPost);
app.get('/download', router.doDownload);
app.get('/delete', router.doDelete);
app.get('/createfile', router.doCreateFile);
app.get('/deleteFile', router.doDeleteFile);

//最后的中间件 404 ,这里要注意以下ejs文件中/js/xxx.js 和 js/xxx.js的区别
app.use(function(req,res){
    res.render("err")
});

app.listen(3000);