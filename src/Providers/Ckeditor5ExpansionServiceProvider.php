<?php

namespace Plugins\Glitter\Ckeditor5Expansion\Providers;

use App\Extension\BasePluginServiceProvider;
use Plugins\Glitter\Ckeditor5Expansion\Console\Commands\PruneLinkPreviewsCommand;
use Plugins\Glitter\Ckeditor5Expansion\Console\Commands\PruneVideosCommand;
use Plugins\Glitter\Ckeditor5Expansion\Contracts\LinkPreviewFetcher;
use Plugins\Glitter\Ckeditor5Expansion\Services\CurlLinkPreviewFetcher;
use Plugins\Glitter\Ckeditor5Expansion\Services\VideoUploadService;
use Plugins\Glitter\Ckeditor5Expansion\Support\Ckeditor5ExpansionRateLimiters;

/**
 * CKEditor 5 슈퍼팩 서비스 프로바이더.
 *
 * - `VideoUploadService` 에 플러그인 격리 `StorageInterface` 자동 주입
 *   (BasePluginServiceProvider 표준: `plugins` 디스크의 `glitter-ckeditor5_expansion/` 하위).
 * - 라우트가 쓰는 이름 있는 제한기 등록 (`Ckeditor5ExpansionRateLimiters`). 이 프로바이더는
 *   `PluginRouteServiceProvider` 보다 먼저 부팅되므로 라우트보다 앞선다.
 * - 링크 프리뷰 수신기 `LinkPreviewFetcher` → `CurlLinkPreviewFetcher` 바인딩
 *   (테스트는 `app()->instance()` 로 대체 구현을 넣는다).
 * - 콘솔 실행 시 정리 커맨드 등록 (미참조 동영상/만료 세션, 링크 프리뷰 캐시).
 * - `lang/{locale}/messages.php` 를 `glitter-ckeditor5_expansion::messages.*` 네임스페이스로 로드.
 */
class Ckeditor5ExpansionServiceProvider extends BasePluginServiceProvider
{
    protected string $pluginIdentifier = 'glitter-ckeditor5_expansion';

    /**
     * 기본 StorageInterface 주입이 필요한 서비스.
     *
     * @var array<class-string>
     */
    protected array $storageServices = [
        VideoUploadService::class,
    ];

    /**
     * 플러그인 부팅 — 제한기 등록, 수신기 바인딩, 콘솔 실행 시 정리 커맨드 등록.
     */
    public function boot(): void
    {
        parent::boot();

        Ckeditor5ExpansionRateLimiters::register();

        $this->app->bindIf(LinkPreviewFetcher::class, CurlLinkPreviewFetcher::class);

        if ($this->app->runningInConsole()) {
            $this->commands([
                PruneVideosCommand::class,
                PruneLinkPreviewsCommand::class,
            ]);
        }
    }
}



