"use strict";

var Scaffold; /// require scaffold.js

/// target browser
	window.Scaffold = Scaffold;
	window.scaffold = Scaffold.init.bind(Scaffold);
	if (window.s == null)
		window.s = window.scaffold;
/// target
