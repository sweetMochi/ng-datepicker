app.controller("indexCtrl", ["$rootScope", "$scope", "$state", "$stateParams", "$http", "$q", "$timeout",
function($rootScope, $scope, $state, $stateParams, $http, $q, $timeout ) {
	var index = this;

	/** 小月曆串接 */
	index.datepicker = null;

	/** 日期 */
	index.date = null;

	/**
	 * [E] 小月曆全域事件
	 */
	$scope.$on("datepicker", function(event, data) {
		index.datepicker(data);
	});

	index.$onInit = function () {
	};

}]);
