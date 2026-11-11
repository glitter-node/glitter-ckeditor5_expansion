# Glitter CKEditor5 Expansion

Glitter CKEditor5 Expansion is an independent plugin for Gnuboard7 that extends CKEditor 5 with rich media embedding, HTML5 video management, Markdown rendering, image uploads, and additional editor controls.

**Current version:** 0.1.7  
**Plugin identifier:** `glitter-ckeditor5_expansion`  
**Minimum Gnuboard7 version:** 7.0.10  
**Required dependency:** `sirsoft-ckeditor5 >=1.0.3`  
**License:** MIT

## Overview

This plugin is based in part on the feature set of CKEditor 5 Superpack (`g7-ckeditor5-superpack`), originally authored by William Cho.

It has been adapted, modified, and extended as an independently maintained Gnuboard7 plugin by Glitter.kr.

The original reference plugin is not required at runtime. CKEditor 5 itself is supplied separately through the `sirsoft-ckeditor5` dependency and is not bundled with this plugin.

Version 0.1.7 includes improvements to Content Security Policy (CSP) compatibility, social media embedding behavior, and frontend interface styling.

These improvements reduce dependencies on dynamically loaded third-party scripts and inline styles while preserving the plugin's supported editor and media-management functionality.

## Features

### Social Media Embedding

- YouTube video embedding.
- X (Twitter) content link detection.
- Instagram content link detection.
- TikTok content link detection.
- Automatic detection and rendering of supported media links.
- Safe link fallback for social platforms that require external embedding SDKs.
- Reduced dependency on third-party JavaScript embedding services.

To improve compatibility with restrictive CSP configurations, X (Twitter), Instagram, and TikTok content is presented through safe links instead of dynamically loading third-party embedding scripts.

This approach avoids dependencies on external social media SDKs that may be blocked by the hosting application's security policy.

YouTube embedding remains supported, subject to the hosting application's CSP, iframe restrictions, and external media availability.

### External Link Previews

- Rich preview cards for external links.
- Server-side URL validation and SSRF protection.
- Response caching and rate limiting.
- Automatic rendering of supported link previews.

### HTML5 Video Upload and Playback

- Chunked upload of local video files.
- Video playback and file cleanup.
- Autoplay, Muted, and Loop options for uploaded videos.
- Automatic Muted selection when Autoplay is enabled.
- Inline playback support through `playsinline`.
- Compatibility with existing embedded video content.
- Manual playback support when Autoplay is disabled.
- Video Library panels stay within the viewport, with a scrollable card list and wrapping controls on narrow screens.
- Native HTML progress elements and static CSS-based presentation for applicable progress indicators.
- Reduced reliance on inline style manipulation in plugin-managed video interfaces.

### Interactive Video Loop Control

- Loop ON/OFF toggle displayed below embedded HTML5 videos.
- Immediate application of Loop changes without reloading the page.
- Automatic restart when Loop is enabled after playback has ended.
- Normal playback completion when Loop is disabled.
- Independent Loop controls for multiple videos in the same post.
- Visual indicators for enabled and disabled states.
- Accessible button states using `aria-pressed` and `aria-label`.
- Keyboard focus styling.
- Viewer-side Loop changes do not modify saved post content or video URLs.

### Markdown Rendering

- Visitor-side Markdown rendering.
- Support for inline and block-level Markdown formatting.

### Editor Formatting

- Font size controls.
- Line height controls.
- Code and code block toolbar buttons.
- Code block rendering and copy controls.
- Static CSS-based presentation for applicable code-copy controls.
- Reduced reliance on dynamically applied inline styles.

### Image Upload

- Clipboard image upload.
- Optional PNG-to-WebP conversion.
- Image upload validation and safeguards.

### Localization

- Korean and English translations.
- Localized video controls and plugin interface messages.

## Content Security Policy (CSP) Compatibility

Version 0.1.7 includes source-level improvements intended to support restrictive Content Security Policy configurations.

The changes focus on removing or reducing plugin-controlled patterns that may conflict with policies restricting inline scripts, inline styles, and third-party script execution.

### JavaScript and External Resources

The following improvements were introduced:

- Removed dynamic third-party embedding SDK loading for X (Twitter), Instagram, and TikTok.
- Replaced affected social media SDK-based rendering with safe link fallback behavior.
- Reduced dependencies on external JavaScript resources that may not be included in the hosting application's `script-src` directive.
- Preserved the existing supported CKEditor 5 integration without modifying the official CKEditor 5 dependency.

