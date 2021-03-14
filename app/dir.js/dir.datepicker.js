/*

用法：
input
	[ng-model]
	[split]
	[form]
	[max]
	[min]

注意：只能用在 input 上
split: 		[String]	分隔符號
form: 		[Object]	驗證物件
max: 			[Array]		最大日期
min: 			[Array]		最小日期

*/
app.directive("datepicker", function() {
	return {
		restrict: "A",
		scope: {
			ngModel: "=",
			split: "=?",
			form: "=?",
			max: "=?",
			min: "=?"
		},
		link: function ($scope, $element, $attrs) {

			// [V] 輸入框空間參數
			$scope.position = null;

			/**
				* [E] 傳遞日期參數
				* @param  {String} [data]			從小月曆回傳的資料
					* @param  {String} [id]			元件系統編號
					* @param  {String} [sdate]	小月曆輸入的日期
				* @return {Boolean} 回傳 true
			*/
			$scope.pass = function(data) {

				// 如果欄位 ID 相同
				if ( data.id == $scope.$id ) {
					// 更新輸入欄位日期
					$scope.ngModel = data.sdate;

					// 如果有驗證表單
					if ( $scope.form ) {

						// 設定驗證已通過
						$scope.form.$setValidity("date", true);

					}
				}
			};

			/**
				* [F] 檢查是否為正確日期格式
				* @param  {Object} d
				* @return {Boolean} 回傳 true 或 false
			*/
			$scope.isDate = function (d) {

				d = new Date(d);

				if (Object.prototype.toString.call(d) === "[object Date]") {
					// it is a date
					if ( isNaN(d.getTime()) ) {  // d.valueOf() could also work
						// date is not valid
						return false;
					} else {
						return true;
						// date is valid
					}
				} else {
					// not a date
					return false;
				}
			};

			/**
				* [F] 驗證日期
				* @return {Void}
			*/
			$scope.dateOk = function() {

				// 如果有引入表單
				if ( $scope.form ) {

					// 輸入為正確的日期格式
					if ( $scope.isDate($scope.ngModel) ) {

						// 設定驗證已通過
						$scope.form.$setValidity("date", true);

						// 如果有設定最小日期
						if ( $scope.min ) {

							// 如果輸入日期小於「最小日期」
							if ( new Date($scope.ngModel) < new Date($scope.min) ) {

								// 設定「最小日期」驗證未通過
								$scope.form.$setValidity("dateMin", false);

							} else {

								// 設定「最小日期」驗證已通過
								$scope.form.$setValidity("dateMin", true);

							}

						}

						// 如果有設定最大日期
						if ( $scope.max ) {

							// 如果輸入日期大於「最大日期」
							if ( new Date($scope.ngModel) > new Date($scope.max) ) {

								// 設定「最大日期」驗證未通過
								$scope.form.$setValidity("dateMax", false);

							} else {

								// 設定「最大日期」驗證已通過
								$scope.form.$setValidity("dateMax", true);

							}

						}

					} else {

						// 設定驗證不通過
						$scope.form.$setValidity("date", false);
					}

				}
			};

			// [E] 輸入框使用事件
			$element.on("focus", function($event) {

				// 驗證日期
				$scope.dateOk();

				// 元件保護：驗證輸入日期格式
				if ( $scope.ngModel && !$scope.isDate($scope.ngModel) ) {
					console.log("[directive:datepicker] Attr ng-model need date formate.");
					return;
				}

				// 元件保護：驗證輸入日期格式
				if ( $scope.max && !$scope.isDate($scope.max) ) {
					$scope.max = null;
					console.log("[directive:datepicker] Attr max need date formate.");
				}

				// 元件保護：驗證輸入日期格式
				if ( $scope.min && !$scope.isDate($scope.min) ) {
					$scope.min = null;
					console.log("[directive:datepicker] Attr min need date formate.");
				}

				// 元件保護：如果最小日期大於最大日期
				if ( $scope.min && $scope.max && (new Date($scope.min) > new Date($scope.max)) ) {
					console.log("[directive:datepicker] Attr min must less then max value.");
					return;
				}

				// 取得空間參數
				$scope.position = $event.target.getBoundingClientRect();

				// 透過 index 打開 datepicker
				$scope.$emit("datepicker", {
					id: $scope.$id,
					sdate: $scope.ngModel ? $scope.ngModel : new Date().toJSON().slice(0,10),
					split: $scope.split ? $scope.split : "-",
					max: $scope.max ? $scope.max : null,
					min: $scope.min ? $scope.min : null,
					pass: $scope.pass,
					active: true,
					offset: {
						top: $scope.position.y + $element.prop("offsetHeight"),
						left: $scope.position.x,
						space: $scope.space,
						height: $element.prop("offsetHeight")
					}
				});
			});

			// [E] 移出輸入框事件
			$element.on("blur", function($event) {

				// 驗證日期
				$scope.dateOk();

				// 如果驗證未通過
				if ( $scope.form && $scope.form.$invalid ) {

					// 設定為空
					$scope.ngModel = null;

				}

			});
		}
	};
});
