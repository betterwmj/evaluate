let mysqlService = require("./mysqlService.js");
let commonService = require("./commonService.js");
let reviewServiceUtil = require("../serviceUtil/reviewServiceUtil.js");
exports.getFormConfig = getFormConfig;
exports.getReviweRecord = getReviweRecord;
exports.setFilePath = setFilePath;
exports.addProjectReviewRecord = addProjectReviewRecord;
exports.updateProjectReviewApply = updateProjectReviewApply;
exports.addProjectReviewReplyRecord = addProjectReviewReplyRecord;
exports.updateProjectReviewReply = updateProjectReviewReply;
const getFormConfigSQL = 
        `select 
            t_review_group_type.group_type_name as NAME,
            t_review_item_group.item_group_name as GROUP_NAME,
            t_review_item_group.review_item_group_id as GROUP_ID,
            t_review_item_group.sort_no as GROUP_SORT_NO,
            t_review_item_group.request_flag as REQUEST_FLAG,
            t_review_item_group.item_group_type_id as GROUP_TYPE_ID,
            t_review_item.review_item_id as ITEM_ID,
            t_review_item.review_item_name as ITEM_NAME,
            t_review_item.sort_no as ITEM_SORT_NO,
            t_review_item.input_type as ITEM_TYPE ,
            t_review_item.value_type as ITEM_VALUE_TYPE
            from t_review_group_type  
        LEFT JOIN (t_review_item_group,t_review_item)
            ON (
                t_review_group_type.review_group_type = t_review_item_group.item_group_type_id 
                and 
                t_review_item_group.review_item_group_id = t_review_item.review_item_group_id
            )
        where t_review_group_type.review_group_type = ? and t_review_item_group.request_flag = ?;`;

const UPDATE_STATUS = 'update t_rfq_project_review set t_rfq_project_review.status=?,t_rfq_project_review.draft_flag = ?  where rfq_project_id = ? and rfq_project_group_id = ? ;';


/**
 * 视觉评审表单配置
 */  
function getFormConfig(params){
    return new Promise((resolve,reject)=>{   
        mysqlService.getConnection()
        .then( (connection)=>{
            connection.query({
                sql:getFormConfigSQL,
                values:[params['formTypeID'],params['requestFlag']] 
            }, function (error, results, fields) {
                if (error) {
                    reject( error );
                }else{
                    if( results.length === 0 ){
                        reject( "未查询到的评审类型" );
                        return;
                    }
                    resolve( reviewServiceUtil.formatFormConfigData(results) );
                }
                connection.release();
            });
        },(error)=>{
            reject(error);
            connection.release();
        });
    });
}
/**
 * 获取评审记录
 * @param {{
        rfq_project_id:"",
        rfq_project_group_id:"",
        request_flag:0
   }} params
 */
function getReviweRecord(params){
    let connection = null;
    let mainRecord = null;
    let p = new Promise((resolve,reject)=>{
        //1.先判断是否有记录
        mysqlService.getConnection()
        .then( (con)=>{
            connection = con;
            return findRecordFromProjectReview(connection,params);
        })
        .then( (mRecord)=>{
            mainRecord = mRecord;
            return findRecordFromProjectReviewDetail(connection,mainRecord,params["request_flag"]);
        })
        .then( (detail)=>{
            resolve({
                "mainRecord":mainRecord,
                "detail":detail
            });
            connection.release();
        })
        .catch( (error)=>{
            reject(error);
            connection.release();
        });
    });
    return p;
}

/**
 * 添加一条评审申请记录
 * @param {*} review 
 * @param {*} reviewGroup 
 */
function addProjectReviewRecord(review,reviewGroup){
    let connection = null;
    return new Promise((resolve,reject)=>{
        mysqlService.beginTransaction()
        .then( (con)=>{
            connection = con;
            return reviewServiceUtil.addProjectReview(review,connection);
        })
        .then( ()=>{
            reviewServiceUtil.fillReviewID(review["project_review_id"],reviewGroup);
            return reviewServiceUtil.addProjectReviewItems(review,reviewGroup,connection);
        })
        .then( ()=>{
            return mysqlService.commitTransaction(connection);
        })
        .then( ()=>{
            resolve();
        })
        .catch( (error)=>{
            connection.rollback(function() {
                reject(error);
            });
        });
    });
}

function updateProjectReviewApply(review,detail){
    let connection = null;
    return new Promise((resolve,reject)=>{
        mysqlService.beginTransaction()
        .then( (con)=>{
            connection = con;
            return reviewServiceUtil.updateProjectReview(review,connection);
        })
        .then( ()=>{
            return reviewServiceUtil.updateProjectReviewItem(detail,connection);
        })
        .then( ()=>{
            return mysqlService.commitTransaction(connection);
        })
        .then( ()=>{
            resolve();
        })
        .catch( (error)=>{
            connection.rollback(function() {
                reject(error);
            });
        });
        
    });
}

