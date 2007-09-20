// Ian's quick-n-dirty xmlrpc js library
// Copyright (c) Ian McKellar, Jesse Andrews 2007, All Rights Reserved
// It's GPLed, bitches
// reference: http://www.xmlrpc.com/spec

// how to use:
//  XMLRPC.encode(obj) encodes obj, a JavaScript object, as an XMLRPC string
//  XMLRPC.decode(xml) decodes xml, a DOM Element, string into a JavaScript object

// how to extend:
//  if you want to support more types just extend XMLRPC.encode and 
//  XMLRPC.decode. it's pretty simple - do something like this...
//  FIXME


// TODO:
//  * implement datetime & base64 - can be done as extensions


var XMLRPC = {};

XMLRPC.xmlencode = function (s) {
    // FIXME: escape non-ascii?
    return s.replace('&', '&amp;').replace('<', '&lt;');
}
XMLRPC.xmldecode = function (s) {
    // FIXME: escape non-ascii?
    return s.replace('&lt;', '<').replace('&amp;', '&');
}
XMLRPC.encode = function (o) {
    // work out if its some kind of nothing
    var undef = (o === undefined);
    var nul = (o === null);
    if (undef || nul) {
        return;
    }

    // what kind of something is it? what's our evidence?
    var to = typeof(o);
    var constr = null;
    try { constr = o.constructor.name; } catch (e) { }

    // now, based on what it is, return stuff

    // primitive types
    if (to == 'number') {
        // FIXME: provide a way to force one type or another on a per-value basis?
        if (Math.floor(o) == o) {
            return '<int>'+o+'</int>';
        } else {
            return '<double>'+o+'</double>';
        }
    }
    if (to == 'boolean') {
        return '<boolean>'+(o?'1':'0')+'</boolean>';
    }
    if (to == 'string') {
        return '<string>'+XMLRPC.xmlencode(o)+'</string>';
    }

    // compound types
    if (constr == 'Array') {
        var value = '<array>';
        for (var i=0; i<o.length; i++) {
            var v = XMLRPC.encode(o[i]);
            if (v) {
                value = value + '<value>'+v+'</value>';
            }
        }
        value = value + '</array>';
        return value;
    }
    if (to == 'object') {
        var value = '<struct>';
        for (var k in o) {
            var v = XMLRPC.encode(o[k]);
            if (v) {
                value = value + '<member>';
                value = value + '<name>' + XMLRPC.xmlencode(k.toString()) + '</name>';
                value = value + '<value>'+v+'</value>';
                value = value + '</member>';
            }
        }
        value = value + '</struct>';
        return value;
    }
    return null;
}
XMLRPC.decode = function (s) {
    // primitives
    if (s.localName == 'int' || s.localName == 'i4') {
        return parseInt(s.textContent);
    }
    if (s.localName == 'double') {
        return parseFloat(s.textContent);
    }
    if (s.localName == 'string') {
        return s.textContent;
    }
    if (s.localName == 'boolean') {
        return parseInt(s.textContent) != 0;
    }

    // compounds
    if (s.localName == 'array') {
        var value = [];
        var values = s.getElementsByTagName('value');
        for (var i=0; i<values.length; i++) {
            var valnode = values[i].firstChild;
            while (valnode.nodeType != Node.ELEMENT_NODE) {
                valnode = valnode.nextSibling;
            }
            value.push(XMLRPC.decode(valnode));
        }
        return value;
    }

    if (s.localName == 'struct') {
        var obj = {};
        var members = s.getElementsByTagName('member');
        for (var i=0; i<members.length; i++) {
            var property, value, nodes = members[i].childNodes;
            for (var j=0; j<nodes.length; j++) {
                if (nodes[j].localName == 'name') {
                    property = nodes[j].textContent;
                }
                if (nodes[j].localName == 'value') {
                    var valnode = nodes[j].firstChild;
                    while (valnode.nodeType != Node.ELEMENT_NODE) {
                        valnode = valnode.nextSibling;
                    }
                    value = XMLRPC.decode(valnode)
                }
                obj[property] = value;
            }
            return obj;
        }
    }
}

XMLRPC.test = function (jsobj, xmlstring) {
    // try to round-trip
    console.log('testing '+jsobj.toSource()+' with '+xmlstring);
    var encoded = XMLRPC.encode(jsobj);
    if (encoded != xmlstring) {
        console.log(' encoded to: '+encoded);
        return false;
    }
    var doc = (new DOMParser()).parseFromString(encoded, "text/xml");
    var reencoded = XMLRPC.encode(XMLRPC.decode(doc.documentElement));
    if (reencoded != xmlstring) {
        console.log(' re-encoded to: '+reencoded);
        return false;
    }
    return true;
}

var tests = [
    [0,'<int>0</int>'],
    [1,'<int>1</int>'],
    [1.5,'<double>1.5</double>'],
    ['hello world','<string>hello world</string>'],
    ['', '<string></string>'],
    [false, '<boolean>0</boolean>'],
    [true, '<boolean>1</boolean>'],
    [[1,2,3], '<array><value><int>1</int></value><value><int>2</int></value><value><int>3</int></value></array>'],
    [[1,'hello world',3], '<array><value><int>1</int></value><value><string>hello world</string></value><value><int>3</int></value></array>'],
    [{answer: 42}, '<struct><member><name>answer</name><value><int>42</int></value></member></struct>'],
];

var success=0;
for (var i=0; i<tests.length; i++) {
    if (XMLRPC.test(tests[i][0], tests[i][1])) {
        success++;
    }
}
console.log(''+success+' of '+tests.length+' tests passed');