The plugin does not require the removed social media SDKs for its fallback link functionality.

External resources used by other supported features remain subject to the hosting application's CSP.

### Inline Styles and UI Presentation

The following improvements were introduced:

- Replaced affected JavaScript-driven inline style operations with static CSS classes.
- Updated applicable video progress interfaces to use native HTML `<progress>` elements.
- Updated code-copy interface presentation to use CSS-based styling.
- Reduced reliance on dynamically applied inline styles in plugin-managed interfaces.
- Preserved existing UI behavior where supported by the updated implementation.

These changes are intended to improve compatibility with restrictive style directives, including configurations using:

- `style-src` without `unsafe-inline`.
- `style-src-elem` without `unsafe-inline`.
- `style-src-attr 'none'`.

### Strict CSP Considerations

The plugin's CSP-related changes are designed to reduce dependencies on patterns restricted by policies that omit:

- `unsafe-inline`
- `unsafe-eval`

However, full CSP compatibility depends on the hosting application's security policy and runtime environment.

Relevant factors include:

- The installed Gnuboard7 core version.
- The official `sirsoft-ckeditor5` implementation.
- Other active plugins and templates.
- External media providers.
- Dynamically generated editor UI.
- The application's script, style, frame, image, font, and network connection policies.

The plugin's CSP improvements do not modify the Gnuboard7 core, the official `sirsoft-ckeditor5` plugin, or server-level security headers.

### CSP Verification Limitations

Version 0.1.7 underwent static validation, frontend build verification, and production deployment checks.

However, browser-level CSP violation monitoring and complete functional testing under a strictly enforced CSP were not completed as part of this update.

The production CSP observed during deployment differed from the intended strict policy because it included `unsafe-inline` and `unsafe-eval`.

Therefore, successful static validation and deployment should not be interpreted as confirmation of complete browser-level CSP compliance.

Administrators deploying the plugin under a strict CSP should verify the relevant editor and media functionality using browser developer tools and CSP violation reports.

## Requirements

- Gnuboard7 7.0.10 or later.
- `sirsoft-ckeditor5` 1.0.3 or later.
- A PHP environment compatible with the installed Gnuboard7 version.
- Required PHP extensions and server permissions for file uploads and storage.

Node.js and npm are not required for normal installation when using the release package with prebuilt JavaScript assets.

## Installation

1. Download the release ZIP package from the GitHub Releases page.
2. Extract the archive.
3. Place the `glitter-ckeditor5_expansion` directory in the Gnuboard7 `plugins/` directory.
4. Install and activate the plugin using the Gnuboard7 plugin management interface or supported Artisan commands.
5. Open the plugin settings page to configure the available features.

Example commands, executed from the Gnuboard7 project root:

```sh
php artisan plugin:install glitter-ckeditor5_expansion
php artisan plugin:activate glitter-ckeditor5_expansion
```

Ensure that the required `sirsoft-ckeditor5` dependency is installed and activated before enabling this plugin.

## Updating

Back up the application and review the release notes before updating.

For installations managed through the Gnuboard7 plugin system, use the supported plugin update workflow.

Example:

```sh
php artisan plugin:update glitter-ckeditor5_expansion
```

When updating from a bundled extension source:

```sh
php artisan plugin:update glitter-ckeditor5_expansion --source=bundled --force
```

The bundled-source command is intended for installations that maintain the plugin under `plugins/_bundled/`. It is not required for ordinary ZIP-based installations.

The `--force` option should be used only when an update is intentionally required, including cases where source changes have been made without changing the plugin version.

After updating:

1. Verify that the plugin is installed and active.
2. Confirm that the deployed JavaScript and CSS assets reflect the intended source version.
3. Clear relevant application caches if necessary.
4. Verify that the editor and media features load correctly.
5. Review browser console messages and CSP violations when deploying under a restrictive security policy.

Production deployments should follow the hosting application's operational safety and extension lifecycle requirements.

## Configuration

Plugin settings are managed through the Gnuboard7 plugin administration interface.

Available settings cover the supported editor extensions, media handling, uploads, rendering, and related functionality.

HTML5 video playback options can be selected when inserting or configuring uploaded videos.

The Loop toggle displayed beneath a video allows viewers to temporarily change repeat playback behavior. This does not alter the original video settings stored in the post.

## JavaScript Build

The JavaScript source files are maintained in:

```text
resources/js/src/
```

The numbered source fragments are concatenated in lexical order to generate:

```text
resources/js/index.js
dist/js/plugin.iife.js
resources/css/plugin.css
dist/css/plugin.css
```

