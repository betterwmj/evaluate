let mysqlService = require("./mysqlService.js");
let commonService = require("./commonService.js");

exports.getProjectList = getProjectList;
const GET_PROJECT_NAME=
    `select P.rfq_project_id, G.rfq_project_group_id,P.rfq_project_name,P.background,P.requirement,R.status,R.draft_flag from t_rfq_project as P
    RIGHT JOIN t_rfq_project_group as G 
    on P.rfq_project_id = G.rfq_project_id 
    LEFT JOIN
    t_rfq_project_review as R
    on R.rfq_project_id = P.rfq_project_id
    WHERE
    P.rfq_project_status = 1 OR P.rfq_project_status = 2 
    ORDER BY P.rfq_project_id limit ?,? `;
const GET_PROJECT_NAME_SEARCH =
    `select P.rfq_project_id, G.rfq_project_group_id,P.rfq_project_name,P.background,P.requirement,R.status,R.draft_flag from t_rfq_project as P
    RIGHT JOIN t_rfq_project_group as G 
    on P.rfq_project_id = G.rfq_project_id 
    LEFT JOIN
    t_rfq_project_review as R
    on R.rfq_project_id = P.rfq_project_id
    WHERE
    (P.rfq_project_status = 1 OR P.rfq_project_status = 2) 
     AND 
    (P.rfq_project_name like '%?%')
    ORDER BY P.rfq_project_id limit ?,? `;
/*
*
   获得专案列表
*/
function getProjectList(params){
    return new Promise((resolve,reject)=>{
        let sql = "";
        let projectName = params.projectName;
        if( projectName === "" || projectName === null || projectName === undefined){
            sql = GET_PROJECT_NAME;
        }else{
            sql = GET_PROJECT_NAME_SEARCH.replace("(P.rfq_project_name like '%?%')","(P.rfq_project_name like '%"+projectName+"%')");
        }
        
        let args = [];
        
        args[0] = (params.pageNumber-1) * params.pageCount;
        args[1] = params.pageCount;
        
        mysqlService.getConnection() 
        .then( (connection)=>{
            connection.query( sql,args,function (error, results, fields){
                if (error) { 
                    reject( error );
                }else{
                     connection.query("select count(*) as count from t_rfq_project where rfq_project_name like '%"+projectName+"%'",[],function(error1, results1, fields1){
                        if (error1) { 
                            reject( error1 );
                        }else{
                            resolve({
                                "detail":results,count:results1[0].count
                            });
                        }
                     });
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
 * 获取一张表的数据总个数
 */
function getTableCount(tableName){
    return new Promise((resolve,reject)=>{
         mysqlService.getConnection() 
        .then( (connection)=>{
            connection.query( "select count(*) as count from "+tableName,function (error, results, fields){
                if (error) { 
                    reject( error );
                }else{
                     resolve(results[0]["count"]);
                }
                connection.release();
            });
        });
    });
}