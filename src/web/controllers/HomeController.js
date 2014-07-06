"use strict";
/* -------------------------------------------------------------------
 * Require Statements << Keep in alphabetical order >>
 * ---------------------------------------------------------------- */

var debug = require('neo-debug')('Kirj.Home');

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
	yield this.render('home/sandbox');
};

/* -------------------------------------------------------------------
 * Private Methods << Keep in alphabetical order >>
 * ---------------------------------------------------------------- */

// code

/* -------------------------------------------------------------------
 * Initialization
 * ---------------------------------------------------------------- */

// If function calls need to be made to initialize the module, put those calls here.
