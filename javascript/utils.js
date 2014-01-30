/*global chrome, localStorage, XMLHttpRequest*/
var globalLoadCount = 0;
var globalImageCount = 0;
var req;

function openUrl() {
  var href = this.href;
  chrome.tabs.getSelected(null, function (tab) {
    chrome.tabs.create({
      index: tab.index + 1,
      url: href
    });
  });
}

function contains(shouldContain, filter) {
  var result = false;
  var i = 0;
  var regexp = null;
  if (filter.length > 0) {
    for (i = 0; i < filter.length; i++) {
      regexp = new RegExp(filter[i]);
      if (shouldContain.match(regexp)) {
        result = true;
        break;
      }
    }
  } else {
    result = true;
  }
  return result;
}

function showPhotos() {
  globalLoadCount++;
  var filterArray = {};
  var filter = localStorage["data.user.filter"];
  if (null !== filter && undefined !== filter) {
    filterArray = JSON.parse(filter).split("\n");
  }

  var items = req.responseXML.getElementsByTagName("item");
  var item, thumbnail, title, titleText, i, img, linkSrc, link;
  for (i = 0; i < items.length && globalImageCount < 35; i++) {
    item = items[i];
    thumbnail = item.getElementsByTagName("thumbnail")[0];
    title = item.getElementsByTagName("title")[0];
    titleText = title.firstChild.nodeValue;
    if (contains(titleText, filterArray)) {
      img = document.createElement("img");
      img.src = thumbnail.getAttribute("url");
      img.title = titleText;

      linkSrc = item.getElementsByTagName("content")[0].getAttribute("url");
      link = document.createElement("a");
      link.href = "http://www.digi-images.de/showImage.html?imageId=" + linkSrc.replace(/^.*imageId=(\d+).*$/, "$1") + "&custAlbum=lastup";
      link.appendChild(img);
      link.addEventListener("click", openUrl, false);
      document.body.appendChild(link);
      globalImageCount++;
    }
  }

  if (globalImageCount < 35) {
    load(35 * globalLoadCount);
  }
}

function load(start) {
  var host = localStorage["data.rss.url"];
  var url = "http://www.digi-images.de/cooliris.rss?&custAlbum=lastup&start=" + start;
  if (null !== host && undefined !== host && host.match("^.*?:\\.*")) {
    url = JSON.parse(host) + "&start=" + start;
  }

  req = new XMLHttpRequest();
  req.open("GET", url, true);
  req.onload = showPhotos;
  req.send(null);
}

document.addEventListener("DOMContentLoaded", function () {
  load(0);
}, false);