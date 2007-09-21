
function Tracker() {
  var inst=this;
  var $ = function(x) { return document.getElementById(x) };
  var CC = Components.classes;
  var CI = Components.interfaces;
  const RDFS = CC['@mozilla.org/rdf/rdf-service;1'].getService(CI.nsIRDFService);
  const RDFCU = CC['@mozilla.org/rdf/container-utils;1'].getService(CI.nsIRDFContainerUtils);
  const NSRDF = function(name) { return RDFS.GetResource('http://home.netscape.com/NC-rdf#'+name); }
  var PREFS = CC['@mozilla.org/preferences-service;1'].getService(CI.nsIPrefService).getBranch('extension.foxtracs.');

  function xhrrpc(method, params, callback) {
    var req = new XMLHttpRequest();
    var base_url = PREFS.getCharPref('baseUrl');
    var url = base_url + '/xmlrpc'

    var post = "<?xml version='1.0'?>\n<methodCall>";
    post += "<methodName>" + method + "</methodName>";
    if (params != null) {
      post += "<params><param><value><i4>"+params+"</i4></value></param></params>";
    }
    post += "</methodCall>";

    req.open('POST', url, true);
    req.setRequestHeader('Content-Type', 'text/xml');
    req.onreadystatechange = function (aEvt) {
      if (req.readyState == 4 && req.status == 200) {
        var value = req.responseXML.getElementsByTagName('value')[0];
        callback(XMLRPC.decode(getFirstRealChild(value)));
      }
    }
    req.send(post);
  }

  function RDF() {
    var inst=this;

    this.ds = Components.classes['@mozilla.org/rdf/datasource;1?name=in-memory-datasource']
                        .createInstance(CI.nsIRDFDataSource);

    this.bag = RDFCU.MakeBag(this.ds, RDFS.GetResource("urn:root"));

    this.add = function( uri, val ) {
      var resource = RDFS.GetResource(uri);
      for (var k in val) {
        inst.ds.Assert(resource, NSRDF(k), RDFS.GetLiteral(val[k]), true);
      }
      inst.bag.AppendElement(resource);
    }
  }
  
  this.init = function() {
    if (PREFS.getPrefType('baseUrl')) {
      inst.load();
    }
    else {
      inst.setup();
    }
  }

  this.save = function() {
    PREFS.setCharPref('baseUrl', $('trac-url').value);
    inst.load();
  }

  this.load = function() {
    var rdf = new RDF();

    $('mytree').database.AddDataSource(rdf.ds);
    $('mytree').builder.rebuild();
    $('mylist').database.AddDataSource(rdf.ds);
    $('mylist').builder.rebuild();

    xhrrpc('ticket.query', null, function(tickets) {
      for (var i=0; i<tickets.length; i++) {
        xhrrpc('ticket.get', tickets[i], function(info) {
          rdf.add('ticket:'+info[0], info[3]);
        });
      }
    });
            // rdf.add(base_url+'/ticket/' + val['ticket'], val);
    inst.list();
  }
  this.setup = function() {
    if (PREFS.getPrefType('baseUrl')) {
      $('trac-url').value = PREFS.getCharPref('baseUrl');
    }
    
    $('trac-deck').selectedIndex = 0;
  }
  this.list = function() {
    $('trac-deck').selectedIndex = 1;
  }
  this.tree = function() {
    $('trac-deck').selectedIndex = 2;
  }
}

var tracker = new Tracker();

tracker.init();

