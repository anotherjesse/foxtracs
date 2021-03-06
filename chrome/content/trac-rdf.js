function RDF() {
  const Cc = Components.classes;
  const Ci = Components.interfaces;
  const RDFS = Cc['@mozilla.org/rdf/rdf-service;1'].getService(Ci.nsIRDFService);
  const RDFCU = Cc['@mozilla.org/rdf/container-utils;1'].getService(Ci.nsIRDFContainerUtils);
  const NSRDF = function(name) { return RDFS.GetResource('http://home.netscape.com/NC-rdf#'+name); }

  var ds = RDFS.GetDataSource('rdf:trac', false);
  var root = RDFCU.MakeBag(ds, RDFS.GetResource('urn:root'));

  function Bag(urn) {
    var bag = RDFCU.MakeBag(ds, RDFS.GetResource(urn));
    this.add = function( uri, val ) {
      var resource = RDFS.GetResource(uri);
      for (var k in val) {
        ds.Assert(resource, NSRDF(k), RDFS.GetLiteral(val[k]), true);
      }
      bag.AppendElement(resource);
    }
  }

  this.tickets = new Bag('urn:tickets');
  this.pages = new Bag('urn:pages');
  this.wrap = function(urn) {
    var resource = RDFS.GetResource(urn);
    return function(property) {
      var target = ds.GetTarget(resource, NSRDF(property), true);
      if (target instanceof Components.interfaces.nsIRDFLiteral){
         return target.Value;
      }
    }
  }
}

