app.directive("datepickerPanel", ["$window", function($window) {
return {
	scope: {
		init: "="
	},
	link: function ($scope, $element, $attrs, dpCtrl) {

		// [V] 當前月曆的編號
		// 避免多個月曆變數混用
		$scope.id = null;

		// [V] 月曆 UI 資料
		$scope.see = [];

		// [V] 月曆每日資訊
		$scope.seeDate = [];

		// [V] 月曆每日暫存
		$scope.seePush = null;

		// [V] 年份範圍
		$scope.selectYearRange = 10;

		// [V] 日期選擇
		$scope.selectYear = [];
		$scope.selectMonth = [];

		// [V] 日期範圍
		$scope.range = null;

		// [V] 輸入框與月曆間距
		$scope.space = 10;

		// [V] 輸入日期（字串）
		$scope.sdate = null;

		// [V] 最小日期（字串）
		$scope.min = null;

		// [V] 最大日期（字串）
		$scope.max = null;

		// [V] 當前日期（日期格式）
		$scope.date = new Date();

		// [V] 最小日期（日期格式）
		$scope.dateMin = null;

		// [V] 最大日期（日期格式）
		$scope.dateMax = null;

		// [V] 今天日期（固定值）
		$scope.now = new Date();

		// [V] 星期簡寫
		$scope.week = ["Sun", "Mon", "Tus", "Wed", "Thr", "Fir", "Sat"];

		// [V] 月曆浮動位置
		$scope.offset = {
			top: 0,
			left: 0
		};

		// [V] 月曆是否啟動
		$scope.active = false;

		// [V] 月曆高度
		$scope.height = 0;

		/**
		 * [F] 日期格式化
		 * @param  {Number} [*][y] 年份
		 * @param  {Number} [*][m] 月份
		 * @param  {Number} [*][d] 日期
		 * @return {String} 年份格式：2018-02-01
		 */
		function format (y, m, d) {
			return y + $scope.split + ("00" + m).slice(-2) + $scope.split + ("00" + d).slice(-2);
		}

		/**
		 * [F] 更新月曆
		 * @param  {Boolean} init 是否為 init 事件
		 * @return {Boolean} return true
		 */
		$scope.update = function(init) {

			// 清空陣列
			$scope.seeDate = [];

			// [V] 製作月曆當前範圍的資訊
			// getMonth 起始數值為 0（ 1 月  = 0 ）
			// new Date(y, m, d) d 為 0 表示為上個月的最後一天
			$scope.see = {
				year: $scope.date.getFullYear(),
				month: $scope.date.getMonth(),
				day: $scope.date.getDate(),
				// 補充天數，使月曆固定有 49 格
				sup: 0,
				// 當月最大天數
				max: new Date($scope.date.getFullYear(), $scope.date.getMonth() + 1 , 0).getDate(),
				// 上個月的日期
				preMonth: new Date($scope.date.getFullYear(), $scope.date.getMonth(), 1).getDay(),
				// 下個月的日期
				nextMonth: new Date($scope.date.getFullYear(), $scope.date.getMonth() + 1, 0).getDay()
			};

			// 如果月曆週數小於 6 周
			if ( $scope.see.max + $scope.see.preMonth + ( 6 - $scope.see.nextMonth ) < ( 7 * 6 ) ) {

				// 補充天數增加 1 周
				$scope.see.sup = 7;

			}

			// 依照星期，補齊上個月的天數
			// out: 不是當前月的日期
			// now: 今天日期
			for (var i = $scope.see.preMonth - 1; i >= 0 ; i--) {

				// 日期計算，年份有跨年判斷
				$scope.seePush = {
					y: (new Date($scope.see.year, $scope.see.month - 1).getMonth() + 1) === 12 ? $scope.see.year - 1 : $scope.see.year,
					m: new Date($scope.see.year, $scope.see.month - 1).getMonth() + 1,
					d: new Date($scope.see.year, $scope.see.month, 0 - i).getDate(),
					w: new Date($scope.see.year, $scope.see.month, 0 - i).getDay(),
					now: new Date($scope.see.year, $scope.see.month, 0 - i).setHours(0, 0, 0, 0)
				};

				//  加入日曆
				$scope.seeDate.push({
					date: format($scope.seePush.y, $scope.seePush.m, $scope.seePush.d),
					y: $scope.seePush.y,
					m: $scope.seePush.m,
					d: $scope.seePush.d,
					w: $scope.seePush.w,
					out: true,
					off: ( $scope.dateMin && $scope.seePush.now < $scope.dateMin.setHours(0, 0, 0, 0)) || ($scope.dateMax && $scope.seePush.now > $scope.dateMax.setHours(0, 0, 0, 0))
				});
			}

			// 製作當月的月曆天數
			for (var j = 0; j < $scope.see.max; j++) {

				// 日期計算
				$scope.seePush = {
					y: $scope.see.year,
					m: $scope.see.month + 1,
					d: j + 1,
					w: new Date($scope.see.year, $scope.see.month, j + 1).getDay(),
					now: new Date($scope.see.year, $scope.see.month, j + 1).setHours(0, 0, 0, 0),
					sdate: new Date($scope.sdate).setHours(0, 0, 0, 0)
				};

				//  加入日曆
				$scope.seeDate.push({
					date: format($scope.seePush.y, $scope.seePush.m, $scope.seePush.d),
					y: $scope.seePush.y,
					m: $scope.seePush.m,
					d: $scope.seePush.d,
					w: $scope.seePush.w,
					sdate: $scope.seePush.now === $scope.seePush.sdate,
					off: ( $scope.dateMin && $scope.seePush.now < $scope.dateMin.setHours(0, 0, 0, 0)) || ($scope.dateMax && $scope.seePush.now > $scope.dateMax.setHours(0, 0, 0, 0))
				});
			}

			// 依照星期，補齊下個月的天數
			for (var k = 0; k < 6 - $scope.see.nextMonth + $scope.see.sup; k++) {

				// 日期計算，年份有跨年判斷
				$scope.seePush = {
					y: (new Date($scope.see.year, $scope.see.month + 1).getMonth() + 1) === 1 ? $scope.see.year + 1 : $scope.see.year,
					m: new Date($scope.see.year, $scope.see.month + 1).getMonth() + 1,
					d: k + 1,
					w: new Date($scope.see.year, $scope.see.month + 1 , k + 1).getDay(),
					now: new Date($scope.see.year, $scope.see.month + 1, k + 1).setHours(0, 0, 0, 0)
				};

				//  加入日曆
				$scope.seeDate.push({
					date: format($scope.seePush.y, $scope.seePush.m, $scope.seePush.d),
					y: $scope.seePush.y,
					m: $scope.seePush.m,
					d: $scope.seePush.d,
					w: $scope.seePush.w,
					out: true,
					off: ( $scope.dateMin && $scope.seePush.now < $scope.dateMin.setHours(0, 0, 0, 0)) || ($scope.dateMax && $scope.seePush.now > $scope.dateMax.setHours(0, 0, 0, 0))
				});

			}

		};

		/**
			* [E] 初始化事件
			* @param  {Number} id				月曆編號
			* @param  {String} split		分隔符號
			* @param  {String} sdate		開始日期
			* @param  {String} max 			最大日期
			* @param  {String} min 			最小日期
			* @param  {Boolean} active 	啟動變數
			* @param  {Funciton} pass		回調函式
			* @param  {Object} offset		輸入框數據
			* {x[Number], y[Number], height[Number]}
			* @return {Boolean} 回傳 true
		*/
		$scope.init = function(data) {

			// 資料置入
			Object.assign($scope, data);

			// 如果有設定最小日期
			$scope.dateMin = data.min ? new Date(data.min) : null;

			// 如果有設定最大日期
			$scope.dateMax = data.max ? new Date(data.max) : null;

			// 如果有設定最小日期，並且今天日期小於最小日期
			if ( $scope.dateMin && $scope.now <= $scope.dateMin ) {

				// 設定今天日期及月曆日期為最小日期
				$scope.now = angular.copy($scope.dateMin);
				$scope.date = angular.copy($scope.dateMin);

				// 設定輸入日期為最小日期
				$scope.sdate = data.min;

			}

			// 如果有設定最大日期，並且今天日期大於最大日期
			if ( $scope.dateMax && $scope.now >= $scope.dateMax ) {

				// 設定今天日期及月曆日期為最大日期
				$scope.now = angular.copy($scope.dateMax);
				$scope.date = angular.copy($scope.dateMax);

				// 設定輸入日期為最大日期
				$scope.sdate = data.max;

			}

			// 更新當前月曆
			$scope.update();

			// [V] 日期選擇重置
			$scope.selectYear = [];
			$scope.selectMonth = [];

			// [V] 日期範圍重置
			$scope.range = {
				year: {
					min: 0 - $scope.selectYearRange,
					max: $scope.selectYearRange
				},
				month: {
					min: 0,
					max: 12
				}
			};

			// 如果有最小日期，限制年份選單
			$scope.range.year.min = $scope.dateMin ? $scope.dateMin.getFullYear() - $scope.date.getFullYear() : $scope.range.year.min;

			// 如果有最大日期，限制年份選單
			$scope.range.year.max = $scope.dateMax ? $scope.dateMax.getFullYear() - $scope.date.getFullYear() + 1 : $scope.range.year.max;

			// 產生年份選單
			for (var i = $scope.range.year.min; i < $scope.range.year.max; i++) {
				$scope.selectYear.push({
					val : $scope.date.getFullYear() + i,
					title: ($scope.date.getFullYear() + i)
				});
			}

			// 產生月份選單
			for (var j = $scope.range.month.min; j < $scope.range.month.max; j++) {
				$scope.selectMonth.push({
					val: j,
					title: ( j + 1 )
				});
			}

			// 加上輸入框間距
			$scope.offset.top = $scope.offset.top + $scope.space;

			// 觸發顯示更新
			$scope.$digest();

			// 在月曆顯示後更新高度資料
			$scope.height = angular.element(document.querySelector(".datepicker-panel"))[0].offsetHeight;

			// 如果月曆顯示時，超過螢幕範圍
			if ( $scope.offset.top + $scope.height > $window.innerHeight ) {

				// 更新顯示位置為輸入框向上彈出
				$scope.offset.top = $scope.offset.top - $scope.height - $scope.space * 2 - $scope.offset.height;

				// 觸發顯示更新
				$scope.$digest();
			}
		};

		/**
			* [E] 傳遞日期參數
			* @param  {String} sdate 開始日期
			* @return {Boolean} 回傳 true
		*/
		$scope.pick = function(sdate) {

			// 如果未輸入日期
			if ( !sdate ) {
				return;
			}

			// 設定開始日期
			$scope.sdate = sdate || $scope.now.toJSON().slice(0,10);

			// 驗證日期格式
			if ( $scope.isDate($scope.sdate.split($scope.split).join("-")) ) {

				// 當前日期更新為輸入日期
				$scope.date = new Date($scope.sdate);

				// 如果日期小於年份範圍
				if ( $scope.date.getFullYear() < $scope.now.getFullYear() - $scope.selectYearRange ) {
					// 年份改為減去年份範圍
					$scope.date.setFullYear($scope.now.getFullYear() - $scope.selectYearRange, 1, 1);

				// 如果日期大於年份範圍
				} else if ( $scope.date.getFullYear() > $scope.now.getFullYear() + $scope.selectYearRange ) {
					// 年份改為加上年份範圍
					$scope.date.setFullYear($scope.now.getFullYear() + $scope.selectYearRange, 12, 31);
				}

				// 更新小月曆
				$scope.update();

				// 傳送當前日期到輸入框
				$scope.pass({
					sdate: $scope.sdate,
					id: $scope.id
				});

			} else {
				console.log("[directive:datepicker] Date is not valid.");
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
		 * [F] 月曆是否顯示
		 * @return {Boolean} 回傳 true
		 */
		$scope.show = function(active) {
			$scope.active = active;
			return true;
		};

		/**
		 * [F] 變更年份
		 * @param  {Number} year 年分
		 * @return {Boolean} return true
		 */
		$scope.changeYear = function(year) {

			// 如果有傳入年份（手動選擇）
			if ( year ) {
				$scope.date.setFullYear($scope.see.year);
				$scope.update();
			}

		};

		/**
		 * [F] 變更月份
		 * @param  {Number} year 年分
		 * @return {Boolean} return true
		 */
		$scope.changeMonth = function(m) {
			if ( m < 0 ) {
				$scope.date.setMonth($scope.date.getMonth() - 1);
			} else if ( m == 1 ) {
				$scope.date.setMonth($scope.date.getMonth() + 1);
			} else {
				$scope.date.setMonth($scope.see.month);
			}
			$scope.update();
		};

		// [E] 頁面切換事件
		$scope.$root.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
			// 隱藏選擇日期功能
			$scope.active = false;
		});

	},
	template: '' +
		'<div class="datepicker-mask" ng-class="{\'datepicker-panel--active\': active }" ng-click="show(false)"></div>' +
		'<div class="datepicker-panel" ng-class="{\'datepicker-panel--active\': active }" ng-style="{ \'top\': offset.top + \'px\', \'left\': offset.left + \'px\' }">' +
			'<div class="datepicker-panel-wrap">' +
				'<div class="datepicker-panel-header">' +
					'<button class="datepicker-btn datepicker-btn-prev" ng-click="changeMonth(-1)"><i class="fa fa-chevron-left"></i></button>' +
					'<div class="datepicker-select">' +
						'<select ng-options="op.val as op.title for op in selectYear" ng-model="see.year" ng-change="changeYear(see.year)"></select>' +
						'<span ng-bind="see.year"></span>' +
					'</div>' +
					'<div class="datepicker-select">' +
						'<select ng-options="op.val as op.title for op in selectMonth" ng-model="see.month" ng-change="changeMonth()"></select>' +
						'<span ng-bind="see.month + 1"></span>' +
					'</div>' +
					'<button class="datepicker-btn datepicker-btn-next" ng-click="changeMonth(1)"><i class="fa fa-chevron-right"></i></button>' +
				'</div>' +
				'<div class="datepicker-panel-body">' +
					'<table>' +
						'<thead><tr><th ng-repeat="th in week" ng-bind="th"></th></tr></thead>' +
						'<tbody><tr ng-repeat="td in seeDate" ng-if="$index % 7 == 0" ng-init="inner = $index">' +
							'<td ' +
								'ng-repeat="n in [0,1,2,3,4,5,6]" ' +
								'ng-class="{\'datepicker-date-out\': seeDate[inner + n].out, \'datepicker-date-sdate\': seeDate[inner + n].sdate, \'datepicker-date-off\': seeDate[inner + n].off }" ' +
								'ng-bind="seeDate[inner + n].d" ' +
								'ng-click="pick(seeDate[inner + n].off ? false : seeDate[inner + n].date)" ' +
							'></td>' +
						'</tr><tbody>' +
					'</table>' +
				'</div>' +
			'</div>' +
		'</div>'
	};
}]);
