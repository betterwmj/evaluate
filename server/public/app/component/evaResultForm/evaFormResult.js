(function(){
  /**
   * 统计数据展示组件
   */
  'use strict';
  var component = {
    templateUrl: '/app/component/evaResultForm/evaFormResult.html',
    controller: ['$scope', '$element','evaFormResultService','$http',controller],
    bindings:{
      query:"="
    }
  };
  function controller($scope, $element,evaFormResultService,$http){
    var vm = this;
    $scope.formConfig = [];
    $scope.formConfigReply = [];
    vm.isShow = true;
    vm.isShowFile=true;
    vm.$onInit = function(){
       evaFormResultService.getFormConfig(0)
      .then(function(result){
            $scope.formConfig = result;
            return evaFormResultService.getReviweRecord(vm.query,0);
       })
       .then(function(result){
           
            if(result.mainRecord !==null){
                if(result.detail.length!==0)   {     
                    for(var i=0;i<result.detail.length;i++){
                        var detail=result.detail[i];
                        if(detail.review_value===false){
                            detail.review_value="否";
                        } 
                        if(detail.review_value===true){
                            detail.review_value="是";
                        } 
                    }      
                }     
            }  
            evaFormResultService.mergeData($scope.formConfig,result);
            
       }).catch( function(error){
          console.error(error);
       });
        evaFormResultService.getFormConfig(1)
        .then(function(result){
              $scope.formConfigReply = result;
              return evaFormResultService.getReviweRecord(vm.query,1);
        })
        .then(function(result){
        
            if(result.mainRecord !==null){
                if(result.detail.length!==0) {     
                    for(var i=0;i<result.detail.length;i++){
                        var detail=result.detail[i];
                        if(detail.review_value===false){
                            detail.review_value="否";
                        } 
                        if(detail.review_value===true){
                            detail.review_value="是";
                        } 
                    }      
                }     
            }  
            evaFormResultService.mergeData($scope.formConfigReply,result);
              
        }).catch( function(error){
            console.error(error);
        });
      }
     }        
  angular.module('app').component('evaFormResult', component);
})();