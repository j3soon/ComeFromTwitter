var app = {};
// Modify the referer to twitter.
app.modifyHeaders = function(details) {
  var newRef = "https://twitter.com";
  var gotRef = false;
  for (var n in details.requestHeaders) {
    gotRef = details.requestHeaders[n].name.toLowerCase() == "referer";
    if (gotRef) {
      details.requestHeaders[n].value = newRef;
      break;
    }
  }
  if (!gotRef) {
    details.requestHeaders.push({ name: "Referer", value: newRef });
  }
  return { requestHeaders: details.requestHeaders };
}
// Modify referer and unregister our one-use listener.
app.modifyHeadersAndRemoveListener = function(details) {
  let ret = app.modifyHeaders(details);
  // Unregister our one-use listener.
  browser.webRequest.onBeforeSendHeaders.removeListener(app.modifyHeadersAndRemoveListener);
  return ret;
}
// Background listener for certain domain tabs. (You can modify this)
// browser.webRequest.onBeforeSendHeaders.addListener(app.modifyHeaders, {
//   urls: ["*://*/*"]
// }, [
//   "requestHeaders",
//   "blocking"
// ]);
// Extension button click for non-listened domain tabs.
browser.browserAction.onClicked.addListener(function (tab) {
  browser.tabs.query({
    active: true,
    lastFocusedWindow: true
  }).then(function (tabs) {
    var activeTab = tabs[0];
    var url = tab.url;
    // Register our one-use listener for our next request.
    browser.webRequest.onBeforeSendHeaders.addListener(app.modifyHeadersAndRemoveListener, {
      urls: [url]
    }, [
      "requestHeaders",
      "blocking"
    ]);
    // Open a new tab with same url, our one-use listener should help us modify the headers.
    // Must use the one-use listener to modify headers, since `browser.tabs.create` doesn't allow custom headers.
    browser.tabs.create({ "url": url });
  });
});
