(function () {
  var root = document.documentElement;
  var THEME_KEY = "tech-blog-theme";

  function getPreferredTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (saved === "dark" || saved === "light") return saved;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.textContent = theme === "dark" ? "☀" : "☾";
      btn.setAttribute("aria-label", theme === "dark" ? "切换到亮色模式" : "切换到暗色模式");
    }
  }

  applyTheme(getPreferredTheme());

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.addEventListener("click", function () {
        var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyTheme(next);
        try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      });
    }

    var listEl = document.getElementById("post-list");
    if (!listEl || typeof POSTS === "undefined") return;

    var searchInput = document.getElementById("search-input");
    var tagBar = document.getElementById("tag-filter");
    var emptyEl = document.getElementById("empty-state");
    var activeTag = "全部";

    var sorted = POSTS.slice().sort(function (a, b) { return b.date < a.date ? -1 : 1; });

    var tagCounts = {};
    sorted.forEach(function (p) {
      (p.tags || []).forEach(function (t) {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    });
    var allTags = Object.keys(tagCounts).sort(function (a, b) { return tagCounts[b] - tagCounts[a]; });

    function renderTags() {
      var html = '<button class="tag-chip active" data-tag="全部">全部 ' + sorted.length + "</button>";
      allTags.forEach(function (t) {
        html += '<button class="tag-chip" data-tag="' + t + '">' + t + " " + tagCounts[t] + "</button>";
      });
      tagBar.innerHTML = html;
    }

    function cardHtml(p) {
      var tagsHtml = (p.tags || []).map(function (t) {
        return '<span class="post-tag">' + t + "</span>";
      }).join("");
      return (
        '<a class="post-card" href="posts/' + p.slug + '.html">' +
        '<div class="post-card-top">' + tagsHtml + "<span>" + p.date + "</span><span>·</span><span>" + p.readTime + "</span></div>" +
        "<h2>" + p.title + "</h2>" +
        "<p>" + p.desc + "</p>" +
        '<div class="read-more">阅读全文 →</div>' +
        "</a>"
      );
    }

    function render() {
      var kw = (searchInput.value || "").trim().toLowerCase();
      var filtered = sorted.filter(function (p) {
        var tagOk = activeTag === "全部" || (p.tags || []).indexOf(activeTag) !== -1;
        if (!tagOk) return false;
        if (!kw) return true;
        var haystack = (p.title + " " + p.desc + " " + (p.tags || []).join(" ")).toLowerCase();
        return haystack.indexOf(kw) !== -1;
      });

      listEl.innerHTML = filtered.map(cardHtml).join("");
      emptyEl.style.display = filtered.length ? "none" : "block";

      var stat = document.getElementById("stat-posts");
      if (stat) stat.textContent = String(POSTS.length);
      var tagStat = document.getElementById("stat-tags");
      if (tagStat) tagStat.textContent = String(allTags.length);
    }

    tagBar.addEventListener("click", function (e) {
      var chip = e.target.closest(".tag-chip");
      if (!chip) return;
      var chips = tagBar.querySelectorAll(".tag-chip");
      for (var i = 0; i < chips.length; i++) chips[i].classList.remove("active");
      chip.classList.add("active");
      activeTag = chip.getAttribute("data-tag");
      render();
    });

    searchInput.addEventListener("input", render);

    renderTags();
    render();
  });
})();
