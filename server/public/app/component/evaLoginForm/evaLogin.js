(function(){
    
    'use strict';
     var component={
         templateUrl:'/app/component/evaLoginForm/evaLogin.html',
         controller:['$scope','$element','evaFormLoginService','$http','$cookies',controller],
         bindings:{

         }
     };
    function controller($scope,$element,evaFormLoginService,$http,$cookies){
        $scope.errorMessage="";
		$scope.user = {
			userName:"",
			pass:""
		};
		$scope.login = function(){
			var userName=$scope.user.userName;
			var pass=$scope.user.pass;
			if(userName==""||pass==""||userName==null||pass==null){
				$scope.errorMessage="用户名或密码为空";
			}else{

				evaFormLoginService.getLoginResult(userName,pass)
				.then(function(result){
					$cookies.put('person', result.cname); 
					var url='/view/openProjectList';
            		window.location.href= window.location.origin+url;  
				})
				.catch( function(error){
					$scope.errorMessage =error;         
					console.error(error);
				});     
			}          
		}
    }
    angular.module("app").component('evaLogin', component);
})();