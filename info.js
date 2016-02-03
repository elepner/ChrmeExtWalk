
var tabId = parseInt(window.location.search.substring(1));
var WALK_ME_URL = "cdn.walkme.com"
var WALK_ME_REGEXP = /(?:^|\/)walkme_(.*?)_https.js$/g;
var SETTINGS_PATTERN = "https://s3.amazonaws.com/s3.maketutorial.com/users/"

function parseResponseConfigurationObjectText(resoponse) {
    console.log(resoponse);
    var beginning = "window.fixedCallback&&fixedCallback(";
    var end = ");"
    var cut = resoponse.substr(beginning.length, resoponse.length - beginning.length - end.length);
    console.log(cut);
    return JSON.parse(cut);
}
window.__fixedCallback = function (object) {
    this.additionalInfo = {};
    this.additionalInfo.libFile = object.LibFile;
    this.additionalInfo.dataFiles = object.DataFiles;
}


function htmlReturned(domContent, resultParsedCallback) {
    var el = document.createElement('html');
    el.innerHTML = domContent;
    var scripts = el.getElementsByTagName('script');
    var walkmeObject;
    for (var i = 0; i < scripts.length; i++) {
        var scriptElement = scripts[i];
        var parser = document.createElement('a');
        parser.href = scriptElement.src;
        var match = WALK_ME_REGEXP.exec(parser.href);
        if (match) {
            walkmeObject = {};
            var urlParams = parser.pathname.split('/');
            walkmeObject.userId = match[1];
            walkmeObject.production = !(parser.pathname.indexOf('test') > -1);
            walkmeObject.protocol = parser.protocol;
            walkmeObject.host = parser.hostname;
            walkmeObject.async = !!scriptElement.getAttribute('async');
            break;
        }
    }

    if (walkmeObject) {
        var settingsUrl = SETTINGS_PATTERN + walkmeObject.userId + "/settings.txt";
        console.log(settingsUrl);
        for (var i = 0; i < scripts.length; i++) {
            var scriptElement = scripts[i];
            if (scriptElement.src === settingsUrl) {
                console.log(scriptElement);
                var xhr = new XMLHttpRequest();
                xhr.open("GET", scriptElement.src, true);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        // WARNING! Might be evaluating an evil script!
                        //var resp = eval("(" + xhr.responseText + ")");
                        window.fixedCallback = window.__fixedCallback.bind(walkmeObject)
                        var resp = eval(xhr.responseText);
                        resultParsedCallback(walkmeObject)
                    }
                }
                xhr.send();
            }
        }
    } else {
        resultParsedCallback(walkmeObject)
    }

}


function appendKeyValue(container, key, value) {
    var k = document.createElement("h3");
    k.innerHTML = key + ": ";
    var v = document.createElement("p");
    v.innerHTML = value;
    container.appendChild(k);
    container.appendChild(v);
    container.appendChild(document.createElement('br'));
}

function loadData() {
    chrome.tabs.sendMessage(tabId, { text: 'report_back' }, function (dom) {
        var container = document.getElementById("container");
        container.innerHTML = '';
        htmlReturned(dom, function (walkMeObject) {
            if (!walkMeObject) {
                var err = document.createElement("h3");
                err.innerHTML = "No Walkme Loaded for target document";
                container.appendChild(err);

                setTimeout(loadData, 1500);
                return;
            }



            Object.keys(walkMeObject).forEach(function (key) {
                if (key === 'additionalInfo') return;
                appendKeyValue(container, key, walkMeObject[key]);
            });

            if (!walkMeObject.additionalInfo) {
                setTimeout(loadData, 1500);
                return;
            }

            appendKeyValue(container, "LibFile", walkMeObject.additionalInfo.libFile);    
            var header = document.createElement("h2");
            header.innerHTML = "DataFiles";
            container.appendChild(header);
            var dataFiles = walkMeObject.additionalInfo.dataFiles;
            for (var i = 0; i < dataFiles.length; i++) {
                var langs = "";
                if(dataFiles[i].languages.length === 0) langs = "Languages info is missing."
                for (var j = 0; j < dataFiles[i].languages.length; j++) {
                    langs += dataFiles[i].languages[j].displayName;
                    if (j != dataFiles[i].languages.length - 1) {
                        langs += ", ";
                    }
                }
                appendKeyValue(container, "Languages", langs);
            }
        });
    });
}

loadData();



