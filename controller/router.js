/**
 * Created by wangchao on 2016/9/28.
 */
var file = require("../models/file.js");
var path = require("path");
var fs = require("fs");


//首页
//注意next的用法,使用next的话最终就会在app.js中的404页面兜底
//注意程序的异步执行原理,
exports.showIndex = function(req,res,next){
    //回调函数。把数据当做回调函数的参数来使用。
    file.getAllAlbums(function(err,allAlabums){
        if(err){
            next(); //交给下面适合他的中间件
            return;
        }
        res.render("index",{
            "albums": allAlabums
        })
    })
}

//相册页
//注意这里是res.send不是req
exports.showAlbum = function(req,res,next){
    //遍历相册中的所有图片
    var albumName = req.params.albumName;
    //具体业务交给model
    file.getAllImagesByAlbumName(albumName,function(err,imagesArray){
        if(err){
            next(); //交给下面适合他的中间件
            return;
        }
        res.render("album",{
            "albumname" :albumName,
            "images":imagesArray
        });
    });
}

//显示上传
exports.showUp = function(req,res){
    file.getAllAlbums(function(err,albums){
        res.render("up",{
            "albums": albums
        });
    });
}

//上传表单
exports.doPost = function(req,res,next){
    file.doPostFiles(req,function(err,result){
        if(err){
            next(); //交给下面适合他的中间件
            return;
        }
        res.redirect(result);
    })
}

//下载文件
exports.doDownload = function(req,res){
    file.doDownload(req,res);
}

//删除文件
exports.doDelete = function(req,res){
    file.doDelete(req,res,function(err,result){
        if(err){
            next(); //交给下面适合他的中间件
            return;
        }
        res.redirect(result);
    })
}

//创建文件夹
exports.doCreateFile = function(req,res){
    file.doCreateFile(req,res,function(err,result){
        if(err){
            next(); //交给下面适合他的中间件
            return;
        }
        res.redirect(result);
    })
}

//删除文件夹
exports.doDeleteFile = function(req,res){
    file.doDeleteFile(req,res,function(result){
        res.redirect(result);
    })
}