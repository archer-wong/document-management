/**
 * Created by wangchao on 2016/9/28.
 */
var file = require("../models/file.js");
var formidable = require("formidable");
var path = require("path");
var fs = require("fs");
var sd = require("silly-datetime");

//首页
//注意next的用法,使用next的话最终就会在app.js中的404页面兜底
//注意程序的异步执行原理,
exports.showIndex = function(req,res,next){
    //错误的：传统思维，不是node的思维：
    //res.render("index",{
    //    "albums" : file.getAllAlbums()
    //});

    //这就是Node.js的编程思维，就是所有的东西，都是异步的
    //所以，内层函数，不是return回来东西，而是调用高层函数提供的
    //上面注释掉的方法中,如果在gile.js的方法中return回来,就不赶趟了,这里已经运行到下一步了
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
exports.doPost = function(req,res){
    var form = new formidable.IncomingForm();
    //注意这里的mormalize的用法,注意括号中的写法
    form.uploadDir = path.normalize(__dirname + "/../tempup/");

    form.parse(req, function(err, fields, files,next) {
        console.log(fields);
        console.log(files);

        if(err){
            next();
            return;
        }
        //判断文件尺寸
        var size = parseInt(files.tupian.size);
        if(size > 2000){
            res.send("文件尺寸过大");
            //删除图片
            fs.unlink(files.tupian.path);
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
                res.send("改名失败");
            }
            //res.send("成功");
            //上传成功后实现跳转到上传的文件夹
            res.redirect(wenjianjia);
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
exports.doDelete = function(req,res){
    var xpath = req.query['path'];  // 文件存储的路径
    var filepath = path.normalize(__dirname + "/../uploads/" + xpath);
    var wenjianjia = xpath.split("/")[0];
    //删除文件
    fs.unlink(filepath);
    res.redirect(wenjianjia);
}

//创建文件夹
exports.doCreateFile = function(req,res){
    var xpath = req.query['name'];  // 文件存储的路径
    var targetDir = path.normalize(__dirname + "/../uploads/" + xpath);

    file.getAllAlbums(function(err,allAlabums){
        if(err){
            next(); //交给下面适合他的中间件
            return;
        }

        console.log(xpath)
        console.log(allAlabums)
        console.log(allAlabums.indexOf(xpath))
        if(allAlabums.indexOf(xpath) >= 0){
            res.send("该文件已经存在");
            return;
        }
        //创建文件夹
        fs.mkdirSync(targetDir);
        res.redirect('/');
    })
}

//删除文件夹
exports.doDeleteFile = function(req,res){
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
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };
    //调用递归算法
    deleteFolderRecursive(targetDir)
    res.redirect('/');
}