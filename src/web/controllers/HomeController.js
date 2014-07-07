"use strict";
/* -------------------------------------------------------------------
 * Require Statements << Keep in alphabetical order >>
 * ---------------------------------------------------------------- */

var debug = require('neo-debug')('Kirj.Home');
var Kirja = require('Kirja');

/* =============================================================================
 * 
 * HomeController
 *  
 * ========================================================================== */

var HomeController = module.exports;

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

HomeController.indexGet = function * ()
{
	debug('Index page');
	yield this.render('home/index');
};

HomeController.sandboxGet = function * ()
{
	var md = require('fs').readFileSync(__dirname + '/Test.md', {encoding:'utf8'});
	var html = Kirja.markdown(md);
	yield this.render('home/sandbox', { post: html });
};

/* -------------------------------------------------------------------
 * Private Methods << Keep in alphabetical order >>
 * ---------------------------------------------------------------- */

// code

/* -------------------------------------------------------------------
 * Initialization
 * ---------------------------------------------------------------- */

// If function calls need to be made to initialize the module, put those calls here.
