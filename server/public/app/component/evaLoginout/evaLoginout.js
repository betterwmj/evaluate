(function(){
    /**
     * 统计数据展示组件
     */
    'use strict';
     var component={
         templateUrl:'/app/component/evaLoginout/evaLoginout.html',
         controller:['$scope','$element','$cookies','$http',controller],
     };
    function controller($scope,$element,$cookies,$http){
         $scope.name= $cookies.get("person");
         $scope.loginout = function(){
            var promise=$http({
                method:'POST',
                url:"/api/loginout",
            })
            promise.then(function(response){
                var url='/view/openLogin';
                $cookies.remove("person");
                window.location.href= window.location.origin+url;     
            },function(error){
                console.log(error);
            });
            return promise;
        };
    }
    angular.module("app").component('evaLoginout', component);
})();