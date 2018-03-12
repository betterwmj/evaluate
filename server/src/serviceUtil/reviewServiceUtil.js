let commonService = require("../service/commonService.js");

exports.addProjectReview = addProjectReview;
exports.addProjectReviewItems = addProjectReviewItems;
exports.updateProjectReview = updateProjectReview;
exports.updateProjectReviewItem = updateProjectReviewItem
exports.fillReviewID = fillReviewID;
exports.getSpecialField = getSpecialField;
exports.querySpecialFieldValue = querySpecialFieldValue;
exports.updateSpecialFieldValue = updateSpecialFieldValue;
exports.updateProjectReportLink = updateProjectReportLink;
exports.formatFormConfigData = formatFormConfigData;

const reviewItemTemplate = {
    "rfq_project_vision_detail_id":"",
    "project_review_id":"",
    "review_item_group_id":1,
    "review_item_group":"视觉需求",
    "item_group_type_id":1,
    "request_flag":0,
    "review_item_id":1,
    "review_item_name":"定位",
    "input_type":"checkbox",
    "review_value":"true",
    "del_flag":0,
    "create_date":null
};

function addProjectReview(review,connection){
    return new Promise((resolve,reject)=>{
        let currTime = new Date();
        review["project_review_id"] = commonService.getUUID();
        review["create_date"] = currTime;
        review["update_date"] = currTime;
        review["update_user_id"] = review["create_user_id"];
        connection.query('INSERT INTO t_rfq_project_review SET ?', review, function (error, results, fields) {
            if (error){
                reject(error);
            }else{
                resolve(review);
            }                                                                                                                                                                                                                                                                                                                                                                                                           
        });
    });
}

function addProjectReviewItems(review,reviewGroup,connection){
    const INSERT_ITEM_SQL = 'INSERT INTO t_rfq_project_review_detail SET ?';
    let promiseArray = [];
    let reviewItem = Object.assign({},reviewItemTemplate);
    reviewGroup.forEach( (group)=>{
        group.item.forEach( (item)=>{
            reviewItem.rfq_project_vision_detail_id = commonService.getUUID();
            reviewItem.review_item_group_id = group.review_item_group_id;
            reviewItem.review_item_group = group.review_item_group;
            reviewItem.item_group_type_id = group.item_group_type_id;
            reviewItem.request_flag = group.request_flag;
            reviewItem.project_review_id = item.project_review_id;
            reviewItem.review_item_id = item.review_item_id;
            reviewItem.review_item_name = item.review_item_name;
            reviewItem.input_type = item.input_type;
            reviewItem.review_value = item.review_value;
            let p = new Promise((resolve,reject)=>{
                connection.query(INSERT_ITEM_SQL,reviewItem,(error, results, fields) =>{
                    if (error) {
                        reject(error);
                    }else{
                       resolve();
                    }
                });
            });
            promiseArray.push(p);
        });
    });
    return Promise.all(promiseArray);
}

/**
 * 更新评审主记录表
 * @param {*} review 
 * @param {*} connection 
 */
function updateProjectReview(review,connection){
    const SQL = 
    `update t_rfq_project_review as R
        set 
        R.status = ? ,
        R.draft_flag = ? ,
        R.update_user_id = ?,
        R.update_date = ? 
        where R.rfq_project_id = ? and R.rfq_project_group_id = ? ;`;
    let params = [ 
        review["status"],
        review["draft_flag"],
        review["update_user_id"],
        new Date(),
        review["rfq_project_id"],
        review["rfq_project_group_id"]
    ];
    return new Promise((resolve,reject)=>{
        connection.query(SQL,params,(error, results, fields) =>{
            if (error) {
                reject(error);
            }else{
                queryProjectReview(review,connection)
                .then( (record)=>{
                    resolve(record);
                },(error)=>{
                    reject(error);
                });
            }
        });
    });
}

/**
 * 批量更新评审记录item
 */
function updateProjectReviewItem(groups,connection){
    const UPDATE_ITEM_SQL = `
    update t_rfq_project_review_detail as D
    set 
    D.review_value = ? 
    where D.rfq_project_vision_detail_id = ? ;`;
    let promiseArray = [];
    groups.forEach( (group)=>{
        group.item.forEach( (item)=>{
            let params = [
                item["review_value"],
                item["rfq_project_vision_detail_id"]
            ];
            let p = new Promise((resolve,reject)=>{
                connection.query(UPDATE_ITEM_SQL,params,(error, results, fields) =>{
                    if (error) {
                        reject(error);
                    }else{
                        resolve();
                    }
                });
            });
            promiseArray.push(p);
        });
    });
    return Promise.all(promiseArray);
}

/**
 * 查询出需要额外进行更新的review_item
 * @param {*} connection 
 */
function getSpecialField(connection){
    const sql = "select review_item_id,link_field from t_review_item";
    return new Promise((resolve,reject)=>{
        connection.query(sql,(error, results, fields) =>{
            if (error) {
                reject(error);
            }else{
                let findField = []
                results.forEach( (item)=>{
                    if( item["link_field"] !== ""){
                        findField.push( {
                            "review_item_id":item["review_item_id"],
                            "link_field":item["link_field"]
                        });
                    }
                });
                resolve(findField);
            }
        });
    });
}


