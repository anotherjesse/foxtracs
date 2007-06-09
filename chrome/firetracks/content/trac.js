function Tracker() {
  var inst=this;
  var $ = function(x) { return document.getElementById(x) };
  var CC = Components.classes;
  var CI = Components.interfaces;
  const RDFS = CC['@mozilla.org/rdf/rdf-service;1'].getService(CI.nsIRDFService);
	const RDFCU = CC['@mozilla.org/rdf/container-utils;1'].getService(CI.nsIRDFContainerUtils);
	const NSRDF = function(name) { return RDFS.GetResource('http://home.netscape.com/NC-rdf#'+name); }
  var PREFS = CC['@mozilla.org/preferences-service;1'].getService(CI.nsIPrefService).getBranch('extension.firetracks.');
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
    var base_url = PREFS.getCharPref('baseUrl');
	  var rdf = new RDF();

		$('mytree').database.AddDataSource(rdf.ds);
		$('mytree').builder.rebuild();
		$('mylist').database.AddDataSource(rdf.ds);
		$('mylist').builder.rebuild();
		
  	var url = base_url + "/report/1?format=tab"; // report 7 is my tickets by default
	  var req = new XMLHttpRequest();
	  req.open('GET', url, true); 
	  req.onreadystatechange = function (aEvt) {
	  	if (req.readyState == 4) {
	    	if (req.status == 200) {
					var lines = req.responseText.split('\n');
					var fields = lines[0].split('\t');
					for (var i=1; i < lines.length; i++) {
						var tabs = lines[i].split('\t');
						var val = {}
						for (var j=0; j < tabs.length; j++)
							val[fields[j]] = tabs[j];
						if (tabs.length > 2) {
						rdf.add(base_url+'/ticket/' + val['ticket'], val);
						}
					}
				}
	    }
	  };
	  req.send(null);
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