The IIFE exposes:

```js
window.GlitterCkeditor5Expansion
```

For development, run the following commands from the plugin directory:

```sh
npm run build
npm run build:check
```

Alternatively, from the Gnuboard7 project root when working with the bundled source:

```sh
npm run build --prefix plugins/_bundled/glitter-ckeditor5_expansion
npm run build:check --prefix plugins/_bundled/glitter-ckeditor5_expansion
```

The build uses Node.js and the included build script. It copies the plugin CSS source to the distributable CSS file. No Vite or additional third-party frontend build packages are required.

Prebuilt JavaScript assets are included in the release package, so end users do not need to run the build commands.

### Build and Deployment Notes

When modifying the plugin source:

- Update the relevant source fragments under `resources/js/src/`.
- Maintain the corresponding CSS source under `resources/css/`.
- Run the supported build command.
- Verify build consistency using `npm run build:check`.
- Confirm that generated assets match the updated source.
- Deploy the plugin through the supported Gnuboard7 plugin lifecycle.

Generated assets should not be modified independently of their source files.

For production deployments, verify that the installed plugin assets correspond to the intended bundled or release source.

## Compatibility and Coexistence

Glitter CKEditor5 Expansion uses its own plugin identifier, PHP namespace, routes, settings, rate limiter names, database tables, storage scope, and frontend global.

The plugin does not modify the `sirsoft-ckeditor5` dependency directly.

Some public-facing upload hooks and download filename middleware integrate with existing Gnuboard7 upload routes.

When using this plugin alongside other extensions that modify the same upload or editor functionality, verify compatibility in the target environment.

Running this plugin simultaneously with the original `g7-ckeditor5-superpack` reference plugin is not a required or generally recommended configuration because overlapping functionality may result in conflicts.

### CSP and Other Extensions

The plugin's CSP improvements apply only to its own implementation.

Other plugins, templates, or the CKEditor 5 core may independently generate inline styles, dynamic scripts, or other resources subject to the hosting application's CSP.

Compatibility with a strict CSP must therefore be evaluated at the application level rather than inferred solely from this plugin's source validation.

## Validation

### Version 0.1.7 — CSP Compatibility Improvements

Version 0.1.7 includes source-level changes to improve CSP compatibility in social media embedding, video-related controls, and code-copy interfaces.

The following development and deployment checks were reported as completed:

- JavaScript syntax validation passed.
- Relevant PHP syntax validation passed.
- JSON parsing validation passed.
- JavaScript production build completed successfully.
- JavaScript build consistency check passed.
- Bundled-source plugin update completed successfully.
- Installed plugin activation status verified.
- Bundled and deployed assets matched by SHA-256 checksums.
- Deployed assets returned successful HTTP responses.

The update was applied through the supported Gnuboard7 plugin lifecycle.

No automated functional, integration, or browser test suites were executed.

Browser-level CSP violation monitoring and complete functional testing under a strictly enforced CSP were not completed.

The plugin's CSP-related improvements should therefore be considered source-validated and deployment-verified, but not fully browser-verified under a strict CSP.

### Version 0.1.4 — Previous Validation

Version 0.1.4 underwent the following development and deployment checks:

- JavaScript build completed successfully.
- JavaScript build consistency check passed.
- JavaScript syntax validation passed.
- PHP syntax validation passed.
- JSON validation passed.
- Composer validation passed.
- Bundled-source plugin update completed successfully.
- Installed plugin version and activation status verified.
- Bundled and installed JavaScript assets verified using SHA-256 checksums.
- Existing database records, post content, and uploaded video files were not modified during the v0.1.4 update.

Automated test suites were not executed for this release.

Final interaction testing on Chrome and mobile browsers was not completed at the time of the v0.1.4 deployment report.

## Credits

**Original work**

CKEditor 5 Superpack (`g7-ckeditor5-superpack`)  
Copyright (c) 2026 William Cho

**Modifications and extensions**

Glitter CKEditor5 Expansion  
Copyright (c) 2026 Glitter.kr

This project incorporates portions adapted from the original MIT-licensed work. The original author's copyright and applicable license notices are retained.

New modifications, enhancements, and independently authored components are attributed to Glitter.kr.

## License

Glitter CKEditor5 Expansion is distributed under the MIT License.

See [LICENSE](LICENSE) for the full license text and copyright notices.

CKEditor 5 is provided separately through the `sirsoft-ckeditor5` dependency. CKEditor 5 and other third-party dependencies remain subject to their respective licensing terms.
