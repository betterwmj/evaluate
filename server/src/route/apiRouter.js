"use strict";
let express = require('express');
let apiRouter = express.Router();
let multer  = require('multer');
let bodyParser = require('body-parser');
// create application/json parser
let jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
let urlencodedParser = bodyParser.urlencoded({ extended: false });

let upload = multer({ dest: 'uploads/' });
const FILENAME = "upload_files";

let formConfigController = require("../controller/formConfigController");
let reviewController = require("../controller/reviewController");
let userController = require("../controller/userController");
let getProjectController = require("../controller/getProjectController");
module.exports = apiRouter;

apiRouter.get('/formConfig/:formTypeID/:requestFlag',formConfigController.formConfig);

//创建一条评审申请记录
apiRouter.post('/createReviewApply',upload.array(FILENAME, 3),reviewController.createReviewApply);

//更新一条评审记录
apiRouter.post('/updateReviewApply',upload.array(FILENAME, 3),reviewController.updateReviewApply);

//创建评审回复记录
apiRouter.post('/createReviewReply',upload.array(FILENAME, 3),reviewController.createReviewReply);

//更新评审回复记录
apiRouter.post('/updateReviewReply',upload.array(FILENAME, 3),reviewController.updateReviewReply);

/** */
apiRouter.get('/getReviweRecord/:rfq_project_id/:rfq_project_group_id/:request_flag',reviewController.getReviweRecord);

apiRouter.post('/getProjectList',jsonParser,getProjectController.getProjectListRecord);
//用户登录
apiRouter.post('/login',jsonParser,userController.login);

apiRouter.post('/loginout',jsonParser,userController.loginout);