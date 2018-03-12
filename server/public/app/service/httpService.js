(function(){
    var app = angular.module("app");
    var httpService = function($http,$q){
        var service = {};
        service.apiRequest = function(requestMethod,url,data,headers){
            var deferred = $q.defer();
            if( headers=== undefined){
                $http({method: requestMethod, url: url, data:data})
                .then( (response)=>{
                    checkHander(response,deferred);
                },(error)=>{
                    checkHander(response,deferred);
                });
            }else{
                var promise = $http({
                    method: requestMethod,
                    url:url,
                    data: data,
                    headers: headers
                }); 
                promise.then(function(response){
                    checkHander(response,deferred);
                },function(error){
                    checkHander(response,deferred);
                });
            }
            return deferred.promise;
        };

        function checkHander(response,deferred){
            try {
                var result = check(response);
                if( result.isSuccess ){
                    deferred.resolve(response.data.data);
                }else{
                    if( result.type === "您未登录"){
                        var url='/view/openLogin';
                        window.location.href= window.location.origin+url;
                        return;
                    }else{
                        deferred.reject( result.message );
                    }
                }
            }catch (error) {
                console.error(error);
                deferred.reject("网络请求异常");
            }     
        }
        function check(response){
            var checkResult = {
                isSuccess:true,
                message:"",
                type:"",
                data:null
            };
            var code=response.data.code;
             if(code<0){
                switch(code){
                    case -1: 
                        checkResult.isSuccess = false;
                        checkResult.message = response.data.message;
                        checkResult.type = "请求失败";
                        return checkResult;
                        break;
                     case -2: 
                        checkResult.isSuccess = false;
                        checkResult.message = response.data.message;
                        checkResult.type = "您未登录";
                        return checkResult;
                        break;
                    case -3:
                        checkResult.isSuccess = false;
                        checkResult.message = response.data.message;
                        checkResult.type = "未处理异常";
                        return checkResult;
                        break;
                    case -4:
                        checkResult.isSuccess = false;
                        checkResult.message = response.data.message;
                        checkResult.type = "无效的api";
                        return checkResult;
                        break;
                }
              
            }else{
                checkResult.data = response.data.data
                return checkResult;
            }
        }
        return service;
    };
    app.factory("httpService",['$http','$q',httpService]);
})();