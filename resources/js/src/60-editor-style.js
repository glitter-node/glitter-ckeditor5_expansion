  /* ================================================================ *
   *  에디터 스타일 — 본문 기본 글자크기·줄간격 (전역, 기본은 댓글 제외)
   * ================================================================ *
   *  - **게시글 본문(방문자 화면)**: `.ck-content.prose` — sirsoft-board 의
   *    `html_content` 확장 포인트가 붙이는 클래스 조합.
   *  - **댓글(방문자 화면)**: 댓글은 `.ck-content`/`prose` 경로를 전혀 타지 않는다
   *    (재조사 확인).
   *    sirsoft-board 코어 댓글 API 에는 `content_mode` 필드가 없어 댓글 본문은 항상
   *    `<p class="text-gray-700 dark:text-gray-300">…</p>` 로 text 바인딩(HTML
   *    이스케이프) 렌더링된다. 실제로 굵게·목록·표 등 서식이 보이는 것은
   *    g7-comment-editor 의 `upgradeRenderedComments()` 가 전역에서
   *    `p.text-gray-700` + `dark:text-gray-300` 조합을 스캔해 새니타이즈된 HTML 로
   *    `innerHTML` 승격시키는, sirsoft-board 렌더링과는 완전히 별개인 후처리
   *    경로 때문이다(승격 후에도 클래스는 그대로 `text-gray-700 dark:text-gray-300`
   *    이며 `ck-content`/`prose` 계열 클래스는 붙지 않음, 실브라우저 DOM 확인).
   *    따라서 `editor_apply_to_comments` 설정이 켜지면 g7-comment-editor 자신이
   *    승격 대상 판별에 쓰는 것과 동일한 조합인 `p.text-gray-700.dark\:text-gray-300`
   *    셀렉터를 규칙에 추가한다 — CSS는 DOM 클래스 기준으로 적용되므로 그 클래스를
   *    어느 플러그인이 렌더링/승격했는지는 무관하다(슈퍼팩·g7-comment-editor 어느
   *    쪽 파일도 건드리지 않음).
   *  - **편집 화면**: 표식은 CKEditor 가 관리하지 않는 **바깥 컨테이너**에 붙이고,
   *    CSS 는 그 아래 `.ck-editor__editable` 에 건다. 편집 루트(`getDomRoot()`)에
   *    직접 붙이면 CKEditor 렌더러가 포커스 전환 때 루트 class 를 다시 써서 표식이
   *    지워진다(1.5.0 에서 고침).
   *    - 게시글 본문 에디터: `div.ckeditor5-wrapper` (sirsoft-ckeditor5
   *      `html-editor.json` 의 고정 className 컨테이너, 편집기는 그 안에 생성)
   *    - 댓글 에디터: `div.g7ce-wrapper` (g7-comment-editor 가 만드는 컨테이너).
   *      "댓글에도 적용" 옵션이 켜져 있을 때만 붙인다.
   *    컨테이너는 안에 `.ck-editor__editable` 이 있을 때만 대상이다.
   *
   */

  var EDITOR_STYLE_MARKER = 'gce-body-editor-style';
  var COMMENT_EDITOR_STYLE_MARKER = 'gce-comment-editor-style';
  function injectEditorStyleCss(cfg) {
    document.documentElement.classList.toggle('gce-editor-style-enabled', cfg.editorStyleEnabled);
    document.documentElement.classList.toggle('gce-editor-apply-comments', cfg.editorStyleEnabled && cfg.editorApplyToComments);
    if (!cfg.editorStyleEnabled) { setDynamicRule('editor', ''); return; }
    var selectors = ['html.gce-editor-style-enabled .ck-content.prose', 'html.gce-editor-style-enabled .' + EDITOR_STYLE_MARKER + ' .ck-editor__editable', 'html.gce-editor-style-enabled .' + COMMENT_EDITOR_STYLE_MARKER + ' .ck-editor__editable'];
    if (cfg.editorApplyToComments) selectors.push('html.gce-editor-apply-comments p.text-gray-700.dark\\:text-gray-300');
    var rule = 'font-size:' + cfg.editorFontSize + 'px!important;line-height:' + cfg.editorLineHeight + '!important;';
    setDynamicRule('editor', selectors.join(',') + '{' + rule + '}');
  }

  /** 편집기 바깥 컨테이너에 표식 클래스를 붙이거나 뗀다(안에 편집 영역이 있을 때만 붙임). */
  function markEditorContainers(selector, marker, enabled) {
    var list = document.querySelectorAll(selector);
    for (var i = 0; i < list.length; i++) {
      var want = enabled && !!list[i].querySelector('.ck-editor__editable');
      if (list[i].classList.contains(marker) !== want) list[i].classList.toggle(marker, want);
    }
  }

  /** 본문 에디터·댓글 에디터 컨테이너의 표식을 설정에 맞춘다(멱등). */
  function applyEditorStyleMarkers() {
    var cfg = readSettings();
    var on = !!cfg.editorStyleEnabled;
    markEditorContainers('div.ckeditor5-wrapper', EDITOR_STYLE_MARKER, on);
    markEditorContainers('div.g7ce-wrapper', COMMENT_EDITOR_STYLE_MARKER, on && !!cfg.editorApplyToComments);
  }

  core.section({
    name: 'editor-style',
    scope: 'editor',
    load: 'eager',
    boot: injectEditorStyleCss,
    editorEnd: applyEditorStyleMarkers
  });




