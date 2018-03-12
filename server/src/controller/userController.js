"use strict";
let userService = require("../service/userService.js");
let commonService = require("../service/commonService.js");
let crypto = require('crypto');
exports.login = login;
exports.loginout = loginout;

function login(req, res){
    let md5 = crypto.createHash('md5');
    let apiReuslt = commonService.getApiTemplate();
    let name = req.body['userName'];
    let userPass = req.body['userPass'];
    userService.getUserByName(name)
    .then( (result)=>{
        let psw = md5.update(userPass).digest('hex');
        if( psw === result.password ){
            req.session.isLogin = true;
            req.session.userInfo = {
                id:result["user_id"],
                ename:result["ename"],
                cname:result["cname"],
            };
            apiReuslt.data = result;
            res.json(apiReuslt);
        }else{
            apiReuslt.code = commonService.getApiCode("ERROR");
            apiReuslt.message = "用户名或者密码错误";
            res.json(apiReuslt);
        }
    },(error)=>{
        apiReuslt.code = commonService.getApiCode("ERROR");
        apiReuslt.message = "用户名或者密码错误";
        res.json(apiReuslt);
    });
}

function loginout(req,res){
    req.session.destroy();
    let apiReuslt = commonService.getApiTemplate();
    res.json(apiReuslt);
}