function querySpecialFieldValue(review,fields,connection){
    let promiseArray = [];
    let sql = 
    `select t_rfq_project_review_detail.review_item_id, t_rfq_project_review_detail.review_value from t_rfq_project_review_detail 
    left join t_rfq_project_review 
    on t_rfq_project_review.project_review_id = t_rfq_project_review_detail.project_review_id
    where t_rfq_project_review.rfq_project_id = ? and t_rfq_project_review.rfq_project_group_id = ? and t_rfq_project_review_detail.review_item_id = ?;`;
    fields.forEach( (fieldItem)=>{
        let params = [
            review["rfq_project_id"],
            review["rfq_project_group_id"],
            fieldItem["review_item_id"]
        ];
        let p = new Promise( (resolve,reject)=>{
            connection.query(sql,params,(error, results, fields) =>{
                if (error) {
                    reject(error);
                }else{
                    if( results.length === 0 ){
                        resolve(null);
                    }else{
                        resolve({
                            "review_item_id":results[0]["review_item_id"],
                            "review_value":results[0]["review_value"]
                        });
                    }
                }
            });
        });
        promiseArray.push(p);
    });
    return Promise.all(promiseArray);
}

function updateSpecialFieldValue(review,fields,newData,connection){
    let promiseArray = [];
    let sql = 
    `update t_rfq_project_group  
    set ?? = ?  
    where t_rfq_project_group.rfq_project_id = ? and t_rfq_project_group.rfq_project_group_id = ?`;
    newData.forEach( (newDataItem,index)=>{
        if( newDataItem === null ){
            promiseArray.push ( new Promise( (resolve,reject)=>{
                resolve();
            }) );
            return;
        }
        let params = [
            fields[index]["link_field"],
            newDataItem["review_value"],
            review["rfq_project_id"],
            review["rfq_project_group_id"],
        ];
        let p = new Promise( (resolve,reject)=>{
            connection.query(sql,params,(error, results, fields) =>{
                if (error) {
                    reject(error);
                }else{
                    resolve();
                }
            });
        });
        promiseArray.push(p);
    });
    return Promise.all(promiseArray);
}

function updateProjectReportLink(connection){
    return  new Promise( (resolve,reject)=>{
        resolve();
    });
}

function formatFormConfigData(dbResults){
    let data = {
        review_type:"",
        item_group:[]
    };
    let itemGroupTemp = [];
    data.review_type = dbResults[0].NAME;

    //找出所有item_group
    dbResults.forEach( (record)=>{
        let isFindItetGroup = itemGroupTemp.find( (itemGroup)=>{
            return itemGroup.name === record["GROUP_NAME"];
        });
        if( !isFindItetGroup ){
            itemGroupTemp.push( {
                id:             record["GROUP_ID"],
                name:           record["GROUP_NAME"],
                sort:           record["GROUP_SORT_NO"], 
                requestFlag:    record["REQUEST_FLAG"],
                typeID:         record["GROUP_TYPE_ID"],
                item:[]
            });
        }
    });
    //按GROUP_SORT_NO排序
    itemGroupTemp.sort( (a,b)=>{
        return a.sort - b.sort;
    });
    //填充item_group中的item
    dbResults.forEach( (record)=>{
        //找出属于哪一组
        let group = itemGroupTemp.find( (groupItem)=>{
            return groupItem.name === record["GROUP_NAME"];
        });
        group.item.push({
            id:     record["ITEM_ID"],
            name:   record["ITEM_NAME"],
            type:   record["ITEM_TYPE"],
            sort:   record["ITEM_SORT_NO"],
            value_type: record["ITEM_VALUE_TYPE"]
        });
    });
    //按ITEM_SORT_NO排序
    itemGroupTemp.forEach( (group)=>{
        group.item.sort( (a,b)=>{
            return a.sort - b.sort;
        });
    });
    data.item_group = itemGroupTemp;
    return data;
}

/**
 * 查询评审记录(主表)
 * @param {*} params 
 */
function queryProjectReview( params,connection ){
    const sql = "select * from t_rfq_project_review as R where R.rfq_project_group_id = ? and R.rfq_project_id = ?;";
    let queryParams = [
        params["rfq_project_group_id"],
        params["rfq_project_id"],
    ];
    return new Promise( (resolve,reject)=>{
        connection.query(sql,queryParams,(error, results, fields) =>{
            if (error) {
                reject(error);
            }else{
                resolve(results[0]);
            }
        });
    });
}

/**
 * 给review_item对象填充review_id
 * @param {string} id 
 * @param {[]} reviewGroup 
 */
function fillReviewID(id,reviewGroup){
    reviewGroup.forEach( (group)=>{
        group.item.forEach( (item)=>{
            item["project_review_id"] = id;
        });
    });
}
