const uuid = require("uuid/v4");
const fs = require('fs-extra');
exports.getUUID = getUUID;
exports.getApiTemplate = getApiTemplate;
exports.copyUploadFile = copyUploadFile;
exports.getProjectDir = getProjectDir;
exports.getApiCode = getApiCode;

const API_STATUS = {
    "SUCCESS":0,
    "ERROR":-1,
    "NOT_LOGIN":-2,
    "UNHANDLED_EXCEPTION":-3, 
    "UNKNOWN_API":-4,
}
/**
 * 获取一个api返回数据的标准模板
 * code小于0都是失败的api返回结果
 */
function getApiTemplate(){
    return {
        code:0, //小于0都是失败的api返回结果
        message:"",
        data:null,
        error:null
    }
}

/**
 * 获取api的返回状态code
 * @param {string} status 
 */
function getApiCode(status){
    let code = 0;
    code = API_STATUS[status] || -1;
    return code;
}

function getUUID(){
    return uuid();
}

/** 复制文件*/
function copyUploadFile(files){
    let root = getProjectDir();
    let promiseArray = [];
    
    if( files.length === 0 ){
        return new Promise((resolve,reject)=>{
            resolve();
        });
    }
    files.forEach( (file)=>{
        let p =  new Promise((resolve,reject)=>{
            let path = root+file.path;
            let dest = root+"public/uploadFiles/"+file.filename;
            fs.ensureDir(dest, err => {
                if (err){
                    reject(err);
                }else{
                    fs.copy(path, dest+"/"+file.originalname, err => {
                        if (err){
                            reject(err);
                        }else{
                            resolve("/uploadFiles/"+file.filename+"/"+file.originalname);
                        }
                    });
                }
            })
        });
        promiseArray.push(p);
    });
    return Promise.all(promiseArray);
}

/**
 * 获取当前工程跟目录路径
 */
function getProjectDir(){
    let dir = __dirname;
    dir = dir.replace(/\\\\/g,"/");
    return dir.substr(0,dir.indexOf("server")+7);
}