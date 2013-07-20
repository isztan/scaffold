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

var classify = __boiledjs_inner.require(2);
var varg = __boiledjs_inner.require(3);


var Scaffold = classify(function Scaffold(/* [document], template... */)
{
	this.r = this['#'] = this['&'] = this.ref = {};
	this.n = this['@'] = this.named = {};
	this.l = this[':'] = this.labeled = {};
	this.c = this['.'] = this.classed = {};

	var templateIndex = 0;

	// Document to be used for element creation. Also for "html", "head",
	// and "body" element resolution.
	if (this._isDocument(arguments[0]))
		this.document = arguments[templateIndex++];
	else if (this._isDocument(Scaffold.document))
		this.document = Scaffold.document;
	else if (typeof document !== 'undefined' && this._isDocument(document))
		this.document = document;
	else
		throw new Error("Missing Document");

	var data = Array.prototype.slice.call(arguments, templateIndex);
	if (data[0] instanceof Array)
		data = data[0];

	// Used to create elements safely across all browsers.
	this._dummy = this.document.createElement('div');
	this._dummyText = this._dummy.innerText != null ? 'innerText' : 'textContent';

	this.e = this.el = this.element = this._parse(data);
})
.implementStatic({

	shortcuts: {

		// Input Types
		text: 'input=text',
		password: 'input=password',
		checkbox: 'input=checkbox',
		radio: 'input=radio',
		file: 'input=file',
		image: 'input=image',
		hidden: 'input=hidden',

		// Prefixed to distinquish them from button elements.
		ibutton: 'input=button',
		isubmit: 'input=submit',
		ireset: 'input=reset',

		// HTML5 Input Types
		color: 'input=color',
		date: 'input=date',
		datetime: 'input=datetime',
		'datetime-local': 'input=datetime-local',
		email: 'input=email',
		month: 'input=month',
		number: 'input=number',
		range: 'input=range',
		search: 'input=search',
		tel: 'input=tel',
		time: 'input=time',
		url: 'input=url',
		week: 'input=week',

		// Button Types
		submit: 'button=submit',
		reset: 'button=reset'
	}

})
.implement({

	// Generate a scaffold data structure from the root element and all its
	// children.
	serialize: varg({}, function(options)
	{
		return this._serializeElement(options, this.element);
	}),

	// Build an HTML string from the scaffold root element and all its children.
	stringify: varg({}, function(options)
	{
		var serialized = this.serialize({
			plainTag: true,
			forceAttributes: true
		});

		return this._renderSerialized(options, serialized);
	}),

	// Call stringify with default options.
	toString: function()
	{
		return this.stringify();
	},

	// Index the element based on its class, scaffold label, id/scaffold
	// reference, and name.
	_indexElement: function(element, attrs)
	{
		if (attrs.hasOwnProperty('class'))
			this._addClassed(attrs['class'].split(/\s+/g), element);
		if (attrs.hasOwnProperty('data-serialize-labeled'))
			this._addLabeled(attrs['data-serialize-labeled'].split(/\s+/g), element);
		if (attrs.hasOwnProperty('data-serialize-reffed'))
			this._addReffed(attrs['data-serialize-reffed'], element);
		if (attrs.hasOwnProperty('id'))
			this._addReffed(attrs.id, element);
		if (attrs.hasOwnProperty('name'))
			this._addNamed(attrs.name, element);
	},

	// Generate HTML text from a scaffold data structure.
	_renderSerialized: function(opts, serial)
	{
		if (typeof serial === 'string')
			return this._quoteAttr(serial);

		var tag = ['<', serial[0]],
			attributes = serial[1],
			i, i_max;

		for (i in attributes)
		{
			if (!attributes.hasOwnProperty(i))
				continue;

			tag.push(' ', i, '="', this._quoteAttr(attributes[i]), '"');
		}

		if (!this._isVoidTag(serial[0]))
		{
			// Non-Void Element

			tag.push('>');

			for (i = 2, i_max = serial.length; i < i_max; ++i)
				tag.push(this._renderSerialized(opts, serial[i]));

			tag.push('</', serial[0]);
		}
		else if (opts.xhtml)
		{
			tag.push('/');
		}

		tag.push('>');

		return tag.join('');
	},

	// Given an element (el), convert it and all its children into a scaffold
	// data structure.
	_serializeElement: function(opts, el, parent)
	{
		if (this._isTextNode(el))
		{
			if (parent)
				parent.push(el.nodeValue);

			return el.nodeValue;
		}

		if (!this._isElement(el))
			throw new Error("Expecting HTML Node Type 1");

		var serialized = [el.nodeName.toLowerCase()],
			attributes = this._getAllAttributes(el),
			count = 0,
			name;

		for (name in attributes)
		{
			if (!attributes.hasOwnProperty(name))
				continue;

			if (attributes[name] === null || attributes[name] === '')
				delete attributes[name];
			else
				++count;
		}

		if (!opts.plainTag)
		{
			var modifiers = this._serializeModifiers(attributes);
			count -= modifiers.length;
			serialized[0] += modifiers.join('');
		}

		if (count > 0 || opts.forceAttributes)
			serialized.push(attributes);

		var i = 0,
			i_max = el.childNodes.length;

		for (; i < i_max; ++i)
			this._serializeElement(opts, el.childNodes[i], serialized);

		if (parent)
			parent.push(serialized);

		return serialized;
	},

	// Turn modifier attributes into an array of modifier strings, removing them
	// from the source attributes map.
	_serializeModifiers: function(attrs)
	{
		var mods = [];

		if (attrs.hasOwnProperty('type') && this._addModifier(mods, '=', attrs.type))
			delete attrs.type;
		if (attrs.hasOwnProperty('id') && this._addModifier(mods, '#', attrs.id))
			delete attrs.id;
		if (attrs.hasOwnProperty('data-serialize-reffed') && this._addModifier(mods, '&', attrs['data-serialize-reffed']))
			delete attrs['data-serialize-reffed'];
		if (attrs.hasOwnProperty('name') && this._addModifier(mods, '@', attrs.name))
			delete attrs.name;
		if (attrs.hasOwnProperty('data-serialize-labeled') && this._addModifier(mods, ':', attrs['data-serialize-labeled'], true))
			delete attrs['data-serialize-labeled'];
		if (attrs.hasOwnProperty('class') && this._addModifier(mods, '.', attrs['class'], true))
			delete attrs['class'];

		return mods;
	},

	// Add modifier strings to the mods array. Each modifier is the prefix (pre)
	// plus val. If list is true, then val will be split into multiple values
	// and multiple modifiers will be added to mods.
	_addModifier: function(mods, pre, val, list)
	{
		if (list)
		{
			if (!(/^\s*([^#@&:\/\.\s]+\s*)+$/).test(val))
				return false;

			mods.push(pre + val.replace(/^\s+|\s+$/g, '').split(/\s+/).join(pre));
		}
		else
		{
			if (!(/^\s*[^#@&:\/\.\s]+\s*$/).test(val))
				return false;

			mods.push(pre + val.replace(/^\s+|\s+$/g, ''));
		}

		return true;
	},

	// Recursively turn data into a tree of DOM elements.
	_parse: function(data, isRoot)
	{
		if (data.length === 0)
		{
			if (isRoot)
				data = ['span', { style: 'display: none;' }];
			else
				return null;
		}

		var element = this._validateElement(data[0]),
			i = 1,
			i_max = data.length,
			children = [],
			attributes = {},
			attr, value;

		for (; i < i_max; ++i)
		{
			if (this._isJQuery(data[i]))
			{
				data[i].each(function()
				{
					children.push([this]);
				});
			}
			else if (this._isElement(data[i]))
			{
				children.push([data[i]]);
			}
			else if (this._isArrayLike(data[i]))
			{
				children.push(data[i]);
			}
			else if (this._isPlainObject(data[i]))
			{
				for (attr in data[i])
				{
					if (!data[i].hasOwnProperty(attr))
						continue;

					value = data[i][attr];
					if (value instanceof Array)
					{
						if (/^(class|data-serialize-labeled)$/.test(attr))
							value = value.join(' ');
						else
							value = value.join(',');
					}

					attributes[attr] = value;
				}
			}
			else if (data[i] != null)
			{
				children.push(''+data[i]);
			}
		}

		if (element instanceof Array)
			element = this._createElement(element, attributes);
		else
			element = this._existingElement(element, attributes);

		var child;
		for (i = 0, i_max = children.length; i < i_max; ++i)
		{
			child = children[i];

			if (typeof child === 'string' && child)
			{
				this._dummy[this._dummyText] = [child];
				element.inner.appendChild(this._dummy.childNodes[0]);
			}
			else
			{
				child = this._parse(children[i]);
				if (child)
					element.inner.appendChild(child);
			}
		}

		return element.outer;
	},

	// Make sure element is a valid tag string, element instance, or jQuery
	// object. If it's a tag string, parse it into tagName and modifiers
	// strings. If it's a jQuery object, extract the first element instance.
	_validateElement: function(element)
	{
		if (typeof element === 'string')
			return this._validateElementString(element);

		if (this._isJQuery(element))
			element = element.get(0) || false;
		else if (!this._isElement(element))
			element = false;

		if (!element)
			throw new Error("Expecting String or DOM Element");

		return element;
	},

	// Make sure str represents a valid tagName, possibly containing modifiers.
	// Split the str into a tagName string and a modifiers string.
	_validateElementString: function(str, isShortcut)
	{
		var strings = str.replace(/^\s+/, '').split(/\s(?![^a-z0-9]|\s|$)/),
			i = 0,
			i_max = strings.length,
			descriptions = [],
			matches,
			resolved;

		for (; i < i_max; ++i)
		{
			matches = strings[i].match(/^\s*([a-z0-9]+)\s*((?:[#@&:=\.][^#@&:=\.]+\s*)*)$/i);
			if (matches === null)
				throw new Error("Invalid Element String");

			if (!isShortcut && Scaffold.shortcuts.hasOwnProperty(matches[1]))
			{
				resolved = this._validateElementString(Scaffold.shortcuts[matches[1]], true);
				resolved[resolved.length - 1].modifiers += matches[2];

				descriptions = descriptions.concat(resolved);

				continue;
			}

			descriptions.push({
				tagName: matches[1],
				modifiers: matches[2]
			});
		}

		return descriptions;
	},

	// Escape HTML special characters: & ' " < > \r\n \r \n
	//
	// After escaping the string should be safe to insert into HTML without
	// modifying the HTML structure.
	_quoteAttr: function(str)
	{
		return (''+str)
			.replace(/&/g, '&amp;')
			.replace(/'/g, '&apos;')
			.replace(/"/g, '&quot;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/\r\n/g, '&#13;')
			.replace(/[\r\n]/g, '&#13;');
	},

	// Create a set of nested element instances based on the elements array. The
	// attributes (lastAttrs) will be applied to the last element in the
	// elements array.
	_createElement: function(elements, lastAttrs)
	{
		// If this is the last element, then attributes. Otherwise start with a
		// blank attributes map and only use attributes coming from tag
		// modifiers.
		var attrs = (elements.length === 1) ? lastAttrs : {};

		if (elements[0].modifiers)
		{
			var modifiers = elements[0].modifiers.match(/[#@&:=\.][^#@&:=\.]+/g),
				i = 0,
				i_max = modifiers.length,
				prefix, value;

			for (i = 0; i < i_max; ++i)
			{
				prefix = modifiers[i].charAt(0);
				value = modifiers[i].substr(1).replace(/\s+$/, '');

				if (prefix === '#')
					attrs.id = value;
				else if (prefix === '&')
					attrs['data-serialize-reffed'] = value;
				else if (prefix === '.')
					attrs['class'] = attrs['class'] ? attrs['class'] + ' ' + value : value;
				else if (prefix === ':')
					attrs['data-serialize-labeled'] = attrs['data-serialize-labeled'] ? attrs['data-serialize-labeled'] + ' ' + value : value;
				else if (prefix === '=')
					attrs.type = value;
				else if (prefix === '@')
					attrs.name = value;
			}
		}

		var tagName = elements[0].tagName.toLowerCase(),
			element = this._reservedTag(tagName);

		if (!element)
		{
			// IE HAX!
			// * IE decides to reset the value property when the type property
			//   is set, so it has to be set first.
			// * IE7 does not correctly update the name property so the element
			//   must be created with the name property in place using
			//   innerHTML.
			// * IE7 does not always set the checked, disabled, and readonly
			//   properties, so create them as attributes on the new node.

			var tag = '<' + tagName;

			if (attrs.hasOwnProperty('type'))
				tag += ' type="' + this._quoteAttr(attrs.type) + '"';
			if (attrs.hasOwnProperty('name'))
				tag += ' name="' + this._quoteAttr(attrs.name) + '"';
			if (attrs.hasOwnProperty('checked') && attrs.checked)
				tag += ' checked="checked"';
			if (attrs.hasOwnProperty('disabled') && attrs.disabled)
				tag += ' disabled="disabled"';
			if (attrs.hasOwnProperty('readonly') && attrs.readonly)
				tag += ' readonly="readonly"';
			tag += ' />';

			// Certain elements will not be created using the innerHTML method
			// unless they are created inside an appropriate parent hierarchy.
			var index = 0;
			switch (tagName)
			{
				case 'option':
					tag = '<select><option></option>' + tag + '</select>';
					index = 1;
					break;
				case 'li':
					tag = '<ul>' + tag + '</ul>';
					break;
				case 'thead':
				case 'tfoot':
				case 'tbody':
					tag = '<table>' + tag + '</table>';
					break;
				case 'tr':
					tag = '<table><tbody>' + tag + '</tbody></table>';
					break;
				case 'td':
				case 'th':
					tag = '<table><tbody><tr>' + tag + '</tr></tbody></table>';
			}

			this._dummy.innerHTML = tag;
			element = this._dummy.getElementsByTagName(tagName)[index];

			this._indexElement(element, attrs);

			delete attrs.type;
			delete attrs.name;
			delete attrs.checked;
			delete attrs.disabled;
			delete attrs.readonly;
		}

		this._setAttribute(element, attrs);

		if (elements.length > 1)
		{
			elements.shift();
			var child = this._createElement(elements, lastAttrs);

			element.appendChild(child.outer);

			return {
				outer: element,
				inner: child.inner
			};
		}

		return {
			outer: element,
			inner: element
		};
	},

	// Apply attributes to an existing element.
	_existingElement: function(element, attributes)
	{
		this._setAttribute(element, attributes);

		return {
			inner: element,
			outer: element
		};
	},

	// Set an attribute, or a map of attributes on an element. If the attribute
	// should actually be a property, then this should set the property instead
	// of calling the native setAttribute method.
	_setAttribute: function(element, name, value)
	{
		if (this._isPlainObject(name))
		{
			var i, changed = false;
			for (i in name)
			{
				if (name.hasOwnProperty(i))
					changed = this._setAttribute(element, i, name[i]) || changed;
			}

			return changed;
		}

		name = name.replace(/(^\s+|\s$)/g, '').toLowerCase();
		if (!name)
			throw new Error("Expected Attribute Name");

		if (name === 'style')
		{
			if (value)
			{
				if (element.style.cssText)
					element.style.cssText += ' ' + value;
				else
					element.style.cssText = ''+value;
			}
		}
		else if (name === 'class')
		{
			if (value)
			{
				if (element.className)
					element.className += ' ' + value;
				else
					element.className = ''+value;
			}
		}
		else if (name === 'data-serialize-labeled')
		{
			if (value)
			{
				void function(current, value, name, element)
				{
					if (current)
						element.setAttribute(name, current + ' ' + value);
					else
						element.setAttribute(name, ''+value);
				}
				(element.getAttribute('data-serialize-labeled'), value, name, element);
			}
		}
		else if (name === 'readonly')
		{
			element.readOnly = !!value;
		}
		else if (/^(checked|disabled)$/.test(name))
		{
			element[name] = !!value;
		}
		else
		{
			try
			{
				if (!(/^(undefined|unknown)$/).test(typeof element[name]))
				{
					// Setting a property, not an attribute.
					element[name] = value;
					return;
				}
			}
			catch (e) {}

			if (typeof value === 'boolean')
				value = value ? name : null;

			try
			{
				if (value == null)
					element.removeAttribute(name);
				else
					element.setAttribute(name, ''+value);
			}
			catch (e) {}
		}
	},

	// Get all attributes and properties which can be initialized via attribute.
	// The intent is to get attributes/properties relevent for DOM branch
	// serialization.
	_getAllAttributes: function(element)
	{
		var attributes = {},
			i = 0,
			i_max = element.attributes.length;

		for (; i < i_max; ++i)
			attributes[element.attributes[i].nodeName] = element.attributes[i].nodeValue;

		var properties = ['class', 'style', 'readonly', 'checked', 'disabled', 'id', 'name', 'type', 'value', 'title'],
			value;

		i = properties.length;
		while (i--)
		{
			value = this._getAttribute(element, properties[i]);
			if (value)
				attributes[properties[i]] = value === true ? properties[i] : value;
			else
				delete attributes[properties[i]];
		}

		return attributes;
	},

	// The inverse of _setAttribute. Get an attribute unless the attribute name
	// should refer to a property, in which case get the property value.
	_getAttribute: function(element, name)
	{
		name = name.replace(/(^\s+|\s$)/g, '').toLowerCase();
		if (!name)
			throw new Error("Expected Attribute Name");

		if (name === 'class')
			return element.className;
		else if (name === 'style')
			return element.style.cssText;
		else if (name === 'readonly')
			return element.readOnly;
		else
		{
			try
			{
				if (!(/^(undefined|unknown)$/).test(typeof element[name]))
				{
					// Getting a property, not an attribute.
					return element[name];
				}
			}
			catch (e) {}

			return element.getAttribute(name);
		}
	},

	_addReffed: function(id, element)
	{
		id = ''+id;
		this.ref[id] = element;
	},

	_addNamed: function(name, element)
	{
		name = ''+name;

		if (!this.named.hasOwnProperty(name))
			this.named[name] = [];

		this.named[name].push(element);
	},

	_addLabeled: function(label, element)
	{
		if (this._isArrayLike(label))
		{
			var i = 0,
				i_max = label.length;

			for (; i < i_max; ++i)
				this._addLabeled(label[i], element);

			return;
		}

		label = ''+label;

		if (!this.labeled.hasOwnProperty(label))
			this.labeled[label] = [];

		this.labeled[label].push(element);
	},

	_addClassed: function(className, element)
	{
		if (this._isArrayLike(className))
		{
			var i = 0,
				i_max = className.length;

			for (; i < i_max; ++i)
				this._addClassed(className[i], element);

			return;
		}

		className = ''+className;

		if (!this.classed.hasOwnProperty(className))
			this.classed[className] = [];

		this.classed[className].push(element);
	},

	_isVoidTag: function(tag)
	{
		return (/^(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/).test(tag);
	},

	_reservedTag: function(tag)
	{
		switch (tag)
		{
			case 'html':
				return this.document.documentElement || null;
			case 'head':
				return this.document.head || null;
			case 'body':
				return this.document.body || null;
		}

		return null;
	},

	_isPlainObject: function(test)
	{
		return (test != null && typeof test === 'object' && test.constructor === Object);
	},

	_isArrayLike: function(test)
	{
		return (test != null && typeof test === 'object' && typeof test.splice === 'function' && test.hasOwnProperty('length') && typeof test.length === 'number');
	},

	_isNode: function(test, nodeType)
	{
		return test != null && typeof test === 'object' && typeof test.nodeType === 'number' && (nodeType == null || test.nodeType === nodeType);
	},

	_isElement: function(test)
	{
		return this._isNode(test, 1);
	},

	_isTextNode: function(test)
	{
		return this._isNode(test, 3);
	},

	_isDocument: function(test)
	{
		return this._isNode(test, 9);
	},

	_isJQuery: function(test)
	{
		return typeof jQuery === 'function' && test instanceof jQuery;
	}
});

__boiledjs_inner.module.exports = Scaffold;
};
__boiledjs_outer.requires[2] = function(__boiledjs_inner){
"use strict";

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

__boiledjs_inner.module.exports = classify;
};
__boiledjs_outer.requires[3] = function(__boiledjs_inner){
"use strict";

var classify = __boiledjs_inner.require(2);
var combine = __boiledjs_inner.require(4);

var Def = classify(function Def(_default)
{
	this._default = _default;
	this._type = typeof this._default;
	this._ctor = this._type === 'object' ? this._default.constructor : null;
})
.implement({
	check: function(value)
	{
		if (value == null)
			return false;

		if (typeof value !== this._type)
			return false;

		if (this._type === 'object')
		{
			if (this._default.constructor === Object)
				return value instanceof Object && !(value instanceof Array);
			else if (this._default.constructor === Array)
				return value instanceof Array;
			else
				return value instanceof this._default.constructor;
		}

		return true;
	},
	getDefault: function()
	{
		if (this._type === 'object')
		{
			if (this._default.constructor === Object)
				return combine({}, this._default);
			else if (this._default.constructor === Array)
				return this._default.slice(0);
		}

		return this._default;
	}
});

function varg()
{
	if (arguments.length < 1 || !(arguments[arguments.length - 1] instanceof Function))
		throw new Error("Expecting Function as last argument");

	var argDefs = Array.prototype.slice.call(arguments, 0),
		fn = argDefs.pop(),
		i = argDefs.length;

	while (i--)
	{
		if (argDefs[i] == null)
			argDefs[i] = null;
		else
			argDefs[i] = new Def(argDefs[i]);
	}

	return function()
	{
		var args = Array.prototype.slice.call(arguments, 0),
			i = 0,
			max = argDefs.length;

		for (; i < max; ++i)
		{
			if (argDefs[i] && !argDefs[i].check(args[i]))
				args.splice(i, 0, argDefs[i].getDefault());
		}

		return fn.apply(this, args);
	};
}

__boiledjs_inner.module.exports = varg;
};
__boiledjs_outer.requires[4] = function(__boiledjs_inner){
"use strict";

function combine(target, source, allowNulls)
{
	var i;
	if (allowNulls)
	{
		for (i in source)
			target[i] = source[i];
	}
	else
	{
		for (i in source)
		{
			if (source[i] != null)
				target[i] = source[i];
		}
	}

	return target;
}

__boiledjs_inner.module.exports = combine;
};
__boiledjs_outer.require(0);
}(/*__boiledjs_closure__*/);
