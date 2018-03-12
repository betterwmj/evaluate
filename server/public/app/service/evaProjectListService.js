angular.module('app').factory('evaProjectListService', ['httpService', '$q',function(httpService,$q){
    var service = {};
    service.getReviweRecord = function(pageNumber,pageCount,projectName){
         projectName = projectName || "";
         var url = '/api/getProjectList';
         var data = {
             pageNumber:pageNumber,
             pageCount:pageCount,
             projectName:projectName
         };     
         return httpService.apiRequest("POST", url,data); 
    };
    //专案id,专案组id,申请-0，回复-1
    service.request = function(id,idd){
        var url='/view/openReview/'+id+"/"+idd+"/0" 
        window.location.href= window.location.origin+url; 
    };
    service.reply = function(id,idd){      
        var url = '/view/openReply/'+id+"/"+idd+"/1";
        window.location.href= window.location.origin+url; 
    };
    service.look = function(id,idd){
       var url = '/view/openResult/'+id+"/"+idd;
       window.location.href= window.location.origin+url;    
    };
    return service;
}]);                                                                                                                                                                                                                                                                                                                               