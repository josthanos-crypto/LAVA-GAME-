<?php
declare(strict_types=1);

require __DIR__ . '/datos/lib.php';

header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');
header('Referrer-Policy: no-referrer');

const TOKEN_VALIDO_DIAS = 7;

function pagina(string $titulo, string $mensaje, string $extra = ''): void
{
    $e = static fn(string $s): string => htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    echo '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        . '<meta name="robots" content="noindex"><title>' . $e($titulo) . ' · Lava Game</title>'
        . '<style>body{font-family:system-ui,Arial,sans-serif;background:#170a05;color:#f3e6d8;display:grid;place-items:center;min-height:100vh;margin:0;padding:16px;box-sizing:border-box}'
        . 'main{background:#2a1409;border:1px solid rgba(255,150,70,.4);border-radius:18px;padding:28px 24px;width:min(460px,100%);text-align:center}'
        . 'h1{color:#ffb340;margin:0 0 10px}p{line-height:1.5}.n{font-size:13px;color:#a69383}'
        . 'button,a.b{display:inline-block;font:inherit;font-weight:800;font-size:18px;padding:12px 24px;border-radius:999px;border:0;cursor:pointer;text-decoration:none;'
        . 'color:#1a0a03;background:linear-gradient(180deg,#ffc233,#ff6a12);margin-top:8px}a{color:#ffb340}</style></head><body><main>'
        . '<h1>' . $e($titulo) . '</h1><p>' . $e($mensaje) . '</p>' . $extra . '</main></body></html>';
}

function registro_por_token(PDO $pdo, string $token): ?array
{
    if (!preg_match('/^[a-f0-9]{48}$/', $token)) {
        return null;
    }
    $q = $pdo->prepare('SELECT * FROM registros WHERE token_hash = ?');
    $q->execute([hash_secreto($token)]);
    $reg = $q->fetch();
    if (!$reg || $reg['token_utc'] === null) {
        return null;
    }
    if (epoch_utc((string)$reg['token_utc']) < time() - TOKEN_VALIDO_DIAS * 86400) {
        return null;
    }
    return $reg;
}

$token = (string)($_POST['t'] ?? $_GET['t'] ?? '');
$esPost = ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST';

try {
    $pdo = db();
    $reg = registro_por_token($pdo, $token);

    if ($reg === null) {
        http_response_code(410);
        pagina('Este enlace ya no vale', 'Ha caducado o ya se usó. Vuelve al juego y pide otro correo de confirmación.',
            '<p><a class="b" href="' . BASE_URL . '">Ir al juego</a></p>');
        exit;
    }

    if (!$esPost) {
        // un lector de correo que abra el enlace no confirma nada: hace falta pulsar el botón
        pagina('Confirma tu correo',
            'Pulsa el botón para confirmar que ' . $reg['contacto'] . ' es tuyo y que aceptas recibir publicidad de Canary Consulting.',
            '<form method="post"><input type="hidden" name="t" value="' . htmlspecialchars($token, ENT_QUOTES) . '">'
            . '<button>Confirmar y entrar al juego</button></form>'
            . '<p class="n">' . htmlspecialchars(CONSENT_TEXTS[CONSENT_VERSION], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '</p>');
        exit;
    }

    $pdo->beginTransaction();
    $pdo->prepare('UPDATE registros SET confirmado_utc = ?, baja_utc = NULL, token_hash = NULL, token_utc = NULL WHERE id = ?')
        ->execute([ahora_utc(), $reg['id']]);
    $pdo->prepare('INSERT INTO confirmaciones (registro_id, fecha_utc, fecha_local, ip, user_agent) VALUES (?, ?, ?, ?, ?)')
        ->execute([$reg['id'], ahora_utc(), ahora_local(), ip_cliente(), user_agent()]);
    $pdo->commit();

    pagina('¡Correo confirmado!', 'Ya estás dentro. Vuelve a la pestaña del juego: entra solo. Si la cerraste, abre el juego y pon tu correo otra vez.',
        '<p><a class="b" href="' . BASE_URL . '">Ir al juego</a></p>');
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('confirmar.php: ' . $e->getMessage());
    http_response_code(500);
    pagina('Algo ha fallado', 'No hemos podido confirmar tu correo. Inténtalo otra vez en un rato.');
}
