/* Music page: click-to-play YouTube thumbnails + "Latest from YouTube" block.
   - Each .yt-facade shows a thumbnail; the real player loads only when tapped.
   - data/videos.json (refreshed daily by .github/workflows/update-videos.yml)
     feeds the "Latest from YouTube" block; videos already on the page are skipped. */
(function () {
  "use strict";
  var ID_RE = /^[A-Za-z0-9_-]{11}$/;
  var LIST_RE = /^[A-Za-z0-9_-]+$/;

  function thumb(el) {
    var id = el.getAttribute("data-id");
    if (id && ID_RE.test(id)) {
      el.style.backgroundImage = "url(https://i.ytimg.com/vi/" + id + "/hqdefault.jpg)";
    }
  }

  function initFacade(el) {
    if (el.getAttribute("data-ready")) return;
    el.setAttribute("data-ready", "1");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { thumb(el); io.disconnect(); }
        });
      }, { rootMargin: "300px" });
      io.observe(el);
    } else {
      thumb(el);
    }
    el.addEventListener("click", function (ev) {
      ev.preventDefault();
      var id = el.getAttribute("data-id");
      var list = el.getAttribute("data-list");
      var src;
      if (id && ID_RE.test(id)) src = "https://www.youtube.com/embed/" + id + "?autoplay=1&rel=0";
      else if (list && LIST_RE.test(list)) src = "https://www.youtube.com/embed/videoseries?list=" + list + "&autoplay=1&rel=0";
      else return;
      var f = document.createElement("iframe");
      f.src = src;
      f.title = el.getAttribute("data-title") || "YouTube video player";
      f.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
      f.setAttribute("allowfullscreen", "");
      f.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      f.style.cssText = "width:100%;aspect-ratio:16/9;border:0;border-radius:12px;";
      el.parentNode.replaceChild(f, el);
    });
  }

  function initAll() {
    Array.prototype.forEach.call(document.querySelectorAll(".yt-facade"), initFacade);
  }

  function showLatest() {
    var box = document.getElementById("latest-videos");
    var row = document.getElementById("latest-row");
    if (!box || !row || !window.fetch) return;
    fetch("data/videos.json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !Array.isArray(data.videos)) return;
        var already = {};
        Array.prototype.forEach.call(document.querySelectorAll(".yt-facade[data-id]"), function (a) {
          already[a.getAttribute("data-id")] = true;
        });
        var fresh = data.videos.filter(function (v) {
          return v && ID_RE.test(v.id) && !already[v.id];
        }).slice(0, 6);
        if (!fresh.length) return;
        fresh.forEach(function (v) {
          var wrap = document.createElement("div");
          wrap.className = "video";
          var p = document.createElement("p");
          p.className = "video-title";
          p.textContent = v.title || "New video";
          var a = document.createElement("a");
          a.className = "yt-facade";
          a.href = "https://www.youtube.com/watch?v=" + v.id;
          a.setAttribute("data-id", v.id);
          a.setAttribute("data-title", p.textContent);
          a.setAttribute("aria-label", "Play video: " + p.textContent);
          var s = document.createElement("span");
          s.className = "yt-play";
          s.setAttribute("aria-hidden", "true");
          a.appendChild(s);
          wrap.appendChild(p);
          wrap.appendChild(a);
          row.appendChild(wrap);
        });
        box.hidden = false;
        initAll();
      })
      .catch(function () { /* keep the page working without the latest block */ });
  }

  initAll();
  showLatest();
})();
