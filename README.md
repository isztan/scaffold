DOMaker
==========

Document Object Maker - Create your DOM from data, not strings.

* Create complex DOM structures easily and efficiently
* Keep handles to ID'd, referenced, named, classed, and labeled elements
* Allow serialization of existing DOM

__This document is incomplete and will be updated as soon as possible. It's accurate as far as it goes, but does not include some new features.__

Terms
-----

* __descriptor__ (array)
    * An array describing a DOMElement either existing or to be created. The first item in a descriptor must be a _tag_ string or a DOMElement instance. All following items are children or attribute maps.
    * __tag__ (string)
        * The first item in a _descriptor_ array. A string which begins with a tag name, followed by optional modifiers.
        * _tag_ __name__ (string)
            * HTML tag name such as 'div', 'span', etc.
            * Can only contain letters and numbers.
            * May also be the name of a shortcut.
        * _tag_ __modifier__ (string)
            * Part of the tag string following the _name_ part of the tag.
            * Multiple modifiers can be added. Each must begin with a modifier prefix indicating an id, name, type, class, label, or reference modifier. Labels and references are DOMBuilder markup constructs.
            * Prefixes must be followed by at least one non-prefix, non-whitespace character. All other characters are valid in modifier values.
            * Escaping of prefix characters is not supported.
            * Prefixes:
                * `=` Type
                * `#` ID
                * `&` Reference
                * `@` Name
                * `:` Label
                * `.` Class
        * Example Tag With Modifiers: `input=text#id&reference@name:label1:label2.class1.class2`
    * __attribute map__ (object)
        * Any plain object (.constructor === Object) following the _tag_ in a _descriptor_ array.
        * All properties of the object will be applied to the element as attributes.
    * __child__ (string|array|DOMElement)
        * Strings will be appended to the element as text nodes.
        * DOMElements will be appended as children.
        * Arrays are recursively parsed as child element _descriptors_ and the resulting element will be appended as a child.
* __DOMElement__
    * Used to indicate a native DOM element class instance. There is no standard name across browsers and javascript engines, so this means whatever your environment chooses to call it.

API
---

All of the following are equivalent and return a new instance of DOMBuilder.

    DOMBuilder([ 'div', ['span', ...], ['span', ...], ...]);
    DOMBuilder( 'div', ['span', ...], ['span', ...] );
    DOMBuilder.render([ 'div', ['span', ...], ['span', ...], ...]);
    DOMBuilder.render( 'div', ['span', ...], ['span', ...] );
    new DOMBuilder([ 'div', ['span', ...], ['span', ...], ...]);
    new DOMBuilder( 'div', ['span', ...], ['span', ...] );

Additionally, a JSON string containing an array can be used with the load method.

    DOMBuilder.load( "[ 'div', ['span', ...], ['span', ...], ...]" );

The returned DOMBuilder instance has the following properties and property aliases:

* `element`
    * aliases: `e` `el`
    * Contains the top level element.
* `ref`
    * aliases: `r` `#` `&`
    * Contains a map of all ID'd or referenced elements.
* `named`
    * aliases: `n` `@`
    * Contains a map of arrays of all named elements.
* `labeled`
    * aliases: `l` `:`
    * Contains a map of arrays of all labeled elements.
* `classed`
    * aliases: `c` `.`
    * Contains a map of arrays of all classed elements.

The first value of an element array is the element description string (tagName with optional prefixed modifiers), *or* an existing DOM element. Additional elements are text nodes, DOM elements, child element arrays, or attribute map objects.

The element description string follows this format (Note the use of `=`, `#`, `&`, `@`, and `:` in the element description denoting modifiers):

    tagName=type#id&ref@name:label.class

The tagName can be any combination of letters and numbers and it must be at least one character long. Types, Ids, references, names, labels, and classes can be in any order after the tagName. Only one type, ID, reference, and/or name should be given. Any number of references, labels, or classes can be set.

* `=` Adds a type attribute to the element
* `#` Adds the element to `ref` and adds an ID attribute to the element
* `&` Adds the element to `ref`
* `@` Adds the element to `named` and adds a name attribute to the element
* `:` Adds the element to `labeled`
* `.` Adds the element to `classed` and adds classes to the element

### Example 1: creating an element

    var instance = DOMBuilder( 'div#id.class1.class2', 'Some text...', { attribute: '1', style: 'float: left;' } );

Renders to...

    <div id="id" class="class1 class2" attribute="1" style: 'float: left;'></div>

### Example 2: creating an element with children

    var instance = DOMBuilder( 'div',
      ['span#title.title-text', 'Sign In Box']
      ['input=text@username:inputs', { value: 'foo'}],
      ['input=password:inputs', { name: 'password', value: 'bar'}],
      ['span&help', { 'class': 'help-text' }, Enter your username and password, please.' ]
    );

Renders to...

    <div>
      <span id="title" class="title-text">Sign In Box</span>
      <input type="text" name="username" value="foo" />
      <input type="password" name="password" value="bar" />
      <span class="help-text">Enter your username and password, please.</span>
    </div>

The outer most div can be accessed via the `element` property of the returned DOMBuilder instance.

    instance.element;

The title and help SPANs can be found in the `ref` property because of the #title and &help modifiers in their respective element description strings.

    instance.ref.title; // The title SPAN.
    instance.ref.help; // The help SPAN.

The title and help SPANs can also be found in the `classed` property because they have classes.

    instance.classed['title-text'][0]; // The title SPAN.
    instance.classed['help-text'][0]; // The help SPAN.

The two inputs were named so they can be found in the `named` property.

    instance.named.username[0]; // The username INPUT.
    instance.named.password[0]; // The password INPUT.

The inputs were also labeled so they can be found in the `labeled` property.

    instance.labeled.inputs[0]; // The username INPUT.
    instance.labeled.inputs[1]; // The password INPUT.

### Example 3: adding to and moving existing elements

Here we're moving *existing* `<div id="bar">` into *existing* `<div id="foo">`, adding a *new* `<span>` to both of the existing elements.

    DOMBuilder( document.getElementById( 'foo' ),
      [document.getElementById( 'bar' ),
        ['span', 'A new span.']
      ],
      ['span', 'Another new span.']
    );

### Example 4: quick wrapping

If you want to quickly wrap an element with one or more simple outer elements, it is not necessary to nest arrays. The following two instances are equivalent.

    DOMBuilder( 'div.outer div.middle div.inner', { id: 'test' }, 'Content' );

    DOMBuilder( 'div.outer',
      ['div.middle',
        ['div.inner', { id: 'test' }, 'Content']
      ]
    );

Both of them render to...

    <div class="outer">
      <div class="middle">
        <div class="inner" id="test">Content</div>
      </div>
    <div>

### Example 5: shortcuts

Shortcuts are pseudo tagNames that expand to valid HTML tagNames plus IDs, classes, names, types, and labels. By defaul , there are shortcuts for all input and button types. These will create input/button elements with a type attribute. The following instances are equivalent.

    DOMBuilder( 'checkbox@myCheckbox', { value: "foo" } );
    DOMBuilder( 'input=checkbox@myCheckbox', { value: "foo" } );
    DOMBuilder( 'input@myCheckbox', { type: "checkbox", value: "foo" } );

All of them render to...

    <input type="checkbox" name="myCheckbox" value="foo" />

Additional shortcuts can be used by defining properties in the `DOMBuilder.shortcuts` map.

* Shortcuts **can** expand to a set of nested elements using the quick
  wrapping technique in example 4.
* Shortcuts **cannot** reference other shortcuts.
