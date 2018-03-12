(function(){
  /**
   * 统计数据展示组件
   */
  'use strict';
  var component = {
    templateUrl: '/app/component/evaForm/evaForm.html',
    controller: ['$scope', '$element','evaFormService','$http',controller],
    bindings:{
      query:"="
    }
  };
  function controller($scope, $element,evaFormService,$http){
    var vm = this;
    $scope.formConfig = [];
    vm.isShow = true;
    vm.isShowFile=false;
    var isUpdate = false;
    $scope.errorMessage="";
    vm.$onInit = function(){
        evaFormService.getFormConfig() 
        .then(function(result){
          $scope.formConfig =result;
          return evaFormService.getReviweRecord(vm.query);
        })
        .then(function(result){      
            if( result.mainRecord === null ){
                return;
            }
            isUpdate = true;
            if(result.detail.length!==0) {     
                for(var i=0;i<result.detail.length;i++){
                    var detail=result.detail[i];
                    if(detail.input_type==="file" && detail.review_value!=="" )
                        vm.isShowFile=true;
                }
            }
            if(result.mainRecord.draft_flag === 1){
                vm.isShow = false;
            }
            evaFormService.mergeData($scope.formConfig,result); 
            
        }).catch( function(error){
            console.error(error);
        });  
    };  
    $scope.submit=function(confirm){
        evaFormService.submit(confirm,$scope.formConfig,vm.query,isUpdate)
        .then((result)=>{
          $scope.errorMessage=result;
          return evaFormService.getReviweRecord(vm.query);
        })
        .then((result)=>{
            if(result.mainRecord ){
                    isUpdate = true;
                    if(result.detail.length!==0)   {     
                        for(var i=0;i<result.detail.length;i++){
                        var detail=result.detail[i];
                        if(detail.input_type==="file" && detail.review_value!=="" )
                            vm.isShowFile=true;
                        }
                    }
                if(result.mainRecord.draft_flag === 1){
                    vm.isShow = false;
                }    
            }
            evaFormService.mergeData($scope.formConfig,result);        
        })
        .catch( (error)=>{
          $scope.errorMessage = error;
          console.error(error);
        });
    }
    vm.checkInput = function(Secondheader){
        var inputValue=Secondheader.inputValue;
        if( inputValue === "" || inputValue === null || inputValue === undefined){
           Secondheader.errorMsg = Secondheader.name +",不能为空";
        }else{
           Secondheader.errorMsg = "";
        }
    }
  } 
  angular.module('app').component('evaForm', component);
})();