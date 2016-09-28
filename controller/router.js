/**
 * Created by wangchao on 2016/9/28.
 */
var file = require("../models/file.js");
//首页
exports.showIndex = function(req,res,next){

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