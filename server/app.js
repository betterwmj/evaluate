"use strict";
let port = 3000;
let express = require('express');
let swig = require('swig');

let app = express();
let server = null;
let viewEngineConfig = require("./src/viewEngine/config");
let authentication = require("./src/authentication/authentication.js");
let apiRouter = require("./src/route/apiRouter");
let viewRouter = require("./src/route/viewRouter");
let mysqlService = require("./src/service/mysqlService.js");
const commonService = require('./src/service/commonService.js');

mysqlService.initMySQL({
	connectionLimit:100,
	host     : '127.0.0.1',
  	user     : 'root',
  	password : '123456',
  	database : 'iacloud',
	waitForConnections:false,
	debug:false
}).then( ()=>{
	console.log("mysql link ok");
	startService();
},(error)=>{
	console.error(error);
});

viewEngineConfig(app,swig);

authentication(app);

app.set('views', __dirname + '/views');


//处理静态资源文件
app.use(express.static('public',{
	index: '/view/openLogin'
}));

app.get("/",function(req, res){
	res.redirect("/view/openLogin");
});

//api路由,统一以api开头
app.use("/api",apiRouter);

//返回结果是view template,统一以view开头
app.use("/view",viewRouter);

//异常处理
app.use(function(err, req, res, next) {
  console.error("未处理异常",err);
  let apiResult = commonService.getApiTemplate();
  apiResult.code = commonService.getApiCode("UNHANDLED_EXCEPTION");
  apiResult.error = err;
  apiResult.message = "未处理异常";
  res.status(500).json(apiResult);
});

//404处理
app.use(function(req, res, next) {
  let url = req.url;
  if( url.indexOf("/api/") >= 0 ){
		//访问了无效的api url
		let apiResult = commonService.getApiTemplate();
  		apiResult.code = commonService.getApiCode("UNKNOWN_API");
  		apiResult.message = "无效的api";
		res.status(404).json(apiResult);
  }else{
		//访问了无效的页面url
		res.status(404).send('404 NOT FOUND!');
  }
});

/**启动service */
function startService(){
	server = app.listen(port, function () {
		let host = server.address().address;
		let port = server.address().port;
		console.log('app listening at http://%s:%s', host, port);
	});
}



