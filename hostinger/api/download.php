<?php
/**
 * مدار - API تحميل الملفات المحمية (رابط مؤقت)
 * ضع هذا الملف في: public_html/api/download.php
 */

header('Content-Type: application/json; charset=utf-8');
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
    echo json_encode(['message' => 'Method not allowed']);
    exit;
}

$apiKey = $_SERVER['HTTP_X_API_KEY'] ?? '';
if ($apiKey !== API_KEY) {
    http_response_code(401);
    echo json_encode(['message' => 'غير مصرح']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$key = $input['key'] ?? '';

if (!$key || strpos($key, '..') !== false) {
    http_response_code(400);
    echo json_encode(['message' => 'مفتاح غير صالح']);
    exit;
}

$fullPath = UPLOAD_DIR . '/' . $key;
if (!file_exists($fullPath)) {
    http_response_code(404);
    echo json_encode(['message' => 'الملف غير موجود']);
    exit;
}

$token = bin2hex(random_bytes(16));
$expires = time() + 900; // 15 دقيقة

$tokensFile = UPLOAD_DIR . '/.tokens.json';
$tokens = file_exists($tokensFile) ? json_decode(file_get_contents($tokensFile), true) : [];

// تنظيف الرموز المنتهية
$tokens = array_filter($tokens, fn($t) => $t['expires'] > time());
$tokens[$token] = ['key' => $key, 'expires' => $expires];
file_put_contents($tokensFile, json_encode($tokens));

$url = PUBLIC_URL . '/serve.php?token=' . $token;
echo json_encode(['url' => $url, 'expiresIn' => 900]);
