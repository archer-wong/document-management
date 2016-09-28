/**
 * Created by wangchao on 2016/9/28.
 */
var fs = require("fs");

exports.getAllAlbums = function(callback){
    //__dirname 是指自己
    fs.readdir("./uploads",function(err,files){
        if(err){
            callback("没有找到上传文件夹",null);
            return;
        }
        var allAlbums = [];
        (function iterator(i){
            if(i == files.length){
                console.log(allAlbums);
                callback(null,allAlbums);
                return;
            }
            fs.stat("./uploads/" + files[i],function(err,stats){
                if(err){
                    callback("找不到文件" + files[i],null);
                    return;
                }
                if(stats.isDirectory()){
                    allAlbums.push(files[i]);
                }
                iterator (i+1);
            });
        })(0);

    });
    //return ["小猫","小狗"];
}

exports.getAllImagesByAlbumName = function(albumName,callback){
    fs.readdir("./uploads/" +albumName,function(err,files){
        if(err){
            callback("没有找到上传文件夹",null);
            return;
        }
        var allImages = [];
        (function iterator(i){
            if(i == files.length){
                console.log(allImages);
                callback(null,allImages);
                return;
            }
            fs.stat("./uploads/" +albumName+ "/" + files[i],function(err,stats){
                if(err){
                    callback("找不到文件" + files[i],null);
                    return;
                }
                if(stats.isFile()){
                    allImages.push(files[i]);
                }
                iterator (i+1);
            });
        })(0);

    });
}