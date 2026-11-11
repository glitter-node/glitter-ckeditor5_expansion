  function videoIdOf(url) {
    var m = String(url || '').match(VIDEO_URL_RE);
    return m ? m[1].toLowerCase() : null;
  }

  function videoOptionsFromUrl(url) {
    var value = String(url || '');
    return {
      autoplay: /(?:[?&])autoplay=1(?:&|$)/i.test(value),
      muted: /(?:[?&])muted=1(?:&|$)/i.test(value),
      loop: /(?:[?&])loop=1(?:&|$)/i.test(value)
    };
  }

  function videoUrlWithoutPlayback(url) {
    return String(url || '')
      .replace(/([?&])(autoplay|muted|loop)=1\b/gi, '')
      .replace(/[?&]$/, '')
      .replace(/\?&/, '?');
  }

  function videoUrlWithPlaybackOptions(url, options) {
    var clean = videoUrlWithoutPlayback(url);
    var params = [];
    var autoplay = !!(options && options.autoplay);
    var muted = autoplay || !!(options && options.muted);
    if (autoplay) params.push('autoplay=1');
    if (muted) params.push('muted=1');
    if (options && options.loop) params.push('loop=1');
    if (!params.length) return clean;
    return clean + (clean.indexOf('?') === -1 ? '?' : '&') + params.join('&');
  }

  function applyVideoPlayback(video, options) {
    var autoplay = !!(options && options.autoplay);
    var muted = autoplay || !!(options && options.muted);
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.autoplay = autoplay;
    video.loop = !!(options && options.loop);
    video.muted = muted;
    video.defaultMuted = muted;
    if (autoplay) video.setAttribute('autoplay', '');
    if (muted) video.setAttribute('muted', '');
    if (video.loop) video.setAttribute('loop', '');
  }

  function startVideoPlayback(video, options, restart) {
    if (!options || !options.autoplay || typeof video.play !== 'function') return;
    try {
      if (restart) video.currentTime = 0;
      var playback = video.play();
      if (playback && typeof playback.catch === 'function') playback.catch(function () {});
    } catch (e) {}
  }

  function updateLoopButton(button, video) {
    var enabled = !!video.loop;
    var label = enabled
      ? t('content.video.loop_off', 'Turn loop off')
      : t('content.video.loop_on', 'Turn loop on');
    button.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    button.setAttribute('aria-label', label);
    button.textContent = label;
  }

  function promoteVideoAnchor(a) {
    var url = a.getAttribute('href') || a.href || '';
    var id = videoIdOf(url);
    if (!id) return;
    if (a.closest('.ck5-video')) return;
    if (a.dataset && a.dataset.ck5Video === 'done') return;

    var mime = (a.getAttribute('data-ck5-video-mime') || '').trim();
    var srcAttr = (a.getAttribute('data-ck5-video-src') || url).trim();
    var sizeM = url.match(/[?&]size=(sm|lg)\b/i);
    var size = sizeM ? sizeM[1].toLowerCase() : 'md';
    var options = videoOptionsFromUrl(url);

    var wrap = document.createElement('div');
    wrap.className = 'ck5-video';
    wrap.setAttribute('data-ck5-video', id);
    if (size !== 'md') wrap.setAttribute('data-size', size);
    var videoInner = mime
      ? '<source src="' + esc(srcAttr) + '" type="' + esc(mime) + '">'
      : '';
    var playbackAttrs = ' controls preload="metadata" playsinline';
    if (options.autoplay) playbackAttrs += ' autoplay';
    if (options.muted) playbackAttrs += ' muted';
    if (options.loop) playbackAttrs += ' loop';
    wrap.innerHTML =
      '<video' + playbackAttrs + (mime ? '' : ' src="' + esc(srcAttr) + '"') + '>'
      + videoInner
      + '</video>'
      + '<div class="ck5-video__foot">'
      + '<button type="button" class="ck5-video__loop" aria-pressed="false"></button>'
      + '<a class="ck5-video__btn" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">'
      + esc(t('content.video.open', 'Open video source'))
      + '</a></div>';
    var player = wrap.querySelector('video');
    var loopButton = wrap.querySelector('.ck5-video__loop');
    applyVideoPlayback(player, options);
    updateLoopButton(loopButton, player);
    loopButton.addEventListener('click', function () {
      var wasEnded = player.ended;
      player.loop = !player.loop;
      updateLoopButton(loopButton, player);
      if (player.loop && wasEnded) startVideoPlayback(player, { autoplay: true }, true);
    });

    var block = a.closest('figure.gce-video-embed, figure.gce-video, p, div');
    if (block && block.classList
        && (block.classList.contains('gce-video-embed') || block.classList.contains('gce-video'))) {
      block.replaceWith(wrap);
      startVideoPlayback(player, options);
      return;
    }
    if (block && block.parentElement) {
      var onlyThis = (block.textContent || '').trim() === (a.textContent || '').trim()
        && block.querySelectorAll('a, img, video, iframe').length <= 1;
      if (onlyThis && !block.classList.contains('ck-content')) {
        block.replaceWith(wrap);
        startVideoPlayback(player, options);
        return;
      }
    }
    a.replaceWith(wrap);
    startVideoPlayback(player, options);
  }

  function videoRenderVisitor(scope, cfg, ctx) {
    var vAnchors = scope.querySelectorAll('a[href]');
    for (var vi = 0; vi < vAnchors.length; vi++) {
      var va = vAnchors[vi];
      if (!videoIdOf(va.getAttribute('href') || va.href)) continue;
      if (va.closest('.ck5-video')) continue;
      var vblk = va.closest('p, div, figure');
      if (vblk && vblk !== scope) vblk.dataset.ck5Lc = 'video';
      promoteVideoAnchor(va);
    }
    var nativeVideos = scope.querySelectorAll('video');
    for (var ni = 0; ni < nativeVideos.length; ni++) {
      var nativeVideo = nativeVideos[ni];
      var sourceNode = nativeVideo.querySelector('source[src]');
      var source = nativeVideo.getAttribute('src') || (sourceNode && sourceNode.getAttribute('src')) || '';
      var parsed;
      try { parsed = new URL(source, window.location.href); } catch (e) { continue; }
      if (parsed.origin !== window.location.origin || !/^\/api\/modules\/sirsoft-board\/boards\/[^/]+\/content-media\/[a-z0-9]{12}$/i.test(parsed.pathname)) continue;
      if (nativeVideo.closest('.ck5-video') || nativeVideo.dataset.ck5OfficialVideo === 'done') continue;
      nativeVideo.dataset.ck5OfficialVideo = 'done';
      nativeVideo.playsInline = true;
      nativeVideo.setAttribute('playsinline', '');
      var officialWrap = document.createElement('div');
      officialWrap.className = 'ck5-video';
      var officialFoot = document.createElement('div');
      officialFoot.className = 'ck5-video__foot';
      var officialLoop = document.createElement('button');
      officialLoop.type = 'button';
      officialLoop.className = 'ck5-video__loop';
      officialFoot.appendChild(officialLoop);
      nativeVideo.parentNode.insertBefore(officialWrap, nativeVideo);
      officialWrap.appendChild(nativeVideo);
      officialWrap.appendChild(officialFoot);
      updateLoopButton(officialLoop, nativeVideo);
      officialLoop.addEventListener('click', function (video, button) {
        return function () {
          var ended = video.ended;
          video.loop = !video.loop;
          updateLoopButton(button, video);
          if (video.loop && ended) startVideoPlayback(video, { autoplay: true }, true);
        };
      }(nativeVideo, officialLoop));
    }
  }

  core.section({
    name: 'video-render',
    scope: 'visitor',
    order: 30,
    load: 'eager',
    gate: function (cfg) { return cfg.videoEnabled; },
    enabled: function (cfg) { return cfg.videoEnabled; },
    visitor: videoRenderVisitor
  });
