"use strict";
let express = require('express');
/**
 * 配置view的路由
 */
let viewRouter = express.Router();

let reviewController = require("../controller/reviewController");
let getProjectController = require("../controller/getProjectController");
module.exports = viewRouter;

/**
 * 打开评审页面
 * rfqProjectId
 * rfqProjectGroupId
 *
 * requestFlag 0-申请 1-回复
 */
viewRouter.get('/openReview/:rfqProjectId/:rfqProjectGroupId/:requestFlag',reviewController.openReviewForm);

viewRouter.get('/openReply/:rfqProjectId/:rfqProjectGroupId/:requestFlag',reviewController.openReplyForm);

viewRouter.get('/openResult/:rfqProjectId/:rfqProjectGroupId',reviewController.openResultForm);

viewRouter.get('/openProjectList',getProjectController.openRrojectListForm);
//打开登录界面
viewRouter.get('/openLogin',reviewController.openLoginForm);

