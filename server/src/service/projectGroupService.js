let mysqlService = require("./mysqlService.js");
let commonService = require("./commonService.js");
let lodash = require('lodash');
exports.getProjectGroup = getProjectGroup;

const query_project_group = "select * from t_rfq_project_group ";
/**
 * 查询ProjectGroup record
 */
function getProjectGroup(projectGroup){
    let params = [];
    let sql = query_project_group;
    let queryCase = [];
    return new Promise((resolve,reject)=>{
        if( lodash.isEmpty(projectGroup) ) {
            reject("无效的projectGroup查询参数");
        }
        //查询条件
        for (let prop in projectGroup) {
            queryCase.push( prop +" = ? ");
            params.push( projectGroup[prop] );
        }
        //构造sql语句
        queryCase.forEach( (caseItem,index)=>{
            if( index === 0 ){
                sql += "where ";
            }
            sql += caseItem;
            if( index !== queryCase.length -1 ){
                sql += "and ";
            }
        });
        mysqlService.getConnection() 
        .then( (connection)=>{
            connection.query(sql,params,function (error, results, fields){
                if (error) { 
                    reject( error );
                }else{
                     resolve(results);
                }
                connection.release();
            });
        },(error)=>{
            reject(error);
            connection.release(); 
        });
    });
}