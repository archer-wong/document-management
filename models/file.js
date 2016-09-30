/**
 * Created by wangchao on 2016/9/28.
 */
var fs = require("fs");
var formidable = require("formidable");
var sd = require("silly-datetime");
var path = require("path");

exports.getAllAlbums = function(callback){
    //__dirname 是指自己
    fs.readdir("./uploads",function(err,files){
        if(err){
            callback("没有找到上传文件夹",null);
            return;
        }
        var allAlbums = [];
        //注意迭代器的用法
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
}
//通过文件名得到所有图片
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

//上传文件
exports.doPostFiles = function(req,callback){
    var form = new formidable.IncomingForm();
    //注意这里的mormalize的用法,注意括号中的写法其中../退回了上一级目录
    //__dirname变量获取当前模块文件所在目录的完整绝对路径
    form.uploadDir = path.normalize(__dirname + "/../tempup/");

    form.parse(req, function(err, fields, files,next) {
        console.log(fields);
        console.log(files);

        if(err){
            callback("没有找到上传文件夹",null);
            return;
        }
        //判断文件尺寸
        var size = parseInt(files.tupian.size);
        if(size > 2000){
            //删除图片
            fs.unlink(files.tupian.path);
            console.log("文件尺寸过大");
            callback("文件尺寸过大",null);
            return;
        }

        //生成文件名字,这样做可以防止文件名字重复,并获取文件扩展名
        var ttt = sd.format(new Date(), 'YYYYMMDDHHmmss');
        var ran = parseInt(Math.random() * 89999 + 10000);
        var extname = path.extname(files.tupian.name);

        var wenjianjia = fields.wenjianjia;
        var oldpath = files.tupian.path ;
        var newpath = path.normalize(__dirname + "/../uploads/" + wenjianjia + "/" + ttt + ran + extname);

        fs.rename(oldpath,newpath,function(err){
            if(err){
                console.log("改名失败");
                callback("改名失败",null);
                return;

            }
            console.log("上传成功");
            //controller中需要跳转的页面需要知道所在文件夹的名字,所以将其传递给上一层
            callback(null,wenjianjia);
            return;
        });
    });
    return;
}

//下载文件
exports.doDownload = function(req,res){
    var xpath = req.query['path'];  // 文件存储的路径
    var filepath = path.normalize(__dirname + "/../uploads/" + xpath);

    // filename:设置下载时文件的文件名，可不填，则为原名称
    //res.download(filepath, filename);
    res.download(filepath);
}

//删除文件
exports.doDelete = function(req,res,callback){
    var xpath = req.query['path'];  // 文件存储的路径
    var filepath = path.normalize(__dirname + "/../uploads/" + xpath);
    var wenjianjia = xpath.split("/")[0];
    //删除文件
    fs.unlink(filepath,function(err){
        if(err){
            console.log("删除失败");
            callback("删除失败",null);
            return;
        }
        console.log("删除成功");
        //controller中需要跳转的页面需要知道所在文件夹的名字,所以将其传递给上一层
        callback(null,wenjianjia);
        return;
    });
}

//创建文件夹
exports.doCreateFile = function(req,res,callback){
    var xpath = req.query['name'];  // 文件存储的路径
    var targetDir = path.normalize(__dirname + "/../uploads/" + xpath);

    this.getAllAlbums(function(err,allAlabums){
        if(err){
            console.log("获取已有文件夹名称失败");
            callback("获取已有文件夹名称失败",null);
            return;
        }

        console.log(xpath)
        console.log(allAlabums)
        console.log(allAlabums.indexOf(xpath))
        if(allAlabums.indexOf(xpath) >= 0){
            console.log("该文件已经存在");
            callback("该文件已经存在",null);
            return;
        }
        //创建文件夹
        fs.mkdirSync(targetDir);
        console.log("创建成功");
        callback(null,"/");
        return;
    })
}

//删除文件夹
exports.doDeleteFile = function(req,res,callback){
    var xpath = req.query['albumName'];  // 文件存储的路径
    var targetDir = path.normalize(__dirname + "/../uploads/" + xpath);
    //递归算法删除文件夹及其子文件
    var deleteFolderRecursive = function(path) {
        var files = [];
        if( fs.existsSync(path) ) {
            files = fs.readdirSync(path)
            files.forEach(function(file,index){
                var curPath = path + "/" + file;
                if(fs.statSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                } else {
                    // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };
    //调用递归算法
    deleteFolderRecursive(targetDir);
    console.log("删除文件夹成功");
    callback("/");
    return;
}