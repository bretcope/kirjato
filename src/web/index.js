"use strict";
/* -------------------------------------------------------------------
 * Require Statements << Keep in alphabetical order >>
 * ---------------------------------------------------------------- */

var co = require('co');
var Config = require('Config');
var Enums = require('Enums');
var Http = require('http');
var Https = require('https');
var koa = require('koa');
var koaBody = require('koa-better-body');
var koaFavicon = require('koa-favicon');
var KoaJade = require('koa-jade');
var koaMount = require('koa-mount');
var koaStatic = require('koa-static');
var koaTrail = require('koa-trail');
var Path = require('path');
var thunkify = require('thunkify');

var Controllers = {};
Controllers.Auth = require('./controllers/AuthController');
Controllers.Home = require('./controllers/HomeController');
Controllers.Post = require('./controllers/PostController');
Controllers.Scribe = require('./controllers/ScribeController');

/* =============================================================================
 * 
 * Public Web Server
 *  
 * ========================================================================== */

/* -------------------------------------------------------------------
 * Private Members Declaration << no methods >>
 * ---------------------------------------------------------------- */

var _servers = {};

/* -------------------------------------------------------------------
 * Private Methods << Keep in alphabetical order >>
 * ---------------------------------------------------------------- */

function * initialize ()
{
	yield Config.initialize();
	
	if (Config.settings.web.http.enabled)
		_servers.http = yield setupServer(Config.settings.web.http, false);
	
	if (Config.settings.web.https.enabled)
		_servers.https = yield setupServer(Config.settings.web.https, true);
}

function setupMiddleware (app)
{
	var isLocal = Config.tier === 'local';

//	app.use(koaFavicon(Path.join(__dirname, 'static/favicon.ico')));
	app.use(koaMount('/static', koaStatic(Path.join(__dirname, 'static'))));
	
	app.use(KoaJade.middleware({
		viewPath: Path.join(__dirname, 'views'),
		debug: isLocal,
		pretty: isLocal,
		compileDebug: isLocal,
		locals: { title: Config.settings.site.name }
	}));
	
	app.use(Controllers.Auth.authMiddleware);
	app.use(koaTrail(app));
}

function setupRoutes (app)
{
	// --- Routes not requiring login ---

	app.post('*', koaBody());
	app.get('/', Controllers.Home.indexGet);
	app.get('/auth/initial-admin', Controllers.Auth.initialAdminGet);
	app.get('/login', Controllers.Auth.userLoginGet);
	app.post('/login', Controllers.Auth.userLoginPost);
	app.get('/logout', Controllers.Auth.userLogoutGet);
	
	// --- Normal User Routes ---
	
	app.get('*', Controllers.Auth.filterLowerThan(Enums.UserTypes.NORMAL, true));
	app.get('/scribe', Controllers.Scribe.indexGet);
}

function * setupServer (options, ssl)
{
	var app = koa();
	
	setupMiddleware(app);
	setupRoutes(app);
	
	var handler = app.callback();
	var server;

	if (ssl)
		server = Https.createServer(options.ssl, handler);
	else
		server = Http.createServer(handler);
	
	server.app = app;
	
	server.listen_ = thunkify(server.listen);
	yield server.listen_(options.port, options.host);
	console.log((ssl ? 'Https' : 'Http') + ' server listening on ' + options.host + ':' + options.port);
	return server;
}

/* -------------------------------------------------------------------
 * Initialization
 * ---------------------------------------------------------------- */

co(initialize)();
