"use strict";
let reviewService = require("../service/reviewService.js");
let commonService = require("../service/commonService.js");

exports.formConfig = formConfig;
/**
 * 获取指定类型的表单配置信息
 * @param {*} router 
 */
function formConfig(req, res){
    let apiReuslt = commonService.getApiTemplate();
    let formTypeID = req.params["formTypeID"];
    let requestFlag = req.params["requestFlag"];
    formTypeID = parseInt(formTypeID);
    requestFlag = parseInt(requestFlag);
    reviewService.getFormConfig({
        "formTypeID":formTypeID,
        "requestFlag":requestFlag
    })
    .then( (result)=>{
        apiReuslt.data = result;
        res.json(apiReuslt);
    },(error)=>{
        apiReuslt.code = commonService.getApiCode("ERROR");
        apiReuslt.message = "获取表单配置失败";
        apiReuslt.error = error;
        res.json(apiReuslt);
    });
}