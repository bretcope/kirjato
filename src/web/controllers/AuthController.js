"use strict";
/* -------------------------------------------------------------------
 * Require Statements << Keep in alphabetical order >>
 * ---------------------------------------------------------------- */

var Config = require('Config');
var debug = require('neo-debug')('Kirj.Auth');
var Enums = require('Enums');
var Kirja = require('Kirja');
var ScribeController = require('./ScribeController');
var Session = require('Session');
var Sql = require('Sql');
var User = require('User');

/* =============================================================================
 * 
 * AuthController - Handles authentication requests.
 *  
 * ========================================================================== */

var AuthController = module.exports;

/* -------------------------------------------------------------------
 * Private Members Declaration << no methods >>
 * ---------------------------------------------------------------- */

// code

/* -------------------------------------------------------------------
 * Public Members Declaration << no methods >>
 * ---------------------------------------------------------------- */

// code

/* -------------------------------------------------------------------
 * Public Methods << Keep in alphabetical order >>
 * ---------------------------------------------------------------- */

AuthController.authMiddleware = function * (next)
{
	debug('Checking auth cookie');
	this.session = null;
	this.user = null;
	var token = this.cookies.get(Config.settings.auth.cookieName);
	
	if (token)
	{
		token = Kirja.base64UrlSafeDecode(token);
		var sql = 'select '+ User.getColumnList('u') +', '+ Session.getColumnList('s')  +' ' +
			'from sessions s, users u where s.token = $1 and s.user_id = u.id and s.expire_date > now();';

		var result = yield Sql.query(sql, [ token ]);
		if (result.rowCount === 1)
		{
			var row = result.rows[0];
			this.session = Session.fromRow(row, 's');
			this.user = User.fromRow(row, 'u');
			debug('User session found for ' + this.user.displayName);
		}
	}
	
	yield next;
};

AuthController.filterLowerThan = function (userType, redirect)
{
	if (!userType)
		userType = Enums.UserTypes.UNREGISTERED;
	
	return function * (next)
	{
		/* jshint validthis: true */
		debug('Filtering less than ' + userType);
		var code = null;
		if (!this.user) 
		{
			if (userType === Enums.UserTypes.NORMAL)
			{
				code = 403;
			}
			else if (userType > Enums.UserTypes.NORMAL)
			{
				code = 404;
			}
		}
		else if (this.user.type < userType)
		{
			code = 404;
		}
		
		if (code)
		{
			if (redirect)
				this.redirect(Kirja.url(AuthController.userLoginGet));
			else
				this.throw(code);
		}
		else
		{
			yield next;
		}
	};
};

AuthController.initialAdminGet = function * ()
{
	debug('Initial admin');
	if (!Config.settings.auth.allowInitialAdmin)
	{
		this.throw(404);
		return;
	}

	var user = new User();
	user.displayName = 'Initial Admin';
	user.email = this.request.query.email;
	yield user.passwordSet('admin');
	
	try
	{
		var tran = yield Sql.transaction();
		yield user.save(tran);
		
		// disable allowInitialAdmin
		yield Config.updateSetting('auth.allowInitialAdmin', false, tran);
		yield tran.commit();
		
		yield this.render('message', { message: 'An initial admin user has been setup using the email address '+ user.email +'. Use the password "admin" the first time you login.' });
	}
	catch (ex)
	{
		if (tran && tran.open)
			yield tran.rollback();
		
		throw ex;
	}
};

AuthController.userLoginGet = function * ()
{
	debug('Login GET');
	yield this.render('auth/login', { login: { url: Kirja.url(AuthController.userLoginPost) } });
};

AuthController.userLoginPost = function * ()
{
	debug('Login POST');
	var message = 'Invalid email/password combination.';
	
	var email, password;
	if (this.request.body && this.request.body.fields)
	{
		email = this.request.body.fields.email;
		password = this.request.body.fields.password;
	}
	
	if (!email || !password)
	{
		message = 'You must provide an email address and password.';
	}
	else
	{
		/** @type {User} */
		var user = yield User.byEmail(email);
		
		if (user && (yield user.passwordCheck(password)))
		{
			// create new session
			var session = new Session(user);
			yield session.save();
			
			// save cookie
			var token = Kirja.base64UrlSafeEncode(session.token);
			this.cookies.set(Config.settings.auth.cookieName, token, {
				expires: session.expireDate,
				path: Config.settings.site.pathPrefix
			});
			
			console.log(session.expireDate);
			message = null;
		}
	}
	
	if (message)
	{
		yield this.render('auth/login', { login: { url: Kirja.url(AuthController.userLoginGet), message: message } });
	}
	else
	{
		this.redirect(Kirja.url(ScribeController.indexGet));
	}
};

AuthController.userLogoutGet = function * ()
{
	//
};

/* -------------------------------------------------------------------
 * Private Methods << Keep in alphabetical order >>
 * ---------------------------------------------------------------- */

// code

/* -------------------------------------------------------------------
 * Initialization
 * ---------------------------------------------------------------- */

// If function calls need to be made to initialize the module, put those calls here.
