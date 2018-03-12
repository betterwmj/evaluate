"use strict";
let expressSession = require('express-session');
const commonService = require('../service/commonService.js');
/**忽略权限检查的url */
let ignoreUrl = ["/view/openLogin","/api/login"];
/**
 * express app
 * @param {*} app 
 */
function hander(app){
    //session配置
    let session = expressSession({
        name: 'session',
        secret: "MjAxNzAzMjlBRERTRVNTSU9O",
        cookie:{
            secure: false,
            maxAge:24 * 60 * 60 * 1000 * 7 // 7天
        },
        resave:true,
        saveUninitialized:true
    });
    app.use(session);
    app.use(["/api/*","/view/*"],checkAuth);
}

function checkAuth(req, res, next){
    let seesion = req.session;
    let isIgnoreUrl = ignoreUrl.find( (item)=>{
        return item === req.originalUrl;
    });
    if( isIgnoreUrl !== undefined ){
        next();
        return;
    }
    if( seesion.isLogin === true ){
        next();
        return;
    }
    //未登录的处理
    let originalUrl = req.originalUrl;
    let matchResult = null;
    matchResult = originalUrl.match(/\/view\//);
    if( matchResult !== null && matchResult.length > 0 ){
        //请求页面则跳转至登录页面
        res.redirect('/view/openLogin');
        return;
    }
    matchResult = originalUrl.match(/\/api\//);
    if( matchResult !== null && matchResult.length > 0 ){
        //请求api则返回api异常
        let apiResult = commonService.getApiTemplate();
        apiResult.code = commonService.getApiCode("NOT_LOGIN");
        apiResult.message = "请先登录";
        res.json(apiResult);
    }
}
module.exports = hander;