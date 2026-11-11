  /* ================================================================ *
   *  SNS 임베드
   * ================================================================ */

  var LABELS = { youtube: 'YouTube', twitter: 'X', instagram: 'Instagram', tiktok: 'TikTok', unknown: '' };

  function bare(rawUrl) {
    return String(rawUrl).trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  }

  function detectPlatform(rawUrl) {
    var u = bare(rawUrl);
    if (/^(youtube\.com\/(watch\?|shorts\/|embed\/|live\/|v\/)|youtu\.be\/|m\.youtube\.com\/)/i.test(u)) return 'youtube';
    if (/^(twitter\.com|x\.com)\/[^/]+\/status(?:es)?\/\d+/i.test(u)) return 'twitter';
    if (/^instagram\.com\/(p|reel|reels|tv)\//i.test(u)) return 'instagram';
    if (/^(?:vm|vt)\.tiktok\.com\//i.test(u) || /^tiktok\.com\/(@[^/]+\/video\/\d+|t\/|embed\/)/i.test(u)) return 'tiktok';
    return 'unknown';
  }

  function youtubeId(rawUrl) {
    var u = bare(rawUrl);
    var m = u.match(/^youtu\.be\/([\w-]{6,})/i)
      || u.match(/[?&]v=([\w-]{6,})/i)
      || u.match(/^(?:m\.)?youtube\.com\/(?:shorts|embed|live|v)\/([\w-]{6,})/i);
    return m ? m[1] : null;
  }

  /** 임베드용 정규 URL — 추적/동의 파라미터 제거 (임베드 파서가 빈 박스를 만드는 원인) */
  function canonicalUrl(rawUrl, platform) {
    var noHash = String(rawUrl).trim().split('#')[0];
    var path = noHash.split('?')[0];
    var m;
    switch (platform) {
      case 'twitter':
        m = bare(path).match(/^(twitter\.com|x\.com)\/([^/]+)\/status(?:es)?\/(\d+)/i);
        return m ? 'https://' + m[1].toLowerCase() + '/' + m[2] + '/status/' + m[3] : path;
      case 'instagram':
        m = bare(path).match(/^instagram\.com\/(p|reel|reels|tv)\/([\w-]+)/i);
        return m ? 'https://www.instagram.com/' + (m[1] === 'reels' ? 'reel' : m[1]) + '/' + m[2] + '/' : path;
      case 'tiktok':
        m = bare(path).match(/^tiktok\.com\/(@[^/]+)\/video\/(\d+)/i);
        return m ? 'https://www.tiktok.com/' + m[1] + '/video/' + m[2] : path;
      case 'youtube': {
        var id = youtubeId(rawUrl);
        return id ? 'https://www.youtube.com/watch?v=' + id : path;
      }
      default:
        return path;
    }
  }

  /** 항상 남는 하단 링크 — pill 버튼, 화살표 없음 */
  function footLink(url, platform) {
    var label = LABELS[platform]
      ? t('content.media_embed.view_on', LABELS[platform] + '에서 보기').replace('{platform}', LABELS[platform])
      : t('content.media_embed.open_link', '링크 열기');
    return '<div class="ck5-media-embed__foot">'
      + '<a class="ck5-media-embed__btn" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(label) + '</a>'
      + '</div>';
  }

  function unsupportedFallback(url) {
    return '<div class="ck5-media-embed__notice">'
      + esc(t('content.media_embed.unsupported', '지원하지 않는 임베드입니다. 링크로 표시합니다.'))
      + '</div>'
      + footLink(url, 'unknown');
  }

  function embedMarkup(platform, url, rawUrl) {
    var m;
    switch (platform) {
      case 'youtube': {
        var id = youtubeId(rawUrl);
        if (!id) return unsupportedFallback(url);
        var shortsClass = /\/shorts\//i.test(rawUrl) ? ' ck5-media-embed__yt--shorts' : '';
        return '<div class="ck5-media-embed__yt' + shortsClass + '">'
          + '<iframe src="https://www.youtube-nocookie.com/embed/' + esc(id) + '" title="YouTube video" '
          + 'loading="lazy" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" '
          + 'referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
          + '</div>'
          + footLink(url, platform);
      }
      case 'twitter':
      case 'instagram':
      case 'tiktok':
        return unsupportedFallback(url);
      default:
        return unsupportedFallback(url);
    }
  }

  function injectEmbedStyle(cfg) {
    setDynamicRule('shorts', '.ck5-media-embed__yt--shorts{aspect-ratio:' + cfg.shortsRatio + ';}');
  }

  /**
   * 임베드 대상 하나를 변환한다.
   * @param target  교체 대상 Element (본문 <p> 블록 또는 레거시 <figure.media>/<oembed>)
   * @param rawUrl  원본 URL
   * @param platform  detectPlatform 결과
   * @param cfg  설정
   */
  function transformEmbed(target, rawUrl, platform, cfg) {
    if (target.parentElement && target.parentElement.classList.contains(EMBED_WRAPPER_CLASS)) return;

    // 플랫폼이 꺼져 있으면: 임베드하지 않고 순수 링크로 남긴다 (레거시 <oembed> 는 <a> 로 환원).
    if (platform !== 'unknown' && !platformEnabled(cfg, platform)) {
      if (target.tagName === 'OEMBED' || (target.tagName === 'FIGURE' && target.classList.contains('media'))) {
        var p = document.createElement('p');
        var a = document.createElement('a');
        a.href = rawUrl;
        a.textContent = rawUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        p.appendChild(a);
        target.replaceWith(p);
      }
      return;
    }

    var url = canonicalUrl(rawUrl, platform);
    var wrapper = document.createElement('div');
    wrapper.className = EMBED_WRAPPER_CLASS;
    wrapper.setAttribute('data-ck5-embed-platform', platform);
    wrapper.innerHTML = embedMarkup(platform, url, rawUrl);
    target.replaceWith(wrapper);

  }

  /** 플랫폼별 렌더 허용 여부 (플랫폼 마스터 토글 && 개별 토글) */
  function platformEnabled(cfg, platform) {
    if (!cfg.snsEnabled) return false;
    switch (platform) {
      case 'youtube': return cfg.snsYoutube;
      case 'twitter': return cfg.snsTwitter;
      case 'instagram': return cfg.snsInstagram;
      case 'tiktok': return cfg.snsTiktok;
      default: return false;
    }
  }




