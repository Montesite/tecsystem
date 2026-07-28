<?php
// Recebe o formulário de contato do site e repassa por e-mail.
// Não grava nada em disco/banco de dados: apenas envia e responde.

header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/phpmailer/Exception.php';
require __DIR__ . '/phpmailer/PHPMailer.php';
require __DIR__ . '/phpmailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

function responder($sucesso, $mensagem) {
    echo json_encode(['sucesso' => $sucesso, 'mensagem' => $mensagem]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    responder(false, 'Método não permitido.');
}

// Honeypot: campo invisível que só bots preenchem.
if (!empty($_POST['website'])) {
    responder(true, 'Mensagem enviada com sucesso.');
}

$nome     = trim($_POST['nome'] ?? '');
$email    = trim($_POST['email'] ?? '');
$telefone = trim($_POST['telefone'] ?? '');
$mensagem = trim($_POST['mensagem'] ?? '');

if ($nome === '' || $email === '' || $mensagem === '') {
    http_response_code(422);
    responder(false, 'Preencha nome, e-mail e mensagem.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    responder(false, 'E-mail inválido.');
}

$config = require __DIR__ . '/config.php';

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = $config['smtp_host'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $config['smtp_user'];
    $mail->Password   = $config['smtp_pass'];
    $mail->SMTPSecure = $config['smtp_secure'];
    $mail->Port       = $config['smtp_port'];
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom($config['from_email'], $config['from_name']);
    $mail->addAddress($config['to_email'], $config['to_name']);
    $mail->addReplyTo($email, $nome);

    $mail->Subject = 'Novo contato pelo site - ' . $nome;
    $mail->Body =
        "Nova mensagem recebida pelo formulário do site:\n\n" .
        "Nome: {$nome}\n" .
        "E-mail: {$email}\n" .
        "Telefone: " . ($telefone !== '' ? $telefone : '(não informado)') . "\n\n" .
        "Mensagem:\n{$mensagem}\n";

    $mail->send();

    responder(true, 'Mensagem enviada com sucesso! Em breve entraremos em contato.');
} catch (PHPMailerException $e) {
    http_response_code(500);
    responder(false, 'Não foi possível enviar sua mensagem no momento. Tente novamente mais tarde.');
}
