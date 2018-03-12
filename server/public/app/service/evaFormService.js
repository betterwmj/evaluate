angular.module('app').factory('evaFormService', ['httpService', '$q',function(httpService,$q){
    var service = {};
    service.getFormConfig = function(){
        return httpService.apiRequest("GET", "/api/formConfig/1/0"); 
    };
    service.getReviweRecord = function(query){
         var url = '/api/getReviweRecord/';
         url = url + query["rfq_project_id"]+"/"+query["rfq_project_group_id"]+"/"+query["request_flag"];
         return httpService.apiRequest("GET", url)
    };
    service.submit = function(confirm,formConfig,query,isUpdate){
        if(confirm){
            var errorMsg = check(formConfig);
            if( errorMsg !== true ){
                  return $q(function(resolve, reject) {
                      reject(errorMsg);
                  });
            }else{
                var data = setFormData(formConfig);
                return submit(data,false,query,isUpdate);
            }
        }else{
            var data=setFormData(formConfig);
            return submit(data,true,query,isUpdate);
        }
    };
    service.mergeData = mergeData;
    return service;
    function mergeData(formConfig,draftData){
        if( draftData.detail!==null ){
            for( var i=0;i<formConfig.item_group.length;i++ ){
                for( var j=0;j<formConfig.item_group[i].item.length;j++ ){
                    for( var z=0;z<draftData.detail.length;z++ ) {
                        var item=formConfig.item_group[i].item[j]; 
                        var draft=draftData.detail[z];
                        if( formConfig.item_group[i].id===draft.review_item_group_id&&
                              item.id===draft.review_item_id ) {
                              item.rfq_project_vision_detail_id = draft.rfq_project_vision_detail_id;
                              item.inputValue=draft.review_value;   
                        }
                    }         
                }
           }
        }
    }
    function check(formConfig){
        var result=[];
        var isChecked=0;
        var isWrited=true;
        var errorMsg = "";
        var filePath="";
        for(var i=0;i<formConfig.item_group.length;i++){         
            for(var j=0;j<formConfig.item_group[i].item.length;j++){       
                    var item=formConfig.item_group[i].item[j];   
                    if ( item.type=="checkbox" && item.inputValue === true){
                              isChecked++;              
                    }  
                    if ( item.type=="text" ){     
                            if( item.inputValue==undefined || item.inputValue === ""){
                                 isWrited= false; 
                                 errorMsg=formConfig.item_group[i].name+"中的"+item.name+"为必填项";            
                                 break;
                            }
                    }
                    if (item.type=="file"){
                        filePath=item.inputValue;                
                    } 
            }
            var types = [];
            var group = formConfig.item_group[i];
            group.item.forEach( (ele)=>{
                var inputType = ele.type;
                var findType = types.find( (t)=>{
                    return t === inputType;
                });
                if( findType === undefined ){
                    types.push(inputType);
                }
            });
            var typeIndex = 0;
            for(; typeIndex < types.length; ++typeIndex){
                switch (types[typeIndex]){
                    case "text":
                        if( isWrited === false ){
                            return errorMsg;
                        }
                    break;
                    case "checkbox":
                        if(types.length===1 && formConfig.item_group[i].item.length>1){
                            if( isChecked === 0 ){           
                                errorMsg=formConfig.item_group[i].name+"至少需要勾选一项";
                                return errorMsg;
                            }
                       }
                    break;
                    case "file":
                        var files=document.getElementById("files");
                        if(files.files.length<=0){
                            if(filePath===""||filePath=== undefined){
                                errorMsg="请上传相关图纸和照片";
                                return errorMsg;
                            }
                        }     
                    break;
                }
            }
          
        }
        return true;
    };

    function setFormData(formConfig){
          var result = [];
          for(var i=0;i<formConfig.item_group.length;i++){
              var item=formConfig.item_group[i];
               result[i] = {
                    review_item_group_id:item.id,
                    review_item_group   :item.name,
                    item_group_type_id  :item.typeID,
                    request_flag        :item.requestFlag,
                    item:[]
               };
               for(var j=0;j<formConfig.item_group[i].item.length;j++){
                var itemdetail=formConfig.item_group[i].item[j];   
                result[i].item[j] = {  
                    review_item_id   :itemdetail.id,
                    review_item_name :itemdetail.name,
                    input_type       :itemdetail.type,
                    review_value     :itemdetail.inputValue,
                    rfq_project_vision_detail_id     :itemdetail.rfq_project_vision_detail_id       
                };      
                if (itemdetail.type=="text"
                    &&itemdetail.inputValue==undefined){                
                    result[i].item[j].review_value=""; 
                }
                if(itemdetail.type=="file"
                    &&itemdetail.inputValue==undefined){
                    result[i].item[j].review_value=""; 
                }
                if(itemdetail.type=="checkbox"
                    &&itemdetail.inputValue==undefined){
                    result[i].item[j].review_value=false;                   
                }                   
               }   
          }
          console.log(result);
          return result;  
    }

    function submit(result,isDraft,query,isUpdate){
      var apiUrl = "";
      if( isUpdate ){
        apiUrl = "/api/updateReviewApply";
      }else{
        apiUrl = "/api/createReviewApply";
      }
      var myForm = new FormData();
      if( document.querySelector('input[type=file]') !== null ){
          myForm.append('upload_files',document.querySelector('input[type=file]').files[0] ); 
      }
      myForm.append('data',angular.toJson(result));
      myForm.append('rfq_project_id',query["rfq_project_id"]); 
      myForm.append('rfq_project_group_id',query["rfq_project_group_id"]);
      myForm.append('isDraft',isDraft);
      var header= {'Content-Type':undefined};
      var deferred = $q.defer();
      httpService.apiRequest("POST",apiUrl,myForm,header)
      .then(function(result){ 
            if(isDraft){
                deferred.resolve("已存为草稿!");
            }
            else{
                deferred.resolve("数据提交成功!");
            }
      },function(error){
        deferred.reject("提交失败");
      });
      return deferred.promise;
    }
    
}]);                                                                                                                                                                                                                                                                                                                               