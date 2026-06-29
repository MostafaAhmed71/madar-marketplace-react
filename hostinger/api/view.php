<?php
/**
 * مدار - عرض ملف محمي مباشرة (للوحة الإدارة)
 * يتطلب X-API-Key — يُستخدم عبر fetch ثم blob URL في المتصفح
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-API-Key');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method not allowed');
}

$apiKey = $_SERVER['HTTP_X_API_KEY'] ?? '';
if ($apiKey !== API_KEY) {
    http_response_code(401);
    exit('غير مصرح');
}

$input = json_decode(file_get_contents('php://input'), true);
$key = $input['key'] ?? '';

if (!$key || strpos($key, '..') !== false || strpos($key, 'marketplace/') !== 0) {
    http_response_code(400);
    exit('مفتاح غير صالح');
}

$fullPath = UPLOAD_DIR . '/' . $key;
if (!file_exists($fullPath)) {
    http_response_code(404);
    exit('الملف غير موجود');
}

$mime = mime_content_type($fullPath) ?: 'application/octet-stream';
$filename = basename($key);

header('Content-Type: ' . $mime);
header('Content-Disposition: inline; filename="' . $filename . '"');
header('Cache-Control: private, max-age=300');
readfile($fullPath);
