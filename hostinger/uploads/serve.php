<?php
/**
 * مدار - تقديم الملفات برابط مؤقت
 * ضع هذا الملف في: public_html/uploads/serve.php
 */

require_once __DIR__ . '/../api/config.php';

$token = $_GET['token'] ?? '';
if (!$token) {
    http_response_code(400);
    exit('رابط غير صالح');
}

$tokensFile = UPLOAD_DIR . '/.tokens.json';
if (!file_exists($tokensFile)) {
    http_response_code(403);
    exit('غير مصرح');
}

$tokens = json_decode(file_get_contents($tokensFile), true);
if (!isset($tokens[$token]) || $tokens[$token]['expires'] < time()) {
    http_response_code(403);
    exit('انتهت صلاحية الرابط');
}

$key = $tokens[$token]['key'];
$fullPath = UPLOAD_DIR . '/' . $key;

if (!file_exists($fullPath)) {
    http_response_code(404);
    exit('الملف غير موجود');
}

$mime = mime_content_type($fullPath) ?: 'application/octet-stream';
$isImage = strpos($mime, 'image/') === 0;
header('Content-Type: ' . $mime);
header(
    'Content-Disposition: ' . ($isImage ? 'inline' : 'attachment') . '; filename="' . basename($key) . '"'
);
readfile($fullPath);
