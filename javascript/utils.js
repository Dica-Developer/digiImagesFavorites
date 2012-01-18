var globalLoadCount = 0;
var globalImageCount = 0;

function openUrl()
{
  var href = this.href;
  chrome.tabs.getSelected(null, function(tab)
  {
    chrome.tabs.create({ index: tab.index + 1, url: href });
  }); 
}

function contains(shouldContain, filter) {
  var result = false;
  if (filter.length > 0) {
    for (var i = 0; i < filter.length; i++) {
      var regexp = new RegExp(filter[i]);
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
  if (null != filter) {
    filterArray = JSON.parse(filter).split("\n");
  }

  var items = req.responseXML.getElementsByTagName("item");
  for (var i = 0; i < items.length && globalImageCount < 35; i++) {
    var item = items[i];
    var thumbnail = item.getElementsByTagName("thumbnail")[0];
    var title = item.getElementsByTagName("title")[0];
    var titleText = title.firstChild.nodeValue;
    if (contains(titleText, filterArray)) {
      var img = document.createElement("image");
      img.src = thumbnail.getAttribute("url");
      img.title = titleText;

      var linkSrc = item.getElementsByTagName("content")[0].getAttribute("url")
      var link = document.createElement("a");
      link.href = "http://www.digi-images.de/showImage.html?imageId="+ linkSrc.replace(/^.*imageId=(\d+).*$/, "$1") +"&custAlbum=lastup";
      link.appendChild(img);
      link.addEventListener("click", openUrl, false);
      document.body.appendChild(link);
      globalImageCount++;
    }
  }

  if (globalImageCount < 35) {
    req = load(35 * globalLoadCount);
  }
}

function load(start) {
  var host = localStorage["data.rss.url"];
  var url = "http://www.digi-images.de/cooliris.rss?&custAlbum=lastup&start=" + start;
  if (null != host && host.match("^.*?:\\.*")) {
    url = JSON.parse(host);
  }

  var req = new XMLHttpRequest();
  req.open("GET", url, true);
  req.onload = showPhotos;
  req.send(null);

  return req;
}