function addProjectReviewReplyRecord(review,reviewGroup){
    let connection = null;
    return new Promise((resolve,reject)=>{
        mysqlService.beginTransaction()
        .then( (con)=>{
            connection = con;
            return reviewServiceUtil.updateProjectReview(review,connection);
        })
        .then( (record)=>{
            reviewServiceUtil.fillReviewID(record["project_review_id"],reviewGroup);
            return reviewServiceUtil.addProjectReviewItems(review,reviewGroup,connection);
        })
        .then( ()=>{
            if( review.status === 1 ){
                //确认提交回复,更新需要回填的字段
                return specialFieldUpdate(review,reviewGroup,connection);
            }else{
                return new Promise((resolve,reject)=>{
                    resolve();
                });
            }
        })
        .then( ()=>{
            return mysqlService.commitTransaction(connection);
        })
        .then( ()=>{
            resolve();
        })
        .catch( (error)=>{
            connection.rollback(function() {
                reject(error);
            });
        });
    });
}

function updateProjectReviewReply(review,reviewGroup){
    let connection = null;
    return new Promise((resolve,reject)=>{
        mysqlService.beginTransaction()
        .then( (con)=>{
            connection = con;
            return reviewServiceUtil.updateProjectReview(review,connection);
        })
        .then( (record)=>{
            reviewServiceUtil.fillReviewID(record["project_review_id"],reviewGroup);
            return reviewServiceUtil.updateProjectReviewItem(reviewGroup,connection);
        })
        .then( ()=>{
            if( review.status === 1 ){
                //确认提交回复,更新需要回填的字段
                return specialFieldUpdate(review,reviewGroup,connection);
            }else{
                return new Promise((resolve,reject)=>{
                    resolve();
                });
            }
        })
        .then( ()=>{
            return mysqlService.commitTransaction(connection);
        })
        .then( ()=>{
            resolve();
        })
        .catch( (error)=>{
            connection.rollback(function() {
                reject(error);
            });
        });
    });
}

function setFilePath(detail,filesResult){
    let fileIndex = 0;
    detail.forEach( (group)=>{
        group.item.forEach( (item)=>{
            if( item["input_type"] === "file"){
                if( filesResult && filesResult[fileIndex]){
                    item["review_value"] = filesResult[fileIndex];
                    ++fileIndex;
                }
            }
        });
    });
}

/**
 *  提交评审回复时,更新RfqProjectGroup中需要额外更新的字段
 */
function specialFieldUpdate(review,reviewGroup,connection){
    let fields = null;
    return new Promise((resolve,reject)=>{
        reviewServiceUtil.getSpecialField(connection)
        .then( (rs)=>{
            fields = rs;
            return reviewServiceUtil.querySpecialFieldValue(review,fields,connection);
        })
        .then( (newData)=>{
            return reviewServiceUtil.updateSpecialFieldValue(review,fields,newData,connection);
        })
        .then( ()=>{
            return reviewServiceUtil.updateProjectReportLink(connection);
        })
        .then( ()=>{
            resolve();
        })
        .catch( (error)=>{
            reject(error);
        });
    });
}

/**
 * 根据rfq_project_id,rfq_project_group_id,查找评审记录
 * @param {*} connection 
 * @param {*} params 
 */
function findRecordFromProjectReview(connection,params){
    return new Promise((resolve,reject)=>{
        connection.query({
            sql:"select * from t_rfq_project_review where rfq_project_id = ? and rfq_project_group_id = ? ;",
            values:[
                params["rfq_project_id"],
                params["rfq_project_group_id"]
            ]
        },(error, results, fields)=>{
            if( error ){
                reject(error);
            }
            else
            {
                if( results && results[0] ){
                    resolve(results[0]);
                }else{
                    resolve(null);
                }
           }
        });
    });
}

function findRecordFromProjectReviewDetail(connection,mainRecord,request_flag){
    return new Promise((resolve,reject)=>{
        if( mainRecord === null ){
            resolve(null);
            return;
        }
        connection.query({
            sql:"select * from t_rfq_project_review_detail where project_review_id = ? and request_flag = ?",
            values:[mainRecord["project_review_id"],request_flag]
        },(error, results, fields)=>{
           if( error ){
               reject(error);
           }
           else{
               formDataByType(results);
               resolve(results);
           }
        });
    });

    function formDataByType(results){
        results.forEach( (item)=>{
            switch (item["input_type"]){
                case "checkbox":{
                    if( item["review_value"] === "0"){
                        item["review_value"] = false;
                    }else if( item["review_value"] === "1" ){
                        item["review_value"] = true;
                    }
                    break;
                }
            }
        });
    }
}