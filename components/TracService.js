// Copyright 
//   Jesse Andrews, 2007
//   Flock Inc. 2005-2006, http://flock.com
// 
// This file may be used under the terms of of the
// GNU General Public License Version 2 or later (the "GPL"),
// http://www.gnu.org/licenses/gpl.html
// 
// Software distributed under the License is distributed on an "AS IS" basis,
// WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
// for the specific language governing rights and limitations under the
// License.

const CI = Components.interfaces;
const CC = Components.classes;
const CR = Components.results;

const TRAC_CID        = Components.ID('{0805af5a-68c7-11dc-8314-0800200c9a66}');
const TRAC_CONTRACTID = '@mozilla.org/rdf/datasource;1?name=trac';

function TracService() {
    this.dataSource = CC["@mozilla.org/rdf/datasource;1?name=in-memory-datasource"].createInstance(CI.nsIRDFDataSource);
}

/* 
    I'm a rdf wrapper - yo yo
*/

TracService.prototype.URI = 'rdf:trac';
TracService.prototype.GetSource = function(aProperty, aTarget, aTruthValue) {
    return this.dataSource.GetSource(aProperty, aTarget, aTruthValue); 
}
TracService.prototype.GetSources = function(aProperty, aTarget, aTruthValue) {
    return this.dataSource.GetSources(aProperty, aTarget, aTruthValue); 
}
TracService.prototype.GetTarget = function(aSource, aProperty, aTruthValue) {
    return this.dataSource.GetTarget(aSource, aProperty, aTruthValue); 
}
TracService.prototype.GetTargets = function(aSource, aProperty, aTruthValue) {
    return this.dataSource.GetTargets(aSource, aProperty, aTruthValue); 
}
TracService.prototype.Assert = function(aSource, aProperty, aTarget, aTruthValue) {
    this.dataSource.Assert(aSource, aProperty, aTarget, aTruthValue); 
}
TracService.prototype.Unassert = function(aSource, aProperty, aTarget) {
    this.dataSource.Unassert(aSource, aProperty, aTarget); 
}
TracService.prototype.Change = function(aSource, aProperty, aOldTarget, aNewTarget) {
    this.dataSource.Change(aSource, aProperty, aOldTarget, aNewTarget); 
}
TracService.prototype.Move = function(aOldSource, aNewSource, aProperty, aTarget) {
    this.dataSource.Move(aOldSource, aNewSource, aProperty, aTarget); 
}
TracService.prototype.HasAssertion = function(aSource, aProperty, aTarget, aTruthValue) {
    return this.dataSource.HasAssertion(aSource, aProperty, aTarget, aTruthValue); 
}
TracService.prototype.AddObserver = function(aObserver) {
    this.dataSource.AddObserver(aObserver); 
}
TracService.prototype.RemoveObserver = function(aObserver) {
    this.dataSource.RemoveObserver(aObserver); 
}
TracService.prototype.ArcLabelsIn = function(aNode) {
    return this.dataSource.ArcLabelsIn(aNode); 
}
TracService.prototype.ArcLabelsOut = function(aNode) {
    return this.dataSource.ArcLabelsOut(aNode); 
}
TracService.prototype.GetAllResources = function() {
    return this.dataSource.GetAllResources(); 
}
TracService.prototype.IsCommandEnabled = function(aSources, aCommand, aArguments) {
    return this.dataSource.IsCommandEnabled(aSources, aCommand, aArguments); 
}
TracService.prototype.DoCommand = function(aSources, aCommand, aArguments) {
    this.dataSource.DoCommand(aSources, aCommand, aArguments); 
}
TracService.prototype.GetAllCmds = function(aSource) {
    return this.dataSource.GetAllCmds(aSource); 
}
TracService.prototype.hasArcIn = function(aNode, aArc) {
    return this.dataSource.hasArcIn(aNode, aArc); 
}
TracService.prototype.hasArcOut = function(aNode, aArc) {
    return this.dataSource.hasArcOut(aNode, aArc); 
}
TracService.prototype.beginUpdateBatch = function() {
    this.dataSource.beginUpdateBatch(); 
}
TracService.prototype.endUpdateBatch = function() {
    this.dataSource.endUpdateBatch(); 
}
TracService.prototype.Flush = function() {
    this.dataSource.Flush(); 
}
TracService.prototype.FlushTo = function(aURI) {
    this.dataSource.FlushTo(aURI); 
}
TracService.prototype.Init = function(aURI) {
    this.dataSource.Init(aURI); 
}
TracService.prototype.Refresh = function(aBlocking) {
    this.dataSource.Refresh(aBlocking); 
}

// CRAPPY REPEATED STUFF

TracService.prototype.flags = CI.nsIClassInfo.SINGLETON;
TracService.prototype.classDescription = "Trac Service";
TracService.prototype.getInterfaces = function(count) {
    var interfaceList = [CI.nsIRDFDataSource, CI.nsIClassInfo];
    count.value = interfaceList.length;
    return interfaceList;
}

TracService.prototype.getHelperForLanguage = function(count) {return null;}

TracService.prototype.QueryInterface = function(iid) {
    if (!iid.equals(CI.nsIRDFDataSource) &&
        !iid.equals(CI.nsIClassInfo) &&
        !iid.equals(CI.nsISupports))
        throw CR.NS_ERROR_NO_INTERFACE;
    if (iid.equals(CI.nsIRDFDataSource) && !this.dataSourceSetup) { }
    return this;
}

// Module implementation
var TracModule = new Object();

TracModule.registerSelf = function(compMgr, fileSpec, location, type) {
    compMgr = compMgr.QueryInterface(CI.nsIComponentRegistrar);
    compMgr.registerFactoryLocation(TRAC_CID, "Trac JS Component", TRAC_CONTRACTID, fileSpec, location, type);
}

TracModule.getClassObject = function(compMgr, cid, iid) {
    if (!cid.equals(TRAC_CID))
        throw CR.NS_ERROR_NO_INTERFACE;
    
    if (!iid.equals(CI.nsIFactory))
        throw CR.NS_ERROR_NOT_IMPLEMENTED;
    
    return TracServiceFactory;
}

TracModule.canUnload = function(compMgr) {
    return true;
}
    
// factory object
var TracServiceFactory = new Object();

TracServiceFactory.createInstance = function(outer, iid) {
    if (outer != null)
        throw CR.NS_ERROR_NO_AGGREGATION;

    return (new TracService()).QueryInterface(iid);
}

// entrypoint
function NSGetModule(compMgr, fileSpec) {
    return TracModule;
}
