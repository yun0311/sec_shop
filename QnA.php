<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH');
header('Access-Control-Allow-Headers: Content-Type');
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// 문의 조회
if ($method === 'GET') {
    $email = trim($_GET['email'] ?? '');
    if ($email) {
        $stmt = $pdo->prepare("
            SELECT i.*,
                   CASE WHEN u.id IS NOT NULL THEN 1 ELSE 0 END AS is_member
            FROM inquiries i
            LEFT JOIN users u ON LOWER(i.email) = LOWER(u.email)
            WHERE i.email = ?
            ORDER BY i.id DESC
        ");
        $stmt->execute([$email]);
    } else {
        $stmt = $pdo->query("
            SELECT i.*,
                   CASE WHEN u.id IS NOT NULL THEN 1 ELSE 0 END AS is_member
            FROM inquiries i
            LEFT JOIN users u ON LOWER(i.email) = LOWER(u.email)
            ORDER BY i.id DESC
        ");
    }
    $inquiries = $stmt->fetchAll();

    // attachments JSON 파싱
    foreach ($inquiries as &$inq) {
        if (!empty($inq['attachments'])) {
            $inq['attachments'] = json_decode($inq['attachments'], true);
        } else {
            $inq['attachments'] = [];
        }
    }

    echo json_encode(['success' => true, 'inquiries' => $inquiries]);
    exit;
}

// 문의 등록
if ($method === 'POST') {
    // FormData로 받기
    $type    = trim($_POST['type']    ?? '');
    $name    = trim($_POST['name']    ?? '');
    $email   = trim($_POST['email']   ?? '');
    $subject = trim($_POST['subject'] ?? '');
    $content = trim($_POST['content'] ?? '');
    $user_id = isset($_POST['user_id']) && $_POST['user_id'] !== '' ? intval($_POST['user_id']) : null;

    if (!$type || !$name || !$email || !$subject || !$content) {
        echo json_encode(['success' => false, 'message' => '필수 항목을 모두 입력해주세요']);
        exit;
    }

    // 파일 업로드 처리
    $uploadDir = __DIR__ . '/uploads/inquiries/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $attachments = [];
    $fileCount   = intval($_POST['file_count'] ?? 0);
    $allowedExt  = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'zip', 'txt', 'docx', 'xlsx'];
    $maxSize     = 10 * 1024 * 1024; // 10MB

    for ($i = 0; $i < $fileCount; $i++) {
        $key = "file_{$i}";
        if (!isset($_FILES[$key]) || $_FILES[$key]['error'] !== UPLOAD_ERR_OK) continue;

        $file    = $_FILES[$key];
        $origName= $file['name'];
        $ext     = strtolower(pathinfo($origName, PATHINFO_EXTENSION));

        if (!in_array($ext, $allowedExt)) continue;
        if ($file['size'] > $maxSize) continue;

        // 고유 파일명 생성 (마이크로초 + 인덱스로 중복 방지)
        $saveName = date('YmdHis') . '_' . $i . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $savePath = $uploadDir . $saveName;

        if (move_uploaded_file($file['tmp_name'], $savePath)) {
            $attachments[] = [
                'original' => $origName,
                'saved'    => $saveName,
                'url'      => 'uploads/inquiries/' . $saveName,
                'size'     => $file['size'],
            ];
        }
    }

    $attachmentsJson = count($attachments) ? json_encode($attachments) : null;

    $stmt = $pdo->prepare("
        INSERT INTO inquiries (type, name, email, subject, content, user_id, attachments)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$type, $name, $email, $subject, $content, $user_id, $attachmentsJson]);

    echo json_encode(['success' => true, 'message' => '문의가 접수되었습니다']);
    exit;
}

// 답변 상태 변경
if ($method === 'PATCH') {
    $data   = json_decode(file_get_contents('php://input'), true);
    $id     = intval($data['id'] ?? 0);
    $status = trim($data['status'] ?? '');

    if (!$id || !in_array($status, ['pending', 'answered'])) {
        echo json_encode(['success' => false, 'message' => '잘못된 요청']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE inquiries SET status = ? WHERE id = ?");
    $stmt->execute([$status, $id]);
    echo json_encode(['success' => true, 'message' => '상태가 변경되었습니다']);
    exit;
}

echo json_encode(['success' => false, 'message' => '잘못된 요청']);
?>