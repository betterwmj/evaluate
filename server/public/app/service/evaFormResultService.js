angular.module('app').factory('evaFormResultService', ['httpService', '$q',function(httpService,$q){
    var service = {};
    service.getFormConfig = function(id){      
         return httpService.apiRequest("GET","/api/formConfig/1/"+id); 
    };
    service.getReviweRecord = function(query,requestflag){
         var url = '/api/getReviweRecord/';
         url = url + query["rfq_project_id"]+"/"+query["rfq_project_group_id"]+"/"+requestflag;
        return httpService.apiRequest("GET", url)
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
}]);                                                                                                                                                                                                                                                                                                                               