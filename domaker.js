(function( global )
{
	"use strict";

	function Class()
	{
		if ( !( this instanceof Class ) )
			// Called statically.
			return new Class( arguments );

		this.r = this['#'] = this['&'] = this.ref = {};
		this.n = this['@'] = this.named = {};
		this.l = this[':'] = this.labeled = {};
		this.c = this['.'] = this.classed = {};

		var params;
		if ( arguments[0] instanceof arguments.constructor )
			params = this.__params.apply( this, arguments[0] );
		else
			params = this.__params.apply( this, arguments );

		// Document to be used for element creation. Also for "html", "head",
		// and "body" element resolution.
		this.document = this._getDocument( params.options ) || this.document || this._getDocument( global );
		if ( !this._isDocument( this.document ) )
			throw new Error( "Missing Document" );

		this._indexing = params.options.indexing;
		if ( typeof this._indexing === 'string' )
		{
			if ( !(/^none|new|full$/).test( this._indexing ) )
				this._indexing = 'none';
		}
		else
		{
			this._indexing = this._indexing ? 'full' : 'none';
		}

		this._indexRefs = !!params.options.indexRefs;
		this._indexNames = !!params.options.indexNames;
		this._indexLabels = !!params.options.indexLabels;
		this._indexClasses = !!params.options.indexClasses;

		this._indexed = false;
		this.e = this.el = this.element = this._parse( params.data, true );
		this._indexed = ( this._indexing !== 'none' );
	}
	Class.render = function()
	{
		return new Class( arguments );
	};

	Class.prototype.document = null;
	Class.prototype.defaults = {
		indexing: 'full',
		indexRefs: true,
		indexNames: true,
		indexLabels: true,
		indexClasses: false
	};
	Class.prototype.shortcuts = {

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
	};
	Class.prototype.__params = function()
	{
		var params = {},
			dataIndex = 0,
			i;

		// Shallow copy the default options.
		params.options = {};
		for ( i in this.defaults )
			params.options[i] = this.defaults[i];

		// If the first argument is an options map, then override the default
		// option values.
		if ( arguments[0] instanceof Object && !this._isJQuery( arguments[0] ) && !this._isElement( arguments[0] ) && !this._isArray( arguments[0] ) )
		{
			++dataIndex;

			var options = arguments[0];
			for ( i in options )
			{
				if ( typeof options[i] !== 'undefined' && options[i] !== null )
					params.options[i] = options[i];
			}
		}

		// Get the rendering data passed as an array or multiple arguments.
		params.data = arguments[dataIndex];
		if ( !this._isArray( params.data ) || this._isJQuery( params.data ) )
			params.data = Array.prototype.slice.call( arguments, dataIndex );

		return params;
	};
	Class.prototype.unrender = function( options )
	{
		options = options || {};

		return this._serializeElement( options, this.element );
	};
	Class.prototype.stringify = function( options )
	{
		options = options || {};

		var serialized = this.unrender({
			plainTag: true,
			forceAttributes: true
		});

		return this._renderElementString( options, serialized );
	};
	Class.prototype.toString = function()
	{
		return this.stringify();
	};
	Class.prototype.index = function( options )
	{
		options = options || {};

		this._resetIndex();
		this._indexing = 'full';

		if ( typeof options.indexRefs !== 'undefined' && options.indexRefs !== null )
			this._indexRefs = !!options.indexRefs;
		if ( typeof options.indexNames !== 'undefined' && options.indexNames !== null )
			this._indexNames = !!options.indexNames;
		if ( typeof options.indexLabels !== 'undefined' && options.indexLabels !== null )
			this._indexLabels = !!options.indexLabels;
		if ( typeof options.indexClasses !== 'undefined' && options.indexClasses !== null )
			this._indexClasses = !!options.indexClasses;

		this._indexElement( this.element, true );
		this._indexed = true;

		return this;
	};
	Class.prototype.getIndexing = function()
	{
		return this._indexed ? this._indexing : 'none';
	};
	Class.prototype.getIndexRefs = function()
	{
		return !!this._indexRefs;
	};
	Class.prototype.getIndexNames = function()
	{
		return !!this._indexNames;
	};
	Class.prototype.getIndexLabels = function()
	{
		return !!this._indexLabels;
	};
	Class.prototype.getIndexClasses = function()
	{
		return !!this._indexClasses;
	};
	Class.prototype.setValue = function( name, value )
	{
		var i, changed = [];

		if ( name instanceof Object )
		{
			for ( i in name )
				changed = changed.concat( this.setValue( i, name[i] ) );

			return changed;
		}

		if ( !this.named[name] || typeof value === 'undefined' )
			return [];

		var i_max = this.named[name].length,
			element, nodeName, originalValue, checked;

		for ( i = 0; i < i_max; ++i )
		{
			element = this.named[name][i];
			nodeName = element.nodeName.toLowerCase();

			if ( nodeName === 'input' )
			{
				if ( element.type === 'radio' )
				{
					checked = ( value !== null && String( value ) === element.value );
					if ( checked !== element.checked )
					{
						element.checked = checked;
						if ( checked )
							changed.push( element );
					}

					continue;
				}
				else if ( element.type === 'checkbox' )
				{
					checked = !!value;
					if ( checked !== element.checked )
					{
						element.checked = checked;
						changed.push( element );
					}

					continue;
				}
				else if ( /^button|reset|submit$/.test( element.type ) )
				{
					continue;
				}
			}
			else if ( !(/^select|textarea$/).test( nodeName ) )
			{
				continue;
			}

			originalValue = element.value;
			element.value = String( value );

			if ( element.value !== originalValue )
				changed.push( element );
		}

		return changed;
	};
	Class.prototype.getValue = function( name )
	{
		var value;

		if ( typeof name === 'undefined' )
		{
			var values = {};
			for ( name in this.named )
			{
				value = this.getValue( name );
				if ( value !== null )
					values[name] = value;
			}

			return values;
		}

		if ( !this.named[name] )
			return null;

		value = null;

		var i = 0,
			i_max = this.named[name].length,
			element, nodeName;

		for ( ; i < i_max; ++i )
		{
			element = this.named[name][i];
			if ( !(/^string|number|boolean$/).test( typeof element.value ) )
				continue;

			nodeName = element.nodeName.toLowerCase();

			if ( nodeName === 'input' )
			{
				if ( /^radio|checkbox$/.test( element.type ) )
				{
					if ( !element.checked )
						continue;
				}
				else if ( /^button|reset|submit$/.test( element.type ) )
				{
					continue;
				}
			}
			else if ( !(/^textarea|select$/).test( nodeName ) )
			{
				continue;
			}

			if ( value instanceof Array )
				value.push( element.value );
			else if ( value !== null )
				value = [ value, element.value ];
			else
				value = element.value;
		}

		return value;
	};
	Class.prototype._indexElement = function( element, recursion )
	{
		var id = element.id,
			name = element.name,
			classes = this._classList( element.className ),
			ref = typeof element['data-serialize-reffed'] === 'string' ? element['data-serialize-reffed'] : element.getAttribute( 'data-serialize-reffed' ),
			labels = this._classList( typeof element['data-serialize-labeled'] === 'string' ? element['data-serialize-labeled'] : element.getAttribute( 'data-serialize-labeled' ) );

		if ( id )
			this._addReffed( id, element );
		if ( name )
			this._addNamed( name, element );
		if ( classes.length > 0 )
			this._addClassed( classes, element );
		if ( ref )
			this._addReffed( ref, element );
		if ( labels.length > 0 )
			this._addLabeled( labels, element );

		if ( !recursion )
			return;

		var i = 0,
			i_max = element.childNodes.length;

		for ( ; i < i_max; ++i )
		{
			if ( element.childNodes[i].nodeType === 1 )
				this._indexElement( element.childNodes[i], true );
		}
	};
	Class.prototype._resetIndex = function()
	{
		if ( !this._indexed )
			return;

		var i;

		for ( i in this.ref )
			delete this.ref[i];

		for ( i in this.named )
			!this.named.hasOwnProperty( i ) || ( this.named[i].length = 0 );

		for ( i in this.labeled )
			!this.labeled.hasOwnProperty( i ) || ( this.labeled[i].length = 0 );

		for ( i in this.classed )
			!this.classed.hasOwnProperty( i ) || ( this.classed[i].length = 0 );

		this._indexed = false;
	};
	Class.prototype._renderElementString = function( options, serialized )
	{
		if ( typeof serialized === 'string' )
			return this._encodeEntities( serialized );

		var tag = ['<', serialized[0]],
			attributes = serialized[1],
			i, i_max;

		for ( i in attributes )
		{
			if ( !attributes.hasOwnProperty( i ) )
				continue;

			tag.push( ' ', i, '="', this._encodeEntities( attributes[i] ), '"' );
		}

		if ( !this._isVoidTag( serialized[0] ) )
		{
			// Non-Void Element

			tag.push( '>' );

			for ( i = 2, i_max = serialized.length; i < i_max; ++i )
				tag.push( this._renderElementString( options, serialized[i] ) );

			tag.push( '</', serialized[0] );
		}
		else if ( options.xhtml )
		{
			tag.push( '/' );
		}

		tag.push( '>' );

		return tag.join( '' );
	};
	Class.prototype._serializeElement = function( options, element, parent )
	{
		if ( element.nodeType === 3 ) // Text
		{
			if ( parent )
				parent.push( element.nodeValue );

			return element.nodeValue;
		}

		if ( element.nodeType !== 1 ) // Not Element
			return false;

		var serialized = [element.nodeName.toLowerCase()],
			attributes = this._getAttribute( element ),
			count = 0,
			name;

		for ( name in attributes )
		{
			if ( !attributes.hasOwnProperty( name  ) )
				continue;

			if ( attributes[name] === null || attributes[name] === '' )
				delete attributes[name];
			else
				++count;
		}

		if ( !options.plainTag )
		{
			var modifiers = this._serializeModifiers( attributes );
			count -= modifiers.length;
			serialized[0] += modifiers.join( '' );
		}

		if ( count > 0 || options.forceAttributes )
			serialized.push( attributes );

		var i = 0,
			i_max = element.childNodes.length;

		for ( ; i < i_max; ++i )
			this._serializeElement( options, element.childNodes[i], serialized );

		if ( parent )
			parent.push( serialized );

		return serialized;
	};
	Class.prototype._serializeModifiers = function( attributes )
	{
		var modifiers = [];

		if ( attributes.hasOwnProperty( 'type' ) && this._addModifier( modifiers, '=', attributes.type ) )
			delete attributes.type;
		if ( attributes.hasOwnProperty( 'id' ) && this._addModifier( modifiers, '#', attributes.id ) )
			delete attributes.id;
		if ( attributes.hasOwnProperty( 'data-serialize-reffed' ) && this._addModifier( modifiers, '&', attributes['data-serialize-reffed'] ) )
			delete attributes['data-serialize-reffed'];
		if ( attributes.hasOwnProperty( 'name' ) && this._addModifier( modifiers, '@', attributes.name ) )
			delete attributes.name;
		if ( attributes.hasOwnProperty( 'data-serialize-labeled' ) && this._addModifier( modifiers, ':', attributes['data-serialize-labeled'], true ) )
			delete attributes['data-serialize-labeled'];
		if ( attributes.hasOwnProperty( 'class' ) && this._addModifier( modifiers, '.', attributes['class'], true ) )
			delete attributes['class'];

		return modifiers;
	};
	Class.prototype._addModifier = function( modifiers, prefix, value, list )
	{
		if ( list )
		{
			if ( !(/^\s*([^#@&:\/\.\s]+\s*)+$/).test( value ) )
				return false;

			modifiers.push( prefix + value.replace( /^\s+|\s+$/g, '' ).split( /\s+/ ).join( prefix ) );
		}
		else
		{
			if ( !(/^\s*[^#@&:\/\.\s]+\s*$/).test( value ) )
				return false;

			modifiers.push( prefix + value.replace( /^\s+|\s+$/g, '' ) );
		}

		return true;
	};
	Class.prototype._parse = function( data, isRoot )
	{
		if ( data.length === 0 )
		{
			if ( isRoot )
				data = ['span', { style: 'display: none;' }];
			else
				return null;
		}

		var element = this._validateElement( data[0] ),
			i = 1,
			i_max = data.length,
			children = [],
			attributes = {
				'class': [],
				'data-serialize-labeled': []
			},
			attr;

		for ( ; i < i_max; ++i )
		{
			if ( this._isJQuery( data[i] ) )
			{
				data[i].each( function()
				{
					children.push( [this] );
				});
			}
			else if ( this._isElement( data[i] ) )
			{
				children.push( [data[i]] );
			}
			else if ( this._isArray( data[i] ) )
			{
				children.push( data[i] );
			}
			else if ( this._isPlainObject( data[i] ) )
			{
				for ( attr in data[i] )
				{
					if ( !data[i].hasOwnProperty( attr ) )
						continue;

					if ( /^class|data-serialize-reffed$/.test( attr ) )
					{
						if ( data[i][attr] !== null && typeof data[i][attr] !== 'undefined' )
							attributes[attr].push( data[i][attr] );
					}
					else
					{
						attributes[attr] = data[i][attr];
					}
				}
			}
			else if ( data[i] !== null && typeof data[i] !== 'undefined' )
			{
				children.push( String( data[i] ) );
			}
		}

		if ( element instanceof Array )
			element = this._createElement( element, attributes );
		else
			element = this._existingElement( element, attributes );

		var child;
		for ( i = 0, i_max = children.length; i < i_max; ++i )
		{
			child = children[i];

			if ( typeof child === 'string' && child )
			{
				element.inner.appendChild( this.document.createTextNode( child ) );
			}
			else
			{
				child = this._parse( children[i] );
				if ( child )
					element.inner.appendChild( child );
			}
		}

		return element.outer;
	};
	Class.prototype._validateElement = function( element )
	{
		if ( typeof element === 'string' )
			return this._validateElementString( element );

		if ( this._isJQuery( element ) )
			element = element.get( 0 ) || false;
		else if ( !this._isElement( element ) )
			element = false;

		if ( !element )
			throw new Error( "Expecting String or DOM Element" );

		return element;
	};
	Class.prototype._validateElementString = function( str, isShortcut )
	{
		var strings = str.replace( /^\s+/, '' ).split( /\s(?![^a-z0-9]|\s|$)/ ),
			i = 0,
			i_max = strings.length,
			descriptions = [],
			matches,
			resolved;

		for ( ; i < i_max; ++i )
		{
			matches = strings[i].match( /^\s*([a-z0-9]+)\s*((?:[#@&:=\.][^#@&:=\.]+\s*)*)$/i );
			if ( matches === null )
				throw new Error( "Invalid Element String" );

			if ( !isShortcut && this.shortcuts.hasOwnProperty( matches[1] ) )
			{
				resolved = this._validateElementString( this.shortcuts[matches[1]], true );
				resolved[resolved.length - 1].modifiers += matches[2];

				descriptions = descriptions.concat( resolved );

				continue;
			}

			descriptions.push({
				tagName: matches[1],
				modifiers: matches[2]
			});
		}

		return descriptions;
	};
	Class.prototype._createElement = function( elements, attributes )
	{
		var attrs = elements.length === 1 ? attributes : {
				'class': [],
				'data-serialize-labeled': []
			},
			value;

		if ( elements[0].modifiers )
		{
			var modifiers = elements[0].modifiers.match( /[#@&:=\.][^#@&:=\.]+/g ),
				i = 0,
				i_max = modifiers.length,
				prefix;

			for ( i = 0; i < i_max; ++i )
			{
				prefix = modifiers[i].charAt(0);
				value = modifiers[i].substr( 1 ).replace( /\s+$/, '' );

				if ( prefix === '#' )
					attrs.id = value;
				else if ( prefix === '&' )
					attrs['data-serialize-reffed'] = value;
				else if ( prefix === '.' )
					attrs['class'].push( value );
				else if ( prefix === ':' )
					attrs['data-serialize-labeled'].push( value );
				else if ( prefix === '=' )
					attrs.type = value;
				else if ( prefix === '@' )
					attrs.name = value;
			}
		}

		var element = this._reservedTag( elements[0].tagName );

		if ( !element )
			element = this.document.createElement( elements[0].tagName );

		this._setAttribute( element, attrs );
		if ( this._indexing !== 'none' )
			this._indexElement( element, false );

		if ( elements.length > 1 )
		{
			elements.shift();
			var child = this._createElement( elements, attributes );

			element.appendChild( child.outer );

			return {
				outer: element,
				inner: child.inner
			};
		}

		return {
			outer: element,
			inner: element
		};
	};
	Class.prototype._existingElement = function( element, attributes )
	{
		if ( this._indexing === 'new' )
			this._indexElement( element, false );
		else if ( this._indexing === 'full' )
			this._indexElement( element, true );

		this._setAttribute( element, attributes );

		return {
			inner: element,
			outer: element
		};
	};
	Class.prototype._setAttribute = function( element, name, value )
	{
		if ( this._isPlainObject( name ) )
		{
			var i, changed = false;
			for ( i in name )
			{
				if ( name.hasOwnProperty( i ) )
					changed = this._setAttribute( element, i, name[i] ) || changed;
			}

			return changed;
		}

		name = name.replace( /(^\s+|\s$)/g, '' ).toLowerCase();
		if ( !name )
			throw new Error( "Expected Attribute Name" );

		if ( name === 'class' )
			element.className = this._combineAttributes( element.className, value );
		else if ( name === 'style' )
			element.style.cssText = this._combineAttributes( element.style.cssText, value, true );
		else if ( name === 'readonly' )
			element.readOnly = !!value;
		else if ( /^checked|disabled$/.test( name ) )
			element[name] = !!value;
		else if ( /^id|name|type|value|title/.test( name ) )
			element[name] = value;
		else if ( value === null || typeof value === 'undefined' )
			element.removeAttribute( name );
		else
		{
			if ( name === 'data-serialize-labeled' )
				value = this._combineAttributes( element.getAttribute( 'data-serialize-labeled' ), value );

			element.setAttribute( name, String( value ) );
		}
	};
	Class.prototype._getAttribute = function( element, name )
	{
		if ( typeof name === 'undefined' )
		{
			var attributes = {},
				i = 0,
				i_max = element.attributes.length;

			for ( ; i < i_max; ++i )
				attributes[element.attributes[i].nodeName] = element.attributes[i].nodeValue;

			var properties = ['class', 'style', 'readonly', 'checked', 'disabled', 'id', 'name', 'type', 'value', 'title'],
				value;

			i = properties.length;
			while ( i-- )
			{
				value = this._getAttribute( element, properties[i] );
				if ( value !== null )
					attributes[properties[i]] = value;
			}

			return attributes;
		}

		name = name.replace( /(^\s+|\s$)/g, '' ).toLowerCase();
		if ( !name )
			throw new Error( "Expected Attribute Name" );

		if ( name === 'class' )
			return element.className;
		else if ( name === 'style' )
			return element.style.cssText;
		else if ( name === 'readonly' )
			return element.readOnly ? 'readonly' : null;
		else if ( /^checked|disabled$/.test( name ) )
			return element[name] ? name : null;
		else if ( /^id|name|type|value|title$/.test( name ) )
			return ( typeof element[name] === 'undefined' ? null : element[name] );
		else
			return element.getAttribute( name );
	};
	Class.prototype._combineAttributes = function( current, added, isStyle )
	{
		if ( current === null || typeof current === 'undefined' )
			current = '';
		else if ( typeof current !== 'string' )
			current = String( current );

		if ( added === null || typeof added === 'undefined' )
			return null;

		if ( this._isArray( added ) )
		{
			if ( isStyle )
				added = Array.prototype.join.call( added, '; ' );
			else
				added = Array.prototype.join.call( added, ' ' );
		}
		else if ( typeof added !== 'string' )
		{
			added = String( added );
		}

		if ( !isStyle )
			added = added.replace( /^\s+|\s+$/g, '' ).replace( /\s+/g, ' ' );

		if ( !added )
			return current;
		else if ( current )
			return current + ' ' + added;
		else
			return added;
	};
	Class.prototype._addReffed = function( id, element )
	{
		if ( this._indexing === 'none' || !this._indexRefs )
			return;

		this.ref[id] = element;
	};
	Class.prototype._addNamed = function( name, element )
	{
		if ( this._indexing === 'none' || !this._indexNames )
			return;

		if ( !this.named.hasOwnProperty( name ) )
			this.named[name] = [];

		this.named[name].push( element );
	};
	Class.prototype._addLabeled = function( label, element )
	{
		if ( this._indexing === 'none' || !this._indexLabels )
			return;

		if ( this._isArray( label ) )
		{
			var i = 0,
				i_max = label.length;

			for ( ; i < i_max; ++i )
				this._addLabeled( label[i], element );

			return;
		}

		if ( !this.labeled.hasOwnProperty( label ) )
			this.labeled[label] = [];

		this.labeled[label].push( element );
	};
	Class.prototype._addClassed = function( className, element )
	{
		if ( this._indexing === 'none' || !this._indexClasses )
			return;

		if ( this._isArray( className ) )
		{
			var i = 0,
				i_max = className.length;

			for ( ; i < i_max; ++i )
				this._addClassed( className[i], element );

			return;
		}

		if ( !this.classed.hasOwnProperty( className ) )
			this.classed[className] = [];

		this.classed[className].push( element );
	};
	Class.prototype._classList = function( values )
	{
		if ( values === null || typeof values === 'undefined' )
			return [];

		if ( this._isArray( values ) )
			values = Array.prototype.join.call( values, ' ' );
		else if ( typeof values !== 'string' )
			values = String( values );

		values = values.replace( /^\s+|\s+$/g, '' );
		if ( !values )
			return [];

		return values.split( /\s+/ );
	};
	Class.prototype._encodeEntities = function( str )
	{
		return str.replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' ).replace( /"/g, '&quot;' ).replace( /'/g, '&apos;' );
	};
	Class.prototype._isVoidTag = function( tag )
	{
		return !(/^area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr$/).test( tag );
	};
	Class.prototype._reservedTag = function( tag )
	{
		switch ( tag )
		{
			case 'html':
				return this.document.documentElement || null;
			case 'head':
				return this.document.head || null;
			case 'body':
				return this.document.body || null;
		}

		return null;
	};
	Class.prototype._getDocument = function( source )
	{
		return ( source instanceof Object && typeof source.document === 'object' && source.document.nodeType === 9 ) ? source.document : null;
	};
	Class.prototype._isPlainObject = function( test )
	{
		return ( test instanceof Object && test.constructor === Object );
	};
	Class.prototype._isArray = function( test )
	{
		return ( test instanceof Object && test.splice instanceof Function && test.hasOwnProperty( 'length' ) && typeof test.length === 'number' );
	};
	Class.prototype._isElement = function( test )
	{
		return ( typeof test === "object" && test.nodeType === 1 );
	};
	Class.prototype._isDocument = function( test )
	{
		return ( typeof test === "object" && test.nodeType === 9 );
	};
	Class.prototype._isJQuery = function( test )
	{
		return typeof jQuery !== 'undefined' && test instanceof jQuery;
	};

	if ( typeof module !== 'undefined' && module instanceof Object )
	{
		// CommonJS
		module.exports = Class;
	}
	else
	{
		// Non-Modular
		global.DOMaker = Class;
		if ( typeof global.D === 'undefined' )
			global.D = global.DOMaker;
	}

}( this ));
