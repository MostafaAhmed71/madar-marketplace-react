<?php
/**
 * مدار - API رفع الملفات على Hostinger
 * ضع هذا الملف في: public_html/api/upload.php
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

if (!isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['message' => 'لم يُرفع ملف']);
    exit;
}

$folder = preg_replace('/[^a-z]/', '', $_POST['folder'] ?? 'previews');
$allowedFolders = ['products', 'receipts', 'previews'];
if (!in_array($folder, $allowedFolders)) {
    http_response_code(400);
    echo json_encode(['message' => 'مجلد غير صالح']);
    exit;
}

$subfolder = preg_replace('/[^a-zA-Z0-9_-]/', '', $_POST['subfolder'] ?? '');
$file = $_FILES['file'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['message' => 'خطأ في الرفع']);
    exit;
}

$maxSize = $folder === 'receipts' ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['message' => 'حجم الملف كبير جداً']);
    exit;
}

$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowedExt = ['pdf', 'docx', 'pptx', 'xlsx', 'jpg', 'jpeg', 'png', 'webp', 'zip'];
if (!in_array($ext, $allowedExt)) {
    http_response_code(400);
    echo json_encode(['message' => 'نوع ملف غير مسموح']);
    exit;
}

$safeName = time() . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
$relativePath = 'marketplace/' . $folder;
if ($subfolder) {
    $relativePath .= '/' . $subfolder;
}
$relativePath .= '/' . $safeName;

$fullDir = UPLOAD_DIR . '/' . dirname($relativePath);
if (!is_dir($fullDir)) {
    mkdir($fullDir, 0755, true);
}

$fullPath = UPLOAD_DIR . '/' . $relativePath;
if (!move_uploaded_file($file['tmp_name'], $fullPath)) {
    http_response_code(500);
    echo json_encode(['message' => 'فشل حفظ الملف']);
    exit;
}

$response = ['key' => $relativePath];
if ($folder === 'previews') {
    $response['url'] = PUBLIC_URL . '/' . $relativePath;
}

echo json_encode($response);
