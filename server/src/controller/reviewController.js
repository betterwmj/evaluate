"use strict";

exports.createReviewApply = createReviewApply;
exports.updateReviewApply = updateReviewApply;
exports.createReviewReply = createReviewReply;
exports.updateReviewReply = updateReviewReply;
exports.openReviewForm = openReviewForm;
exports.getReviweRecord = getReviweRecord;
exports.openReplyForm = openReplyForm;
exports.openResultForm = openResultForm;
exports.openLoginForm = openLoginForm;

let reviewService = require("../service/reviewService.js");
let commonService = require("../service/commonService.js");
let projectGroupService = require("../service/projectGroupService.js");

/**
 * 创建一个新的评审申请
 * @param {*} req 
 * @param {*} res 
 */
function createReviewApply(req, res){
    let apiReuslt = commonService.getApiTemplate();
    let files = req.files;
    let detail = JSON.parse( req.body.data );
    let rfq_project_id = req.body['rfq_project_id'];
    let rfq_project_group_id = req.body['rfq_project_group_id'];
    let isDraft = req.body['isDraft'];
    let draft_flag = (isDraft === 'true' ? 0:1);
    let create_user_id = req.session.userInfo.id;
    let main = {
        "rfq_project_id":rfq_project_id,
        "rfq_project_group_id":rfq_project_group_id,
        "create_user_id":create_user_id,
        "draft_flag":draft_flag,
        "status":0 //默认回复状态是草稿
    };
    commonService.copyUploadFile(files)
    .then( (filesResult)=>{ 
        reviewService.setFilePath(detail,filesResult);
        return reviewService.addProjectReviewRecord(main,detail);
    })
    .then( ()=>{
        res.json(apiReuslt);
    }).catch((error)=>{
        apiReuslt.code = commonService.getApiCode("ERROR");
        apiReuslt.message = "表单数据提交失败";
        apiReuslt.error = error;
        res.json(apiReuslt);
    });
}
/**
 * 更新评审申请
 * @param {*} req 
 * @param {*} res 
 */
function updateReviewApply(req, res){
    let apiReuslt = commonService.getApiTemplate();
    let files = req.files;
    let detail = JSON.parse( req.body.data );
    let rfq_project_id = req.body['rfq_project_id'];
    let rfq_project_group_id = req.body['rfq_project_group_id'];
    let isDraft = req.body['isDraft'];
    let draft_flag = (isDraft === 'true' ? 0:1);
    let update_user_id = req.session.userInfo.id;
    let review = {
        "rfq_project_id":rfq_project_id,
        "rfq_project_group_id":rfq_project_group_id,
        "draft_flag":draft_flag,
        "status":0, //默认回复状态是草稿
        "update_user_id":update_user_id
    };
    commonService.copyUploadFile(files)
    .then( (filesResult)=>{ 
        reviewService.setFilePath(detail,filesResult);
        return reviewService.updateProjectReviewApply(review,detail);
    })
    .then( ()=>{
        res.json(apiReuslt);
    }).catch((error)=>{
        apiReuslt.code = commonService.getApiCode("ERROR");
        apiReuslt.message = "表单数据提交失败";
        apiReuslt.error = error;
        res.json(apiReuslt);
    });
}

/**
 * 创建评审回复
 * @param {*} req 
 * @param {*} res 
 */
function createReviewReply(req, res){
    let apiReuslt = commonService.getApiTemplate();
    let files = req.files;
    let detail = JSON.parse( req.body.data );
    let rfq_project_id = req.body['rfq_project_id'];
    let rfq_project_group_id = req.body['rfq_project_group_id'];
    let isStatus = req.body['isStatus'];
    let status = (isStatus === 'true' ? 0:1);
    let update_user_id = req.session.userInfo.id;
    let main = {
        "rfq_project_id":rfq_project_id,
        "rfq_project_group_id":rfq_project_group_id,
        "update_user_id":update_user_id,
        "status":status,
        "draft_flag":1, //能回复的评审申请一定是已经提交过的
    };
    commonService.copyUploadFile(files)
    .then( (filesResult)=>{ 
        reviewService.setFilePath(detail,filesResult);
        return reviewService.addProjectReviewReplyRecord(main,detail);
    })
    .then( ()=>{
        res.json(apiReuslt);
    }).catch((error)=>{
        apiReuslt.code = commonService.getApiCode("ERROR");
        apiReuslt.message = "表单数据提交失败";
        apiReuslt.error = error;
        res.json(apiReuslt);
    });
}

/**
 * 更新评审回复
 * @param {*} req 
 * @param {*} res 
 */
