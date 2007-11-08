
function Tracker() {
  var inst=this;
  var $ = function(x) { return document.getElementById(x) };
  const Cc = Components.classes;
  const Ci = Components.interfaces;
  var PREFS = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService).getBranch('extension.foxtracs.');

  this.init = function() {
    if (PREFS.getPrefType('baseUrl')) {
      inst.load();
    }
    else {
      inst.setup();
    }
  }

  this.url = function() {
    return PREFS.getCharPref('baseUrl');
  }

  this.user = function() {
    return PREFS.getCharPref('user');
  }

  this.pass = function() {
    return PREFS.getCharPref('pass');
  }

  this.save = function() {
    PREFS.setCharPref('baseUrl', $('trac-url').value);
    PREFS.setCharPref('user', $('trac-user').value);
    PREFS.setCharPref('pass', $('trac-pass').value);
    inst.load();
  }

  this.load = function() {
    var rdf = new RDF();

    // xhrrpc('ticket.create', function(result) {
    //   console.log(result);
    // }, 'summary is here', 'description is here', {type: "task"} );
    // xhrrpc(inst.url(), 'ticket.putAttachment', function(result) { console.log(result) }, 
    //    1, 'test2.png', 'test of png upload', new Base64("iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9YGARc5KB0XV+IAAAAddEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIFRoZSBHSU1Q72QlbgAAAF1JREFUGNO9zL0NglAAxPEfdLTs4BZM4DIO4C7OwQg2JoQ9LE1exdlYvBBeZ7jqch9//q1uH4TLzw4d6+ErXMMcXuHWxId3KOETnnXXV6MJpcq2MLaI97CER3N0vr4MkhoXe0rZigAAAABJRU5ErkJggg=="));
    // xhrrpc('wiki.getAllPages', function(pages) {
    //   console.log(pages);
    // });

    xhrrpcLogin(inst.url(), inst.user(), inst.pass());

    xhrrpc(inst.url(), 'ticket.query', function(tickets) {
      tickets.forEach(function(ticketId) {
        xhrrpc(inst.url(), 'ticket.get', function(info) {
          info[3].id = info[0];
          info[3].created = info[1];
          info[3].changed = info[2];
          rdf.tickets.add('ticket:'+info[0], info[3]);
        }, ticketId);
      });
    });
/*
    xhrrpc(inst.url(), 'wiki.getAllPages', function(pages) {
      pages.forEach(function(pageId) {
        xhrrpc(inst.url(), 'wiki.getPageInfo', function(info) {
          rdf.pages.add('page:'+pageId, info);
        }, pageId);
      });
    });
*/
    inst.tickets();
  }

  this.setup = function() {
    if (PREFS.getPrefType('baseUrl')) {
      $('trac-url').value = PREFS.getCharPref('baseUrl');
    }
    $('trac-deck').selectedIndex = 0;
  }

  this.tickets = function() {
    $('trac-deck').selectedIndex = 1;
  }

  this.pages = function() {
    $('trac-deck').selectedIndex = 2;
  }
}

var tracker = new Tracker();

tracker.init();

