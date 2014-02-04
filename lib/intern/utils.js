/*global chrome, XMLHttpRequest, window, Blob*/
var index = 0;
var minSize = 500;

document.addEventListener("DOMContentLoaded", function () {
  if (window.innerWidth < window.innerHeight) {
    minSize = window.innerWidth;
  } else {
    minSize = window.innerHeight;
  }
}, false);

$(document).one("pagecreate", '#page', function () {
  console.log("bla");
  function openUrl() {
    var href = this.href;
    chrome.tabs.getSelected(null, function (tab) {
      chrome.tabs.create({
        index: tab.index + 1,
        url: href
      });
    });
  }

  function addImage(blob, titleText, linkSrc) {
    var img = document.createElement("img");
    img.src = window.webkitURL.createObjectURL(blob);
    img.title = titleText;
    if (window.innerWidth < window.innerHeight) {
      img.style.width = window.innerWidth + 'px';
    } else {
      img.style.height = window.innerHeight + 'px';
    }

    var link = document.createElement("a");
    link.href = "http://www.digi-images.de/showImage.html?imageId=" + linkSrc.replace(/^.*imageId=(\d+).*$/, "$1") + "&custAlbum=lastup";
    link.appendChild(img);
    link.addEventListener("click", openUrl, false);
    document.body.appendChild(link);
  }

  function showPhotos(event) {
    var items = event.target.responseXML.getElementsByTagName("item");
    var item = items[0];
    var thumbnail = item.getElementsByTagName("thumbnail")[0];
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'arraybuffer';
    xhr.onload = function (eventImage) {
      var title = item.getElementsByTagName("title")[0];
      var titleText = title.firstChild.nodeValue;
      var linkSrc = item.getElementsByTagName("content")[0].getAttribute("url");
      var blob = new Blob([eventImage.target.response]);
      addImage(blob, titleText, linkSrc);
    };
    xhr.open('GET', thumbnail.getAttribute("url").replace('&size=500', '&size=' + minSize), true);
    xhr.send();
  }

  function load(start) {
    var url = "http://www.digi-images.de/cooliris.rss?&custAlbum=lastup&start=" + start;
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.onload = showPhotos;
    req.send(null);
  }

  function navnext(next) {
    $(":mobile-pagecontainer").pagecontainer("change", "#" + index, {
      transition: "slide"
    });
  }

  function navprev(prev) {
    $(":mobile-pagecontainer").pagecontainer("change", "#" + index, {
      transition: "slide",
      reverse: true
    });
  }
  $(document).on("swipeleft", ".ui-page", function (event) {
    if (index && (event.target === $(this)[0])) {
      navnext(index);
      index++;
    }
  });
  $(document).on("click", ".next", function () {
    if (index) {
      navnext(index);
      index++;
    }
  });
  $(document).on("swiperight", ".ui-page", function (event) {
    if (index >= 0 && (event.target === $(this)[0])) {
      navprev(index);
      if (index > 0) {
        index--;
      }
    }
  });
  $(document).on("click", ".prev", function () {
    if (index >= 0) {
      navprev(index);
      if (index > 0) {
        index--;
      }
    }
  });
});
$(document).on("pageshow", function () {
  // update previous and next page
  //$(":mobile-pagecontainer").pagecontainer("load", "#" + index);
  $(".next.ui-state-disabled, .prev.ui-state-disabled").removeClass("ui-state-disabled");
  if (0 === index) {
    $(".prev").addClass("ui-state-disabled");
  }
});