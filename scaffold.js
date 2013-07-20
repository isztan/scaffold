void function(/*__boiledjs_closure__*/){
var __boiledjs_outer = {
    texts: [],
    requires: [],
    modules: [],
    require: function(index) {
        if (!this.modules[index]) {
            this.modules[index] = (index === 0 && typeof __boiledjs_inner !== 'undefined') ? __boiledjs_inner.module : { exports: {} };
            this.requires[index]({
                index: index,
                require: __boiledjs_outer.require.bind(__boiledjs_outer),
                texts: __boiledjs_outer.texts,
                module: this.modules[index]
            });
        }
        return this.modules[index].exports;
    }
};
__boiledjs_outer.requires[0] = function(__boiledjs_inner){
"use strict";

var Scaffold = __boiledjs_inner.require(1);

	window.Scaffold = Scaffold;
	window.scaffold = Scaffold.init.bind(Scaffold);
	if (window.s == null)
		window.s = window.scaffold;
};
__boiledjs_outer.requires[1] = function(__boiledjs_inner){
"use strict";

var fn = __boiledjs_inner.require(2);

};
__boiledjs_outer.requires[2] = function(__boiledjs_inner){
"use strict";


function once(fn)
{
	var called = false,
		failed = false,
		retval, err;

	return function once_wrapped()
	{
		if (!called)
		{
			called = true;
			try
			{
				retval = fn.apply(this, arguments);
			}
			catch (e)
			{
				failed = true;
				err = e;
			}
		}

		if (failed)
			throw err;
		else
			return retval;
	};
}
function once(fn, context)
{
	var called = false,
		retval;

	if (context != null)
		fn = Function.bind.apply(fn, arguments);

	return function()
	{
		if (!called)
		{
			called = true;
			retval = fn.apply(this, arguments);
		}

		return retval;
	};
}

function extend(fn, parent)
{
	fn.parent = parent;
	fn.prototype = Object.create(parent.prototype);
	fn.prototype.constructor = fn;

	return fn;
}

function implement(fn, proto)
{
	for (var i in proto)
	{
		if (proto[i] == null)
			continue;

		fn.prototype[i] = proto[i];
	}

	return fn;
}

function implementStatic(fn, proto)
{
	for (var i in proto)
	{
		if (proto[i] == null)
			continue;

		fn[i] = proto[i];
	}

	return fn;
}

function init(fn)
{
	var instance = Object.create(fn.prototype);
	var retval = fn.apply(instance, Array.prototype.slice.call(arguments, 1));

	return retval == null ? instance : retval;
}

function classify(fn)
{
	fn.extend = extend.bind(fn, fn);
	fn.implement = implement.bind(fn, fn);
	fn.implementStatic = implementStatic.bind(fn, fn);
	fn.init = init.bind(fn, fn);

	return fn;
}

__boiledjs_inner.module.exports.once = once;
__boiledjs_inner.module.exports.classify = classify;
};
__boiledjs_outer.require(0);
}(/*__boiledjs_closure__*/);
