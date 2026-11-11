<?php

namespace Plugins\Glitter\Ckeditor5Expansion\Http\Controllers;

use App\Http\Controllers\Api\Base\PublicBaseController;
use Illuminate\Http\JsonResponse;
use Plugins\Glitter\Ckeditor5Expansion\Models\VideoUpload;
use Plugins\Glitter\Ckeditor5Expansion\Services\VideoUploadService;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * 업로드된 동영상 스트리밍 (공개 — 추측 불가한 public_id).
 *
 * `GET /api/plugins/glitter-ckeditor5_expansion/video/{id}` — `BinaryFileResponse` 로
 * `Range` 요청을 자동 지원(206 Partial Content, `Accept-Ranges: bytes`)해 탐색·스트리밍이
 * 정상 동작한다.
 */
class VideoServeController extends PublicBaseController
{
    public function __construct(
        private readonly VideoUploadService $videoUploadService,
    ) {
        parent::__construct();
    }

    public function show(string $id): BinaryFileResponse|JsonResponse
    {
        if (! preg_match('/^[a-f0-9]{32}$/', $id)) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $video = VideoUpload::query()->where('public_id', $id)->first();
        if (! $video) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $response = $this->videoUploadService->serveResponse($video);
        if (! $response) {
            return response()->json(['message' => 'Not found'], 404);
        }

        return $response;
    }
}


