module.exports = {
	// 函式庫,外掛,框架
	vendor: {
		// 圖形自行安裝路徑
		iconFont: {
			fonts: './vendor/font-awesome/fonts/*',
			style: './vendor/font-awesome/css/font-awesome.css'
		}
	},
	dist: {
		font: './dist/fonts',
		js: './dist/js',
		lang: './dist/lang',
		css: './dist/css',
		img: './dsit/img',
		embed: './dist/embed'
	},
	build: {
		path: '../prod',
		js: '/dist/js',
		cshtml: './**/*.cshtml',
		del: [
			'app',
			'cshtml',
			'dist',
			'gulp',
			'local',
			'sass'
		],
		exculed: {
			vendor: './vendor/**',
			node: './node_modules/**'
		}
	},
	sass: {
		fontFolder: './sass/vendor',
		list: './sass/*.scss',
		configFile: './config.rb',
		path: './sass'
	},
	app: {
		path: './app',
		versionFileName: 'version.js',
		embedFileList: [
			'./app/**/*.html'
		],
		html: {
			src: './app/main/*.html',
			layout: './app/main/Layout.html',
			index: './app/main/Index.html'
		}
	},
	// 合併js檔案方式
	injectList: {
		// 函式庫,外掛,框架注入順序
		bundles: {
			name: 'app.bundles.js',
			list: [
				'./vendor/angular/angular.min.js',
				'./vendor/angular-ui-router/release/angular-ui-router.min.js',
				'./vendor/angular-cookies/angular-cookies.js',
				'./vendor/angular-translate/angular-translate.js',
				'./vendor/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
			]
		},
		// 登入後模組
		modulesForIndex: {
			name: 'app.modules.index.js',
			list: [
				'./app/**/*.js'
			]
		}
	},
	local: {
		path: './local'
	},
	serve: {
		 // browserSync
		initPath: '/Index.html'
	}
};
