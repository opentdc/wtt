'use strict';

angular.module('wtt')
.controller('WttListCtrl', function ($scope, $log, $http, uiGridConstants, $translate, $translatePartialLoader, cfg) {
	cfg.GENERAL.CURRENT_APP = 'wtt';
	$translatePartialLoader.addPart('wtt');
	$log.log('WttCtrl/cfg = ' + JSON.stringify(cfg, null, '\t'));

	$scope.msg = {};

	$scope.gridOptions = {
		minRowsToShow: 20,
		enableSorting: true,
		enableFiltering: true,
		enableHiding: true,
		enableColumnMenus: true,
		enableGridMenu: true,
		// pagingPageSizes: [25, 50, 75],
		// pagingPageSize: 25,
		enableCellEdit: true,
		enableSelectAll: true,
		// csv export -> not working, default 'download.csv' is taken
		// exporterCsvFilename: 'wtt.csv',

		columnDefs: [
			{	name: 'identity', field: 'identity', displayName: 'id', visible: false },
			{ 	name: 'name', field: 'name', displayName: 'Name', visible: true, width: '*' },
			{ 	name: 'description', field: 'description', displayName: 'Description', visible: true, width: '*' }
		],
		exporterCsvLinkElement: angular.element(document.querySelectorAll('.custom-csv-link-location')),

		onRegisterApi: function(gridApi) {
			$scope.gridApi = gridApi;
			gridApi.edit.on.afterCellEdit($scope, function(rowEntity, colDef, newValue, oldValue) {
				$scope.msg.lastCellEdited = 'edited row id: ' + rowEntity.id + ' Column: ' + colDef.name + ' newValue: ' + newValue + ' oldValue: ' + oldValue;
				$scope.apply();
			});
		}
	};

	// TODO: export visible / all data as csv / pdf
	// TODO: import data
	// TODO: add / remove rows
	// TODO: update/edit rows inline
	// TODO: translate the columni headers ->  displayName = $translate.instant('ColDate')
	// TODO: implement tests on test data
	var OPENCRX_URI = 'http://demo.opencrx.org:80/opencrx-rest-CRX/org.opencrx.kernel.activity1';
	var OPENCRX_PROVIDER = 'CRX'; 
	var OPENCRX_MANDANT = 'Standard';
	var _wttListUri = 	OPENCRX_URI + 
						'/provider/' + OPENCRX_PROVIDER + 
						'/segment/' + OPENCRX_MANDANT + '/activityTracker';

	var _promise = $http({
		method: 'GET',
		url: 	_wttListUri,
		headers: { 
			'Content-Type': 'application/json',
			'Authorization': 'Basic ' + btoa('guest:guest')
		}
	});

	_promise.success(function(data, status) {
		$log.log('**** SUCCESS: GET(' + _wttListUri + ') returns with ' + status);
		$log.log('data.length=' + data.length); // + ', data.objects.length=' + data.objects.length);
		for(var i=0; i < data.objects.length; i++) {
			$log.log('******* data[' + i + ']: ' + data.objects[i].name);
		}
		$scope.gridOptions.data = data.objects;
    	//$log.log('data=<' + data + '>');
	});

	_promise.error(function(data, status) {
  		// called asynchronously if an error occurs or server returns response with an error status.
    	$log.log('**** ERROR:  GET(' + _wttListUri + ') returns with ' + status);
    	$log.log('data=<' + data + '>');
  	});	

  	$scope.export = function() {
  		if ($scope.exportFormat === 'csv') {
  			var myElement = angular.element(document.querySelectorAll('.custom-csv-link-location'));
  			$scope.gridApi.exporter.csvExport($scope.exportRowType, $scope.exportColumnType, myElement);
  		} else if ($scope.exportFormat === 'pdf') {
  			$scope.gridApi.exporter.pdfExport($scope.exportRowType, $scope.exportColumnType);
  		} else {
  			$log.log('**** ERROR: PresentsListCtrl.export(): unknown exportFormat: ' + $scope.exportFormat);
  		}
  	};
});

