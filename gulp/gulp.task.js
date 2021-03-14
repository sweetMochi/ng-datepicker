var config = require('./gulp.config.js'),
	gulp = require('gulp'),
	sass = require('gulp-sass'),
	compass = require('gulp-compass'),
	concat = require('gulp-concat'),
	inject = require('gulp-inject'),
	del = require('del'),
	rename = require('gulp-rename'),
	argv = require('yargs').argv,
	browserSync = require('browser-sync').create(),
	historyFallback = require('connect-history-api-fallback'),
	bom = require('gulp-bom'),
	file = require('gulp-file'),
	sourcemaps = require('gulp-sourcemaps'),
	cleanCSS = require('gulp-clean-css'),
	uglify = require('gulp-uglify-es').default,
	fs = require('fs'),
	runSequence = require('gulp4-run-sequence');

/**
 * 是否為發布狀態
 */
var isProd = false;

// 專案版本
var version = '';


/**
 * 取得專案版本號
 */
function getVersion() {

	/**
	 * 從 package.json 檔案取得專案發佈時版本號
	 */
	function getProdVersion() {
		var pkg = JSON.parse(fs.readFileSync('./package.json'));
		return pkg.version;
	}

	/**
	 * 取得專案開發時隨機版本號(避免cache)
	 */
	function getDevVersion(){
		return (new Date()).getTime();
	}

	// 判斷是否為發佈狀態
	if ( isProd ) {
		version = getProdVersion();
	} else {
		// 為開發狀態
		version = getDevVersion();
	}
	return version;
}


/**
 * 取得共用 js 檔案列表
 */
function getInjectSharedJSList() {
	var arr = [];
	// 預設推入共用bundles
	arr.push(config.dist.js + '/' + config.injectList.bundles.name);
	console.log(arr);
	return arr;
}


/**
 * 環境設置
 * @param list 加入的路徑清單
 */
function environments( list ) {
	if ( isProd ) {
		// 正式環境排除開發設定
		list.push('!' + config.app.path +  '/environments/environment.js');
	} else {
		// 測試環境排除開發設定
		list.push('!' + config.app.path +  '/environments/environment.prod.js');
	}
	return list;
}


/**
 * 調整 fontawesome 到相應資料夾
 */
gulp.task('font', function() {
	// 改變字體檔到 dist 下
	gulp.src(config.vendor.iconFont.fonts)
		.pipe(gulp.dest(config.dist.font));
	// 取得字體樣式檔到sass下
	gulp.src(config.vendor.iconFont.style)
		.pipe(rename({
			basename: '_iconfont',
			extname:'.scss'
		}))
		.pipe(gulp.dest(config.sass.fontFolder));
	return;
});


/**
 * 編譯 SCSS 檔案
 */
gulp.task('sass-compile', function(done) {
	var obj = {};

	// 編譯檔案
	obj = gulp.src(config.sass.list).pipe(
		compass({
			config_file: config.sass.configFile,
			// same value in config.rb
			css: config.dist.css,
			// same value in config.rb
			sass: config.sass.path
	 	})
	 );

	if ( isProd ) {
		obj // 導出編譯後結果(css)
		.pipe(cleanCSS({compatibility: 'ie8'}))
		.pipe(gulp.dest(config.dist.css));
	} else {
		obj // 導出編譯後結果(css)
		// 準備產生sourcemap
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(config.dist.css));
	}

	done();

	return;
});


/**
 * 產生 js 檔案包含現在專案版本
 */
gulp.task('angularjs-version',function(done) {
	var verFileStr = 'app.constant(\'$version\',{ ver:\''+ getVersion() +'\'});';

	file(
		config.app.versionFileName,
		verFileStr, {
			src: true
		}
	).pipe(
		// 在 app 資料夾下新增目錄
		gulp.dest(config.app.path)
	);

	// 完成
	done();
});


/**
 * 合併框架/函式庫/外掛 js
 */
gulp.task('js-bundles', function() {
	// 合併框架/外掛
	return gulp.src(config.injectList.bundles.list)
			// 合併檔案
			.pipe(concat(config.injectList.bundles.name))
			// 導出合併後結果
			.pipe(gulp.dest(config.dist.js));
});


/**
 * 合併 index 使用的 js 檔案
 */
gulp.task('js-index', function() {
	// 合併框架/外掛
	return gulp.src(
			environments(config.injectList.modulesForIndex.list)
		)
		// 合併檔案
		.pipe(concat(config.injectList.modulesForIndex.name))
		// 導出合併後結果
		.pipe(gulp.dest(config.dist.js));
});


/**
 * 壓縮 js 檔案
 */
gulp.task('js-ugly', function() {
	// 處理所有合併後 js 檔案
	return gulp.src(
		config.dist.js + '/**.js'
	).pipe(
		// 壓縮 JS
		uglify({ mangle: false })
	).pipe(
		gulp.dest(
			config.build.path + config.build.js
		)
	);
});


/**
 * sourcemaps 生成
 */
gulp.task('js-sourcemaps', function() {
	return gulp.src(
		config.dist.js + '/**.js'
	).pipe(
		sourcemaps.init()
	).pipe(
		sourcemaps.write('map')
	).pipe(
		gulp.dest(config.dist.js)
	);
});


