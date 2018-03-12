let mysqlService = require("./mysqlService.js");
let commonService = require("./commonService.js");

exports.getUserByName = getUserByName;

const GET_USER_BY_ENAME="select * from t_user where ename = ? ";

function getUserByName(ename){
    return new Promise((resolve,reject)=>{   
        mysqlService.getConnection()
        .then( (connection)=>{
            connection.query({
                sql:GET_USER_BY_ENAME,
                values:[ename] 
            }, function (error, results, fields) {
                if (error) {
                    reject( error );
                }else{
                    if( results.length === 0 ){
                        reject( "用户名或者密码错误" );
                        return;
                    }
                    resolve(results[0]);
                }
                connection.release();
            });
        },(error)=>{
            reject(error);
            connection.release();
        });
    });
}