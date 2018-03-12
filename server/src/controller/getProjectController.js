"use strict";
let getProjectListService = require("../service/getProjectListService.js");
let commonService = require("../service/commonService.js");
exports.getProjectListRecord=getProjectListRecord;
exports.openRrojectListForm=openRrojectListForm;
/*
获取专案列表记录
*/
function getProjectListRecord(req, res){
    let apiReuslt = commonService.getApiTemplate();
    let params = req.params;
    let pageNumber = req.body['pageNumber'];//页号
    let pageCount = req.body["pageCount"];//每页的记录个数
    let projectName = req.body["projectName"];//专案名
    pageNumber = parseInt(pageNumber);
    pageCount = parseInt(pageCount);
    getProjectListService.getProjectList({
       pageNumber:pageNumber,
       pageCount:pageCount,
       projectName:projectName
    })
    .then( (result)=>{ 
        apiReuslt.data = result; 
        res.json(apiReuslt);
    },(error)=>{
        apiReuslt.code = commonService.getApiCode("ERROR");
        apiReuslt.message = "获取专案列表信息失败";
        res.json(apiReuslt);
    });
}
/*
打开专案列表页面
*/
function openRrojectListForm(req, res){
    res.render('projectlist', {
        "query":{
          
           
        }
    });
}