/**
 * 每次 html 更新時自動刪除 src 下 embed 資料夾
 */
gulp.task('del-embed',function(){
	// 刪除
	return del(
		config.dist.embed
	).then(
		function(paths) {
			console.log('Deleted files/folders:\n', paths.join('\n'));
		}
	);
});


/**
 * 複製各元件需要的 html 到資料夾
 */
gulp.task('html-copy',function(){
	return gulp.src(
		config.app.embedFileList
	).pipe(gulp.dest(
		config.dist.embed
	));
});


/**
 * [index]產生前端在本地測試用的檔案
 */
gulp.task('local-index', function(done) {

	// {read:false},{relative: true} 才不會新增檔案到gulp.dest目錄下

	/**
	 * 宣告 index HTML 路徑
	 */
	var sourceIndex = gulp.src(
		config.app.html.index,
		{
			relative: true
		}
	);


	/**
	 * 宣告樣式路徑
	 */
	var sourceCss = gulp.src(
		[ config.dist.css + '/*.css' ],
		{ read: false },
		{ relative: true }
	);


	/**
	 * 取得所有 JS
	 */
	var sourceIndexJs = [];
	sourceIndexJs = getInjectSharedJSList();
	sourceIndexJs.push(
		config.dist.js + '/' + config.injectList.modulesForIndex.name
	);


	/**
	 * 宣告 JS 路徑
	 */
	var sourceJs = gulp.src(
		sourceIndexJs,
		{ read: false },
		{ relative: true }
	);

	gulp.src(config.app.html.layout)
		.pipe(inject(
			sourceIndex,
			{
				starttag: '<!-- injects:html -->',
				removeTags: true,
				transform: function(filepath, file) {
					return file.contents.toString('utf8');
				}
			}
		))
		.pipe(bom())
		.pipe(rename({
			basename: 'Index',
		}))
		.pipe(inject(
			sourceCss,
			{
				name: 'devCSS',
				removeTags: true,
				addSuffix: '?' + getVersion()
			}
		))
		.pipe(inject(
			sourceJs,
			{
				name: 'devJS',
				removeTags: true,
				addSuffix: '?' + getVersion()
			}
		))
		.pipe(
			gulp.dest(config.local.path)
		);
	done();
	return;
});


/**
 * 建置統一 js
 */
gulp.task('build-js',function(done){
	if ( isProd ) {
		runSequence(
			'angularjs-version',
			[
				'js-bundles',
				'js-index'
			],
			'js-ugly'
		);
	} else {
		runSequence(
			'angularjs-version',
			[
				'js-bundles',
				'js-index'
			],
			'js-sourcemaps'
		);
	}
	done();
});


/**
 * 建置 html
 */
gulp.task('build-html',function(done) {
	runSequence(
		'font',
		'del-embed',
		'html-copy'
	);
	done();
});


/**
 * [build] 每次更新時自動刪除的前端資料夾
 */
gulp.task('build-del', function( done ) {
	// 路徑配置前綴
	var path = config.build.del.map( function(item) {
		return config.build.path + '/' + item + '/**';
	});
	// 強制刪除，這樣才能刪除專案以外的資料夾
	del(path, { force: true });
	done();
});


gulp.task('serve', gulp.series('build-js', 'sass-compile', 'build-html', 'local-index', function(done) {

	// 瀏覽器是否要產生外部連結 (可以手機上看)
	var brSyncOnline = (argv.online) ? true : false;

	// 判斷是否為發佈狀態
	isProd = (argv.prod) ? true : false;

	// 取得專案版本號
	getVersion();

	//啟動瀏覽器同步，一邊開發一邊監看瀏覽器畫面
	//ref: https://github.com/bripkens/connect-history-api-fallback
	//		 http://thomastuts.com/blog/browsersync-spa-routing-pretty-urls.html
	//		 https://vinaygopinath.me/blog/tech/url-redirection-with-browsersync/
	browserSync.init({
		files: [config.local.path + '/**.html'],
		// 預設為false
		online: brSyncOnline ,
		server: {
			baseDir: [
				config.local.path,
				"./"
			],
			// 開啟本地端測試
			middleware: [
				historyFallback(
					{
						index: config.serve.initPath
					}
				)
			]
		},
		port: 3001,
		cors: true
	});
	// 監聽版本號是否改變
	gulp.watch(
		'./package.json',
		gulp.series('build-js')
	);
	// 監聽 js 檔案
	gulp.watch(
		[
			config.app.path + '/**/*.js',
			// 避免自動生成 version.js，產生迴圈
			'!' + config.app.path + '/version.js'
		],
		gulp.series('build-js')
	);
	// 監聽 scss 檔案
	gulp.watch(
		config.sass.path + '/**/*.scss',
		gulp.series('sass-compile')
	);
	// 監聽 html 檔案
	gulp.watch(
		config.app.embedFileList,
		gulp.series('build-html')
	);

	// 重新整理browserSync
	gulp.watch(
		[
			config.dist.css + '/*.css',
			config.dist.embed + '/**/*.html',
			config.local.path + '/*.html',
			config.dist.js + '/**/*.js',
			config.dist.lang + '/*.json'
		]
	).on('change', browserSync.reload ).on('error', function( err ) {
		// 需加上error 事件 windows os 才可以使用
		console.log( err );
	});

	done();

}));
