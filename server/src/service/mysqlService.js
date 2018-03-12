"use strict";
let mysql = require('mysql');
let pool  = null;

exports.initMySQL = initMySQL;
exports.getConnection = getConnection;
exports.beginTransaction = beginTransaction;
exports.commitTransaction = commitTransaction;
exports.close = close;

/**
 * 初始化mysql数据库连接池
 * @param {{connectionLimit:30,host:"",user:"",password:"",database:""}} config 
 */
function initMySQL(config){
    return new Promise(function(resolve,reject){
        let result = configCheck(config);
        if( result !== null ){
            reject(result);
        }
        pool = mysql.createPool(config);
        pool.getConnection(function(err, connection) {
            if( err ){
                reject(err);
            }else{
                connection.release();
                resolve();
            }
        });
        pool.on('connection', function (connection) {
            console.log('get connection %d',connection.threadId);
        });
        pool.on('enqueue', function () {
            console.log('Waiting for available connection slot');
        });
        pool.on('release', function (connection) {
            console.log('Connection %d released', connection.threadId);
        });
    });
}

/**
 * 获取一个数据库连接
 */
function getConnection(){
    return new Promise(function(resolve,reject){
        if( pool === null ){
            reject("no pool");
        }
        pool.getConnection(function(err, connection) {
            if( err ){
                reject(err); 
            }else{
                resolve(connection);
            }
        });
    });
}
/**
 * 返回一个成功开启了事务的数据库连接
 */
function beginTransaction(){
    return new Promise(function(resolve,reject){
        if( pool === null ){
            reject("no pool");
        }
        pool.getConnection(function(err, connection) {
            if( err ){
                reject(err); 
            }else{
                connection.beginTransaction( (err)=>{
                    if( err ){
                        reject(err);
                    }else{
                        resolve(connection);
                    }
                });
            }
        });
    });
}
/**
 * 提交事务,释放connection
 * @param {*} connection 
 */
function commitTransaction(connection){
    return new Promise(function(resolve,reject){
        connection.commit(function(err) {
            if (err) {
                connection.rollback(function() {
                    reject(err);
                });
            }else{
                resolve();
            }
            connection.release();
        });
    });
}
/**
 * 关闭连接池
 */
function close(){
    if( pool !== null ){
        pool.end();
    }
}

function configCheck(){
    return null;
}