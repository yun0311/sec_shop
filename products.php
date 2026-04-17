<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require 'db.php';

$category = $_GET['category'] ?? 'all';
$search   = $_GET['search'] ?? '';
$sort     = $_GET['sort'] ?? 'default';

$sql    = "SELECT * FROM products WHERE 1=1";
$params = [];

if ($category !== 'all') {
    $sql    .= " AND category = ?";
    $params[] = $category;
}

if ($search) {
    $sql    .= " AND (name LIKE ? OR description LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
}

switch ($sort) {
    case 'price-asc':  $sql .= " ORDER BY price ASC";   break;
    case 'price-desc': $sql .= " ORDER BY price DESC";  break;
    case 'rating':     $sql .= " ORDER BY rating DESC"; break;
    case 'new':        $sql .= " ORDER BY id DESC";     break;
    default:           $sql .= " ORDER BY id ASC";      break;
}

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$products = $stmt->fetchAll();

echo json_encode(['success' => true, 'products' => $products]);
?>