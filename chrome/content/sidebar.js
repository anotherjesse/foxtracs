
function Tracker() {
  var inst=this;
  var $ = function(x) { return document.getElementById(x) };
  const Cc = Components.classes;
  const Ci = Components.interfaces;
  var PREFS = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService).getBranch('extension.foxtracs.');

  function RDF() {
    const RDFS = Cc['@mozilla.org/rdf/rdf-service;1'].getService(Ci.nsIRDFService);
    const RDFCU = Cc['@mozilla.org/rdf/container-utils;1'].getService(Ci.nsIRDFContainerUtils);
    const NSRDF = function(name) { return RDFS.GetResource('http://home.netscape.com/NC-rdf#'+name); }

    var ds = RDFS.GetDataSource('rdf:trac', false);
    var bag = RDFCU.MakeBag(ds, RDFS.GetResource("urn:root"));

    this.add = function( uri, val ) {
      var resource = RDFS.GetResource(uri);
      for (var k in val) {
        ds.Assert(resource, NSRDF(k), RDFS.GetLiteral(val[k]), true);
      }
      bag.AppendElement(resource);
    }

    this.showOn = function(element) {
      element.database.AddDataSource(ds);
      element.builder.rebuild();
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

  this.url = function() {
    return PREFS.getCharPref('baseUrl') + '/xmlrpc';
  }

  this.save = function() {
    PREFS.setCharPref('baseUrl', $('trac-url').value);
    inst.load();
  }

  this.load = function() {
    var rdf = new RDF();

    rdf.showOn($('mylist'))

    // xhrrpc('ticket.create', function(result) {
    //   console.log(result);
    // }, 'summary is here', 'description is here', {type: "task"} );
    // xhrrpc('ticket.putAttachment', function(result) { console.log(result) }, 
    //   1, 'test2.png', 'test of png upload', new Base64("iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9YGARc5KB0XV+IAAAAddEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIFRoZSBHSU1Q72QlbgAAAF1JREFUGNO9zL0NglAAxPEfdLTs4BZM4DIO4C7OwQg2JoQ9LE1exdlYvBBeZ7jqch9//q1uH4TLzw4d6+ErXMMcXuHWxId3KOETnnXXV6MJpcq2MLaI97CER3N0vr4MkhoXe0rZigAAAABJRU5ErkJggg=="));
    // xhrrpc('wiki.getAllPages', function(pages) {
    //   console.log(pages);
    // });

    xhrrpc(inst.url(), 'ticket.query', function(tickets) {
      for (var i=0; i<tickets.length; i++) {
        xhrrpc(inst.url(), 'ticket.get', function(info) {
          info[3].id = info[0];
          info[3].created = info[1];
          info[3].changed = info[2];
          rdf.add('ticket:'+info[0], info[3]);
        }, tickets[i]);
      }
    });
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
}

var tracker = new Tracker();

tracker.init();

