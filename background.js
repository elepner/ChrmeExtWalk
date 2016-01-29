// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function doStuffWithDom(domContent) {
    console.log('I received the following DOM content:\n' + domContent);
}

chrome.browserAction.onClicked.addListener(function (tab) {


    chrome.tabs.sendMessage(tab.id, { text: 'report_back' }, doStuffWithDom);

    //chrome.windows.create({ url: "headers.html?", type: "popup", width: 800, height: 600 });
});

var version = "1.0";

