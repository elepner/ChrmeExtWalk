// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

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



chrome.browserAction.onClicked.addListener(function (tab) {


    chrome.tabs.sendMessage(tab.id, { text: 'report_back' }, function(dom){
        var walkmeObject = htmlReturned(dom);
        var paramString = "";
        Object.keys(walkmeObject).forEach(function (key) {
            paramString += key + "=" + walkmeObject[key] + "&"
        });
        chrome.windows.create({ url: "info.html?" + tab.id, type: "popup", width: 800, height: 600 });
    });

    //chrome.windows.create({ url: "headers.html?", type: "popup", width: 800, height: 600 });
});

var version = "1.0";

