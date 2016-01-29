
var tabId = parseInt(window.location.search.substring(1));
var WALK_ME_URL = "cdn.walkme.com"

function htmlReturned(domContent) {
    var el = document.createElement('html');
    el.innerHTML = domContent;
    var scripts = el.getElementsByTagName('script');
    var walkmeObject;
    for(var i = 0; i < scripts.length; i++){
        var scriptElement = scripts[i];
        var parser = document.createElement('a');
        parser.href = scriptElement.src;
        if(parser.hostname && parser.hostname.indexOf(WALK_ME_URL) > -1){
            walkmeObject = {};
            var urlParams = parser.pathname.split('/');
            walkmeObject.userId = urlParams[2];
            walkmeObject.production = !(parser.pathname.indexOf('test') > -1);
            walkmeObject.protocol = parser.protocol;
            walkmeObject.host = parser.hostname;
            walkmeObject.async = !!scriptElement.getAttribute('async');
            break;
        }
    }
    return walkmeObject;   
}


chrome.tabs.sendMessage(tabId, { text: 'report_back' }, function(dom){
        var walkMeObject = htmlReturned(dom);
        var container = document.getElementById("container");
        Object.keys(walkMeObject).forEach(function(key) {
            var k = document.createElement("h3");
            k.innerHTML = key + ": ";
            var v = document.createElement("p");
            v.innerHTML = walkMeObject[key];
            container.appendChild(k);
            container.appendChild(v);
            container.appendChild(document.createElement('br'));
        });
});

