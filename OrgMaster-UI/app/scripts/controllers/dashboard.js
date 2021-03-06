'use strict';
angular.module('orgMasterUiApp')
  .controller('DashboardController', ['$scope','$rootScope', '$state','$stateParams', '$http', 'ajaxService', 'userAuthService', 'Upload', 'host', 'DailogService',function ($scope,$rootScope,$state,$stateParams, $http, ajaxService, userAuthService, Upload, host, DailogService) {
		$scope.user = {};
		$scope.user.excel = {};
		$scope.showUploadMsg=true;
		$scope.showUploadFiles=false;
		$scope.no_docs_edit=false;
		$scope.userAuthData = $stateParams.userAuthData||{};
		console.log($scope.userAuthData);
		$(document).ready(function () {
		    // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
		    $('.modal').modal();
		  });

		if($stateParams.doc_id && $stateParams.doc_id!=''){
			$rootScope.user.current_doc_id = $stateParams.doc_id ;
		}
		$scope.uploadDoc = function () {
    	$('#modal1').modal('open');
		};
		

		//http://localhost:3000/records?user_id=Preetham&doc_id=586abc0577f1a42e747e9489
 //records_all?doc_id=586ddd8dd63b2e598eb90791
		$scope.fetchUserSpecificData = function (user_id,doc_id) {

			if(user_id &&  doc_id){
				ajaxService('get', '/records?user_id='+user_id+'&doc_id='+doc_id+'').then(function onSuccess(response) {
				console.log(response);
				$scope.user.excelData = response.data;
				$scope.fetchHeaders($scope.user.excelData);
				$scope.initSheet();
    		}, function onFailure(err) {
				console.error(err);
    		});
			}else{
				$scope.no_docs_edit=true;
			}
    		

		};
		
		$scope.fetchDocNameById=function(){
			if($rootScope.user.current_doc_id && $rootScope.user.current_doc_id!=''){
				var url="/doc?id="+$rootScope.user.current_doc_id;
				ajaxService('get',url).then(function(response){
					if(response && response.data && angular.isArray(response.data) && response.data.length>0){
						$scope.user.docname = response.data[0].fileName || "anonymous document";
					}
					//console.log(response.data);
				},function(err){
					console.log(err);
				})
			}
			
		}
		//if($stateParams.doc_id && $stateParams.doc_id!=''){
			
			$scope.fetchDocNameById();
		//}
		

		$scope.initSheet = function () {

    		for (var i in $scope.user.excelData) {
				var defaultSheet = i;
				break;
    		}
    		if (defaultSheet) {
				$scope.selectSheet(defaultSheet, undefined, 0);
    		}
		}


		$scope.fetchHeaders = function (exceldata) {
    		$scope.user.excel.headers = {};

    		for (var sheet in exceldata) {
				var sheetData = exceldata[sheet];
				console.log(sheetData);
				$scope.user.excel.headers[sheet] = [];
				console.log(sheet);
    			 for (var row in sheetData) {
					var rows = sheetData[row]
    			 		for (var header in rows) {
						if ($scope.user.excel.headers[sheet].indexOf(header) <= -1) {
							$scope.user.excel.headers[sheet].push(header);
						}

					}

    			 }
    		}
    		console.log($scope.user.excel.headers)
		}
		$scope.selectSheet = function (sheet, $event, index) {
    		if ($event) { $event.preventDefault(); };
    		$scope.activeLink = index;
				$scope.currentSheetName=sheet;
    		$scope.tableHeaders = $scope.user.excel.headers[sheet];
    		$scope.user.tableRowData = $scope.user.excelData[sheet];
    		for (var rowData in $scope.user.tableRowData) {
				var properties = [];
    				for (var property in $scope.user.tableRowData[rowData]) {
					properties.push(property);
					// 	if($scope.tableHeaders.indexOf(property)<=-1){
					// 	$scope.user.tableRowData[rowData][property]=undefined;
					// }
    				}
    				//to add all the properties in headers to all objects , for objs that doesnt contain the property, its made undefined
    				var leftOverProperty = _.difference($scope.tableHeaders, properties);
    				if (angular.isArray(leftOverProperty) && leftOverProperty.length > 0)
					for (var ele in leftOverProperty) {
						$scope.user.tableRowData[rowData][leftOverProperty[ele]] = undefined;


					}

    		}
    		console.log("tableHeaders" + JSON.stringify($scope.tableHeaders));
    		console.log("tableRowData" + JSON.stringify($scope.user.tableRowData));

    		console.log($scope.user.tableRowData);

		}


//if($stateParams.doc_data && $stateParams.doc_data!=null){
//			var excelContent= JSON.parse($stateParams.doc_data.exceldata);
//			$scope.user.docname=$stateParams.doc_data.filename;
//				$scope.user.excelData = excelContent;
//				$scope.fetchHeaders($scope.user.excelData);
//				$scope.initSheet();
//		}else{
			$scope.fetchUserSpecificData($scope.userAuthData.username,$rootScope.user.current_doc_id);//$rootScope.user.current_doc_id
//		} 


		$scope.saveChanges=function(modal_id){
			var sheet= $scope.currentSheetName
			$scope.user.excelData[sheet]=$scope.user.tableRowData;
			console.log("updateddata");
			console.log($scope.user.excelData);
			var url  = host+'/records?user_id='+$scope.userAuthData.username+'&doc_id='+$rootScope.user.current_doc_id;//+doc_id;
			$http.post(url,$scope.user.excelData).then(function(response){
				console.log(response);
				if(modal_id){
					$('#'+modal_id).modal('close');	
					
				}
				 var $toastContent = $('<span>Data saved successfully!</span>');
				  Materialize.toast($toastContent, 3000);
				
				//$scope.
			},function(err){
				if(modal_id){
					$('#'+modal_id).modal('close');	
					
				}
				var $toastContent = $('<span>Oops! Action failed.</span>');
				  Materialize.toast($toastContent, 3000);
				console.log(err)
			})
			//ajaxService('put', '/records?user_id='+user_id+'&doc_id='+doc_id+'')
			
		}

		$scope.editRow=function($event,row){
			if($event)$event.preventDefault();
			$scope.edit={};
			$scope.edit.rowData=row;
			$('#rowEditModal').modal('open');
			
			

		}
		$scope.addRow=function($event){
			if($event){$event.preventDefault();};
//			$scope.currentSheetName;
//			$scope.tableHeaders;
			var newRow={};
			var prop;
			for(var i in $scope.tableHeaders){
				//if(){
				prop = $scope.tableHeaders[i];
				newRow[prop]=undefined;
				//}
			}
			$scope.user.tableRowData.push(newRow);
			
		};
		
		$scope.isEmptyRow=function(rowData){
			for(var i in $scope.tableHeaders){
				var prop = $scope.tableHeaders[i]; //taking the headers as refer and checking if all the values corresponding to these headers in the row are empty
				if(rowData[prop]==undefined ||rowData[prop]=="" || rowData[prop]==" "
					|| rowData[prop] == null || rowData[prop] =="undefined" 
						|| rowData[prop] =="null"){
					return true;
				}else{
					return false;
				}
			}
		}
		
		$scope.deleteEmptyRow=function(row_index,$event){
			try{
				$event.preventDefault();
				if($scope.user.tableRowData && angular.isArray($scope.user.tableRowData) && $scope.user.tableRowData.length>0){
					$scope.user.tableRowData.splice(row_index,1);
				}
				
				
			}catch(err){
				console.error(err);
			}
			
		}
		//upload files


    $scope.submit = function () {
      if ($scope.form.file.$valid && $scope.file) {
        $scope.upload($scope.file);
        console.log($scope.file);
      }
    };

    // upload on file select or drop
		$scope.uploadedFiles=[];
		$scope.uploadedPercent={};
    $scope.upload = function (file) {
			if (file) {
				var uploadUrl = host + "/parseUpload?user_id=Preetham"; //change
        Upload.upload({
					url: uploadUrl,
					data: { file: file, 'username': 'Preetham' } //change
        }).then(function (resp) {
					console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
					$scope.uploadedFiles.push({"name":resp.config.data.file.name,"fileDetails":resp.data});
						$scope.showUploadFiles=true;
						$scope.showUploadMsg=false;
        }, function (resp) {
					console.log('Error status: ' + resp.status);
        }, function (evt) {
					var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
					$scope.uploadedPercent[evt.config.data.file.name.replace(' /g',"")]=progressPercentage;
					console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });
			}

    };
    // for multiple files:
    $scope.uploadFiles = function (files) {
      if (files && files.length) {
        for (var i = 0; i < files.length; i++) {
          Upload.upload({ data: { file: files[i] } });
        }
        // or send them all together for HTML5 browsers:
        //Upload.upload({..., data: {file: files}, ...})...;
      }
    }


		$scope.clearUploadedFile=function($event){
			$event.preventDefault();
			$scope.uploadedFiles=[];
			$scope.showUploadFiles=false;
			$scope.showUploadMsg=true;

		}
		
  }]);
