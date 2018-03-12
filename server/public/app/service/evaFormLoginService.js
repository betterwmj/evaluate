angular.module('app').factory('evaFormLoginService',['httpService','$q',function(httpService,$q){
   var service={};
   service.getLoginResult=function(userName,userPass){
        var user = {
            userName:userName,
            userPass:userPass
        }
    return httpService.apiRequest('POST',"/api/login",user);
   }
   return service;
}]);
