(function(){
  /**
   * 统计数据展示组件
   */
  'use strict';
  var component = {
    templateUrl: '/app/component/evaReplyForm/evaFormReply.html',
    controller: ['$scope', '$element','evaFormReplyService','$http',controller],
    bindings:{
      query:"="
    }
  };
  function controller($scope, $element,evaFormReplyService,$http){
    var vm = this;
    $scope.formConfig = [];
    $scope.errorMessage="";
    vm.isShow = false;
    vm.isShowFile=false;
    var isUpdate = false; //标识是create还是update
    vm.$onInit = function(){
        evaFormReplyService.getFormConfig()
        .then(function(result){
              $scope.formConfig = result;
              return evaFormReplyService.getReviweRecord(vm.query);
              })
              .then(function(result){
                    if(result.detail !== null && result.detail.length > 0 ){
                        isUpdate = true;
                    }
                    if( result.mainRecord === null ){
                        return;
                    }
                    if(result.detail.length!==0)   {     
                        for(var i=0;i<result.detail.length;i++){
                            if(result.detail[i].input_type==="file" && result.detail[i].review_value!=="" )
                                vm.isShowFile=true;
                        }
                    }
                    if(result.mainRecord.status===0&&result.mainRecord.draft_flag===1 ) {      
                            vm.isShow = true;
                    } 
                    if(result.mainRecord.status===1)
                    {
                        vm.isShow = false;
                    }   
                    evaFormReplyService.mergeData($scope.formConfig,result);     
              
              }).catch( function(error){
                  console.error(error);
              });  
    };
    $scope.submit=function(confirm){
        evaFormReplyService.submit(confirm,$scope.formConfig,vm.query,isUpdate)
        .then((result)=>{
            $scope.errorMessage=result;
            return evaFormReplyService.getReviweRecord(vm.query);
        })
        .then( (result)=>{    
            var data=result;
            if( data.detail !== null && data.detail.length > 0 ){
               isUpdate = true;
            }
            if( data.mainRecord !=null ){   
                if(data.detail.length!==0)   {     
                    for(var i=0;i<data.detail.length;i++){
                        var detail=data.detail[i];
                        if(detail.input_type==="file" && detail.review_value!=="" )
                                vm.isShowFile=true;
                    }
                }
                if( data.mainRecord.status===0&&data.mainRecord.draft_flag===1 ) {      
                        vm.isShow = true;
                    }  
                if( data.mainRecord.status===1 ) {
                    vm.isShow = false;
                }           
            }
        evaFormReplyService.mergeData($scope.formConfig,result);     
              
        })
        .catch( (error)=>{
            $scope.errorMessage = error;
            console.error(error);
        });
    }
    vm.checkInput = function(Secondheader){
        var inputValue= Secondheader.inputValue;
        if( inputValue === "" || inputValue === null || inputValue === undefined){
          Secondheader.errorMsg = Secondheader.name +",不能为空";
        }else{ 
          Secondheader.errorMsg = "";
        }
    }
  } 
  angular.module("app").component('evaFormReply', component);
})();