function xhrrpc(url, method, callback) {
  var req = new XMLHttpRequest();

  req.open('POST', url, true);
  req.onreadystatechange = function (aEvt) {
    if (req.readyState == 4 && req.status == 200) {
      var value = req.responseXML.getElementsByTagName('value')[0];
      callback(XMLRPC.decode(getFirstRealChild(value)));
    }
  }
  req.setRequestHeader('Content-Type', 'text/xml');

  var post = "<?xml version='1.0'?>\n<methodCall>";
  post += "<methodName>" + method + "</methodName>";
  if (arguments.length > 3) {
    post += "<params>"
    for (var i=3; i<arguments.length; i++) {
      post += "<param>" + XMLRPC.encode(arguments[i]) + "</param>";
    }
    post += "</params>"
  }
  post += "</methodCall>";
  req.send(post);
}

