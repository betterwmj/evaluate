(function(){
  /**
   * 统计数据展示组件
   */
  'use strict';
  var component = {
    templateUrl: '/app/component/evaProjectListForm/evaProjectList.html',
    controller: ['$scope', '$element','evaProjectListService','$http','$cookies','$window','$location',controller],
  };
  function controller($scope, $element,evaProjectListService,$http,$cookies,$window,$location){
    var vm=this;
    $scope.formConfig = [];
    let btnBaseCount = 5;
    const PREV_GROUP = -1;
    const NEXT_GROUP=  -2;
    vm.pageBtns = [];
    vm.current = 1;
    vm.totalPage = 0;
    vm.pageCount=2;
    vm.clickPage=clickPage;
    vm.prevPage=prevPage;
    vm.nextPage=nextPage;
  	vm.searchKey = "";
    $window.addEventListener("hashchange", function(){
        vm.current = parseUrl();
        clickPage({
          page:vm.current
        });
    });
    vm.$onInit = function(){
        vm.current = parseUrl();
        evaProjectListService.getReviweRecord(vm.current,vm.pageCount)
        .then(function(result){ 
		      	$scope.formConfig = result;
            vm.recordCount=result.count;
            vm.totalPage = Math.ceil( vm.recordCount / vm.pageCount ); //计算总页数
		      	renderPageBtns(vm.current);
        })
        .catch( function(error){
            console.error(error);
        }); 
    };

    function clickPage(pageItem){
        let current = pageItem.page;
        if( pageItem.page === PREV_GROUP ){
          //切换至前一组分页
          current = vm.pageBtns[0].page;
          renderPageBtns(current);
        }else if( pageItem.page === NEXT_GROUP ){
          //切换至后一组分页
          current = vm.pageBtns[vm.pageBtns.length-1].page;
          renderPageBtns(current);
        }else{
          vm.current = current;
          getReviweRecord(vm.current,vm.pageCount);
        }
        $location.path('page='+vm.current);
    }
    /*
    生成分页按钮
    */
    function renderPageBtns(current){
          vm.pageBtns.splice(0,vm.pageBtns.length);
          let pageStart = current - 2 >= 1 ? current - 2 : 0;
          //默认生成5个按钮
          for( let i = 1; i <= btnBaseCount ; ++i ){
            if( pageStart+i > vm.totalPage ){
                  break;
            } 
            vm.pageBtns.push({"label":(pageStart+i)+"",page:pageStart+i});
          }
          //不够5个尝试从后往前补齐
          for(let i = 0; vm.pageBtns.length < btnBaseCount; ++i){
              if( pageStart - i >= 1){
                vm.pageBtns.unshift( {"label":(pageStart - i)+"",page:pageStart - i } );
              }else{
                break;
              }
          }
          //添加到第一页的快捷按钮
          if( vm.pageBtns[0] && vm.pageBtns[0].page !== 1){
             vm.pageBtns.unshift( {"label":"1",page:1} );
          }
          //添加到最后一页的快捷按钮
          if( vm.pageBtns[vm.pageBtns.length-1] && vm.pageBtns[vm.pageBtns.length-1].page !== vm.totalPage){
             vm.pageBtns.push( {"label":""+vm.totalPage,page:vm.totalPage} );
          }
          //添加向前跳页按钮
          if( vm.pageBtns[1] && vm.pageBtns[1].page !== 2){
             vm.pageBtns.splice(1,0,{"label":"...",page:PREV_GROUP});
          }
          //添加向后跳页按钮
          if( vm.pageBtns.length-2 >= 0 && vm.pageBtns[vm.pageBtns.length-2].page !== vm.totalPage - 1){
            vm.pageBtns.splice(vm.pageBtns.length-1,0,{"label":"...",page:NEXT_GROUP});
          }
    }
    /**前一页 */
    function prevPage(){
        --vm.current;
        //renderPageBtns(vm.current);
        getReviweRecord(vm.current,vm.pageCount);
        $location.path('page='+vm.current);
    }

    /**后一页 */
    function nextPage(){
        ++vm.current;
        //renderPageBtns(vm.current);
        getReviweRecord(vm.current,vm.pageCount);
        $location.path('page='+vm.current);
    }
    /**解析Url参数*/
    function parseUrl(){
        var url= window.location.hash;
        var page = url.match(/[1-9]\d*/g);
        page = parseInt(page);
        return isNaN(page) === true ? 1:page;
    }
    function getReviweRecord(pageNumber,pageCount){
		    var projectName = vm.searchKey;
        var promise = evaProjectListService.getReviweRecord(pageNumber,pageCount,projectName);
        promise.then(function(result){
          $scope.formConfig = result;
          vm.recordCount=result.count;
          vm.totalPage = Math.ceil( vm.recordCount / vm.pageCount ); //计算总页数
          renderPageBtns(vm.current);
        })
        .catch( function(error){
            console.error(error);
        });
        return promise;
    }
    $scope.request=function(id,idd){
       evaProjectListService.request(id,idd);
    }
    $scope.reply=function(id,idd){
       evaProjectListService.reply(id,idd);
    }
    $scope.look=function(id,idd){
       evaProjectListService.look(id,idd);
    }
    $scope.search=function(){
       vm.current = 1;
       getReviweRecord( vm.current, vm.pageCount);
    }
  }
  angular.module("app").component('evaProjectList', component);
})();