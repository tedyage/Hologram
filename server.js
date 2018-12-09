'use strict'
var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');

var root = path.resolve(process.argv[2] || '.');

var server = http.createServer(function(request,response){
    //获得URL的path
    var pathname = url.parse(request.url).pathname;
    //获得对应的本地文件路径
    var filepath = path.join(root,pathname);
    //获取文件状态
    fs.stat(filepath,function(err,stats){
        if(!err&&stats.isFile()){
            //没有出错并且文件存在；
            console.log('200',request.url);
            //发送200响应
            response.writeHead(200,{'Content-Type':'text/html'});
            //将文件流导向response
            fs.createReadStream(filepath).pipe(response);
        } else{
            //出错了或者文件不存在
            console.log('404'+request.url);
            //发送404响应
            response.writeHead(404);
            response.end('404 Not Found');
        }
    });
});

server.listen(3000);
console.log("server created");