function updateReviewReply(req, res){
    let apiReuslt = commonService.getApiTemplate();
    let files = req.files;
    let detail = JSON.parse( req.body.data );
    let rfq_project_id = req.body['rfq_project_id'];
    let rfq_project_group_id = req.body['rfq_project_group_id'];
    let isStatus = req.body['isStatus'];
    let status = (isStatus === 'true' ? 0:1);
    let update_user_id = req.session.userInfo.id;
    let main = {
        "rfq_project_id":rfq_project_id,
        "rfq_project_group_id":rfq_project_group_id,
        "update_user_id":update_user_id,
        "status":status,
        "draft_flag":1, //能回复的评审申请一定是已经提交过的
    };
    commonService.copyUploadFile(files)
    .then( (filesResult)=>{ 
        reviewService.setFilePath(detail,filesResult);
        return reviewService.updateProjectReviewReply(main,detail);
    })
    .then( ()=>{
        res.json(apiReuslt);
    }).catch((error)=>{
        apiReuslt.code = commonService.getApiCode("ERROR");
        apiReuslt.message = "表单数据提交失败";
        apiReuslt.error = error;
        res.json(apiReuslt);
    });
}

/**
 * 打开评审页面
 * @param {*} req 
 * @param {*} res 
 */
function openReviewForm(req, res){
    //let query = req.query; 
    let query = req.params; 
    let rfq_project_id = query["rfqProjectId"];
    let rfq_project_group_id = query["rfqProjectGroupId"];
    let request_flag = query["requestFlag"];
    //let rfq_activity_id = query["rfq_activity_id"];
    projectGroupService.getProjectGroup({
        "rfq_project_id":rfq_project_id,
        "rfq_project_group_id":rfq_project_group_id
    })
    .then((results)=>{
        if( results.length === 0 ){
            res.render('error', {
                "query":{
                    "errorMsg":"无效的rfq_project_id,rfq_project_group_id"
                }
            });
        }else{
            res.render('review', {
                "query":{
                    "rfq_project_id":rfq_project_id,
                    "rfq_project_group_id":rfq_project_group_id,
                    "request_flag":request_flag
                }
            });
        }
    },(error)=>{
        res.render('error', {
            "query":{
                "errorMsg":error
            }
        });
    });
    
}
/**
 * 获取视觉评审记录
 */
function getReviweRecord(req, res){
    let apiReuslt = commonService.getApiTemplate();
    let params = req.params;
    let project_review_id = params['project_review_id'];
    let rfq_project_id = params["rfq_project_id"];
    let rfq_project_group_id = params["rfq_project_group_id"];
    let request_flag = params["request_flag"];
    request_flag = parseInt(request_flag);
    reviewService.getReviweRecord({
        rfq_project_id:rfq_project_id,
        rfq_project_group_id:rfq_project_group_id,
        request_flag:request_flag,
        project_review_id:project_review_id
    })
    .then( (result)=>{ 
        apiReuslt.data = result; 
        res.json(apiReuslt);
    },(error)=>{
        apiReuslt.code = commonService.getApiCode("ERROR");
        apiReuslt.message = "获取视觉评审信息失败";
        res.json(apiReuslt);
    });
}


/**打开评审回复页面 */
function openReplyForm(req, res){
    let query = req.params; 
    let rfq_project_id = query["rfqProjectId"];
    let rfq_project_group_id = query["rfqProjectGroupId"];
    let request_flag = query["requestFlag"];
    projectGroupService.getProjectGroup({
        "rfq_project_id":rfq_project_id,
        "rfq_project_group_id":rfq_project_group_id
    })
    .then((results)=>{
        if( results.length === 0 ){
            res.render('error', {
                "query":{
                    "errorMsg":"无效的rfq_project_id,rfq_project_group_id"
                }
            });
        }else{
            res.render('reply', {
                "query":{
                    "rfq_project_id":rfq_project_id,
                    "rfq_project_group_id":rfq_project_group_id,
                    "request_flag":request_flag
                }
            });
        }
    },(error)=>{
        res.render('error', {
            "query":{
                "errorMsg":error
            }
        });
    });
}
/*
打开评估报告页面
*/
function openResultForm(req, res){
    let query = req.params; 
    let rfq_project_id = query["rfqProjectId"];
    let rfq_project_group_id = query["rfqProjectGroupId"];
     projectGroupService.getProjectGroup({
        "rfq_project_id":rfq_project_id,
        "rfq_project_group_id":rfq_project_group_id
    })
    .then((results)=>{
        if( results.length === 0 ){
            res.render('error', {
                "query":{
                    "errorMsg":"无效的rfq_project_id,rfq_project_group_id"
                }
            });
     }else{
        res.render('result', {
         "query":{
                "rfq_project_id":rfq_project_id,
                "rfq_project_group_id":rfq_project_group_id,
            }
        });
     }
    },(error)=>{
        res.render('error', {
            "query":{
                "errorMsg":error
            }
        });
    });
  
}
 

/*
打开登录页面
*/
function openLoginForm(req, res){ 
    res.render('login', {
        "query":{
          
           
        }
    });
}