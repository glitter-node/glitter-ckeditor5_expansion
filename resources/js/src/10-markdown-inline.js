  /* ================================================================ *
   *  마크다운 문법 → 서식 (렌더 시점 변환)
   * ================================================================ */

  function mdEsc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /** 한 텍스트 조각에 인라인 마크다운 적용 → HTML 문자열 (입력은 먼저 escape). */
  function mdInline(str, cfg) {
    var out = mdEsc(str);
    var stash = [];
    var keep = function (html) { stash.push(html); return '\u0001' + (stash.length - 1) + '\u0001'; };
    if (cfg.mdCode) {
      out = out.replace(/`([^`\n]+?)`/g, function (_, c) { return keep('<code data-ck5-mdc="1">' + c + '</code>'); });
    }
    if (cfg.mdLink) {
      out = out.replace(/\[([^\]\n]{1,200}?)\]\((https?:\/\/[^\s)]{1,500}?)\)/g, function (_, label, u) {
        return keep('<a data-ck5-mda="1" href="' + u.replace(/"/g, '%22') + '" target="_blank" rel="noopener noreferrer">' + label + '</a>');
      });
    }
    if (cfg.mdBold) {
      out = out.replace(/\*\*([^\s*][^*\n]*?[^\s*]|[^\s*])\*\*/g, '<strong>$1</strong>');
    }
    if (cfg.mdItalic) {
      out = out.replace(/(^|[^*\w])\*([^\s*][^*\n]*?[^\s*]|[^\s*])\*(?!\*)/g, '$1<em>$2</em>');
    }
    out = out.replace(/\u0001(\d+)\u0001/g, function (_, i) { return stash[+i]; });
    return out;
  }

  /** el 의 텍스트 노드들에 인라인 마크다운 적용 (사용자가 이미 서식 준 요소는 스킵). */
  function mdApplyInline(el, cfg) {
    if (!el || el.dataset.ck5MdInline === '1') return;
    if (el.querySelector('a, strong, b, em, i, code, s, u, mark, sub, sup')) { el.dataset.ck5MdInline = '1'; return; }
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var textNodes = [], n;
    while ((n = walker.nextNode())) {
      if (n.parentElement && n.parentElement.closest('code, pre, a')) continue;
      textNodes.push(n);
    }
    textNodes.forEach(function (tn) {
      var raw = tn.nodeValue;
      if (!/[*`[]/.test(raw)) return;
      var html = mdInline(raw, cfg);
      if (html === mdEsc(raw)) return;
      try {
        var frag = document.createRange().createContextualFragment(html);
        tn.parentNode.replaceChild(frag, tn);
      } catch (e) {}
    });
    el.dataset.ck5MdInline = '1';
  }

  /** 구분선 줄: 같은 기호 3개 이상만(`---`, `***`, `___`), 공백·다른 문자 섞이면 아님. */
  var MD_HR_RE = /^(?:-{3,}|\*{3,}|_{3,})$/;
  /** GFM 표 구분 행: `|---|:---:|` 형태, 파이프 필수(파이프 없는 `---` 는 구분선). 정렬 표기는 무시. */
  var MD_TABLE_DELIM_RE = /^\|?[ \t]*:?-+:?[ \t]*(?:\|[ \t]*:?-+:?[ \t]*)*\|?$/;

  /** 표 한 행 → 셀 문자열 배열 (양끝 파이프 제거, `\|` 는 셀 안의 문자 `|`). */
  function mdTableCells(line) {
    var s = line.trim();
    if (s.charAt(0) === '|') s = s.slice(1);
    if (s.slice(-1) === '|' && s.slice(-2) !== '\\|') s = s.slice(0, -1);
    var cells = [], buf = '';
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (ch === '\\' && s.charAt(i + 1) === '|') { buf += '|'; i++; }
      else if (ch === '|') { cells.push(buf.trim()); buf = ''; }
      else buf += ch;
    }
    cells.push(buf.trim());
    return cells;
  }

  /** header 줄 + 다음 줄이 GFM 표 시작(헤더·구분 행 열 수 일치)이면 열 수, 아니면 0. */
  function mdTableCols(header, delim) {
    if (!header || !delim || header.indexOf('|') < 0 || delim.indexOf('|') < 0) return 0;
    if (!MD_TABLE_DELIM_RE.test(delim)) return 0;
    var n = mdTableCells(header).length;
    return n === mdTableCells(delim).length ? n : 0;
  }




