<?php
declare(strict_types=1);

const CONSENT_VERSION = 'v1';
const CONSENT_TEXTS = [
    'v1' => 'Acepto recibir comunicaciones comerciales y publicidad de Canary Consulting (ofertas y novedades de luz, gas y energía) por correo electrónico, SMS o WhatsApp. Puedo darme de baja cuando quiera.',
];

const BASE_URL = 'https://canaryislandconsulting.es/juego/';
const MAIL_FROM = 'info@canaryislandconsulting.es';
const MAIL_REPLY = 'info@canaryislandconsulting.es';

const CONFIRM_DIAS = 7;          // un correo sin confirmar se borra a los 7 días
const ENVIO_ESPERA_SEG = 60;     // entre un correo y el siguiente al mismo contacto
const ENVIO_MAX_DIA = 5;         // correos por contacto al día
const ENVIO_MAX_IP_HORA = 10;    // correos por conexión a la hora
const CODIGO_FALLOS_IP_HORA = 10;
const CODIGO_ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function db(): PDO
{
    $pdo = new PDO('sqlite:' . __DIR__ . '/registros.sqlite');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec('PRAGMA busy_timeout = 5000');
    $pdo->exec('PRAGMA foreign_keys = ON');
    $pdo->exec('CREATE TABLE IF NOT EXISTS registros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo TEXT NOT NULL,
        contacto TEXT NOT NULL UNIQUE,
        creado_utc TEXT NOT NULL,
        creado_local TEXT NOT NULL,
        ultimo_acceso_utc TEXT NOT NULL,
        accesos INTEGER NOT NULL DEFAULT 1,
        baja_utc TEXT
    )');
    $existentes = [];
    foreach ($pdo->query('PRAGMA table_info(registros)') as $col) {
        $existentes[$col['name']] = true;
    }
    foreach (['confirmado_utc', 'token_hash', 'token_utc', 'ticket_hash', 'telefono'] as $col) {
        if (!isset($existentes[$col])) {
            $pdo->exec('ALTER TABLE registros ADD COLUMN ' . $col . ' TEXT');
        }
    }
    $pdo->exec('CREATE TABLE IF NOT EXISTS consentimientos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        registro_id INTEGER NOT NULL REFERENCES registros(id) ON DELETE CASCADE,
        fecha_utc TEXT NOT NULL,
        fecha_local TEXT NOT NULL,
        version TEXT NOT NULL,
        texto TEXT NOT NULL,
        ip TEXT NOT NULL,
        ip_directa TEXT NOT NULL,
        user_agent TEXT NOT NULL,
        pagina TEXT NOT NULL
    )');
    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_consent_ip ON consentimientos (ip, fecha_utc)');
    $pdo->exec('CREATE TABLE IF NOT EXISTS confirmaciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        registro_id INTEGER NOT NULL REFERENCES registros(id) ON DELETE CASCADE,
        fecha_utc TEXT NOT NULL,
        fecha_local TEXT NOT NULL,
        ip TEXT NOT NULL,
        user_agent TEXT NOT NULL
    )');
    $pdo->exec('CREATE TABLE IF NOT EXISTS envios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        registro_id INTEGER NOT NULL REFERENCES registros(id) ON DELETE CASCADE,
        fecha_utc TEXT NOT NULL,
        ip TEXT NOT NULL
    )');
    $pdo->exec('CREATE TABLE IF NOT EXISTS invitaciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT NOT NULL UNIQUE,
        nota TEXT NOT NULL DEFAULT \'\',
        minutos INTEGER NOT NULL,
        max_usos INTEGER NOT NULL,
        creado_utc TEXT NOT NULL,
        creado_local TEXT NOT NULL
    )');
    $pdo->exec('CREATE TABLE IF NOT EXISTS canjes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invitacion_id INTEGER NOT NULL REFERENCES invitaciones(id) ON DELETE CASCADE,
        dispositivo_hash TEXT NOT NULL,
        inicio_utc TEXT NOT NULL,
        fin_utc TEXT NOT NULL,
        ip TEXT NOT NULL,
        user_agent TEXT NOT NULL
    )');
    $pdo->exec('CREATE TABLE IF NOT EXISTS fallos_codigo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip TEXT NOT NULL,
        fecha_utc TEXT NOT NULL
    )');
    return $pdo;
}

function ahora_utc(): string
{
    return gmdate('Y-m-d H:i:s');
}

function ahora_local(): string
{
    return (new DateTime('now', new DateTimeZone('Atlantic/Canary')))->format('Y-m-d H:i:s');
}

function epoch_utc(string $fecha): int
{
    return (int)strtotime($fecha . ' UTC');
}

function secreto(int $bytes = 16): string
{
    return bin2hex(random_bytes($bytes));
}

function hash_secreto(string $s): string
{
    return hash('sha256', $s);
}

/** @return array{0:string,1:string}|null [tipo, valor normalizado] o null si no es válido */
function normalizar_contacto(string $tipo, string $crudo): ?array
{
    $crudo = trim($crudo);
    if ($tipo === 'email') {
        $v = mb_strtolower($crudo);
        if (strlen($v) > 120 || !filter_var($v, FILTER_VALIDATE_EMAIL)) {
            return null;
        }
        return ['email', $v];
    }
    if ($tipo === 'telefono') {
        $v = preg_replace('/[\s.\-()]/', '', $crudo) ?? '';
        if (strpos($v, '00') === 0) {
            $v = '+' . substr($v, 2);
        }
        if (preg_match('/^[6789]\d{8}$/', $v)) {
            $v = '+34' . $v;
        }
        if (!preg_match('/^\+\d{8,15}$/', $v)) {
            return null;
        }
        return ['telefono', $v];
    }
    return null;
}

function ip_cliente(): string
{
    $directa = $_SERVER['REMOTE_ADDR'] ?? '';
    $reenviada = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
    if ($reenviada !== '') {
        $primera = trim(explode(',', $reenviada)[0]);
        if (filter_var($primera, FILTER_VALIDATE_IP)) {
            return $primera;
        }
    }
    return $directa;
}

function user_agent(): string
{
    return substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 300);
}

/** quita los correos sin confirmar con más de CONFIRM_DIAS días (y todo lo suyo) */
function limpiar_sin_confirmar(PDO $pdo): void
{
    $limite = gmdate('Y-m-d H:i:s', time() - CONFIRM_DIAS * 86400);
    $pdo->prepare("DELETE FROM registros WHERE tipo = 'email' AND confirmado_utc IS NULL AND creado_utc < ?")->execute([$limite]);
}

/** null si se puede mandar otro correo; si no, el motivo en español */
function motivo_sin_envio(PDO $pdo, int $registroId, string $ip): ?string
{
    $ultimo = $pdo->prepare('SELECT MAX(fecha_utc) FROM envios WHERE registro_id = ?');
    $ultimo->execute([$registroId]);
    $f = $ultimo->fetchColumn();
    if ($f && epoch_utc((string)$f) > time() - ENVIO_ESPERA_SEG) {
        return 'Ya te hemos mandado un correo hace un momento. Mira tu bandeja de entrada (y el spam)';
    }
    $dia = $pdo->prepare('SELECT COUNT(*) FROM envios WHERE registro_id = ? AND fecha_utc > ?');
    $dia->execute([$registroId, gmdate('Y-m-d H:i:s', time() - 86400)]);
    if ((int)$dia->fetchColumn() >= ENVIO_MAX_DIA) {
        return 'Has pedido demasiados correos hoy. Prueba mañana';
    }
    $hora = $pdo->prepare('SELECT COUNT(*) FROM envios WHERE ip = ? AND fecha_utc > ?');
    $hora->execute([$ip, gmdate('Y-m-d H:i:s', time() - 3600)]);
    if ((int)$hora->fetchColumn() >= ENVIO_MAX_IP_HORA) {
        return 'Demasiados intentos desde tu conexión. Prueba más tarde';
    }
    return null;
}

/** crea un enlace nuevo para el registro, lo manda y lo anota; false si el correo no salió */
function mandar_confirmacion(PDO $pdo, int $registroId, string $para, string $ip): bool
{
    $token = secreto(24);
    $pdo->prepare('UPDATE registros SET token_hash = ?, token_utc = ? WHERE id = ?')
        ->execute([hash_secreto($token), ahora_utc(), $registroId]);
    $pdo->prepare('INSERT INTO envios (registro_id, fecha_utc, ip) VALUES (?, ?, ?)')
        ->execute([$registroId, ahora_utc(), $ip]);
    return enviar_correo_confirmacion($para, BASE_URL . 'confirmar.php?t=' . $token);
}

function enviar_correo_confirmacion(string $para, string $enlace): bool
{
    $asunto = 'Confirma tu correo para jugar a Lava Game';
    $permiso = CONSENT_TEXTS[CONSENT_VERSION];
    $texto = "Hola,\n\nAlguien (esperamos que tú) se ha registrado en Lava Game con este correo.\n\n"
        . "Para confirmar que es tuyo y entrar al juego, abre este enlace y pulsa el botón:\n$enlace\n\n"
        . "Al confirmar, esto es lo que aceptas:\n$permiso\n\n"
        . "Si no has sido tú, ignora este mensaje: no pasará nada.\n\n"
        . "Canary Consulting · 620 983 685 · " . MAIL_REPLY . "\n";
    $e = static fn(string $s): string => htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $html = '<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#222;line-height:1.5">'
        . '<h2 style="color:#e0560f">Confirma tu correo</h2>'
        . '<p>Alguien (esperamos que tú) se ha registrado en <b>Lava Game</b> con este correo.</p>'
        . '<p><a href="' . $e($enlace) . '" style="display:inline-block;background:#ff6a12;color:#fff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:8px">Confirmar y entrar al juego</a></p>'
        . '<p style="font-size:13px;color:#555">Al confirmar, esto es lo que aceptas:<br>' . $e($permiso) . '</p>'
        . '<p style="font-size:13px;color:#555">Si el botón no funciona, copia este enlace en el navegador:<br>' . $e($enlace) . '</p>'
        . '<p style="font-size:13px;color:#555">Si no has sido tú, ignora este mensaje: no pasará nada.</p>'
        . '<p style="font-size:13px;color:#555">Canary Consulting · 620 983 685 · ' . $e(MAIL_REPLY) . '</p></div>';

    $limite = 'lava' . bin2hex(random_bytes(8));
    $cabeceras = implode("\r\n", [
        'From: Lava Game <' . MAIL_FROM . '>',
        'Reply-To: ' . MAIL_REPLY,
        'MIME-Version: 1.0',
        'Content-Type: multipart/alternative; boundary="' . $limite . '"',
    ]);
    $cuerpo = "--$limite\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($texto))
        . "--$limite\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($html))
        . "--$limite--";
    $asuntoCodificado = '=?UTF-8?B?' . base64_encode($asunto) . '?=';

    $salio = @mail($para, $asuntoCodificado, $cuerpo, $cabeceras, '-f' . MAIL_FROM);
    $via = 'con -f';
    if (!$salio) {
        $salio = @mail($para, $asuntoCodificado, $cuerpo, $cabeceras);
        $via = 'sin -f';
    }
    $error = error_get_last();
    @file_put_contents(__DIR__ . '/correo.log',
        ahora_utc() . ' ' . ($salio ? 'SALIO' : 'FALLO') . ' ' . $via . ' ' . substr(hash_secreto($para), 0, 8)
        . ($salio || !$error ? '' : ' ' . $error['message']) . "
", FILE_APPEND | LOCK_EX);
    return $salio;
}

function normalizar_codigo(string $crudo): string
{
    return strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $crudo) ?? '');
}

/** LAVA2K7M9QPD -> LAVA-2K7M-9QPD */
function formatear_codigo(string $codigo): string
{
    return implode('-', str_split($codigo, 4));
}

function generar_codigo(): string
{
    $c = 'LAVA';
    for ($i = 0; $i < 8; $i++) {
        $c .= CODIGO_ALFABETO[random_int(0, strlen(CODIGO_ALFABETO) - 1)];
    }
    return $c;
}

/**
 * Canjea (o retoma) un código de invitación en un dispositivo.
 * @return array{ok:bool,mensaje:string,restan:int} restan = segundos de juego que quedan
 */
function canjear_codigo(PDO $pdo, string $crudo, string $dispositivo, string $ip): array
{
    $fallo = static fn(string $m): array => ['ok' => false, 'mensaje' => $m, 'restan' => 0];

    $fallos = $pdo->prepare('SELECT COUNT(*) FROM fallos_codigo WHERE ip = ? AND fecha_utc > ?');
    $fallos->execute([$ip, gmdate('Y-m-d H:i:s', time() - 3600)]);
    if ((int)$fallos->fetchColumn() >= CODIGO_FALLOS_IP_HORA) {
        return $fallo('Demasiados intentos con códigos. Prueba más tarde');
    }

    $codigo = normalizar_codigo($crudo);
    $busca = $pdo->prepare('SELECT * FROM invitaciones WHERE codigo = ?');
    $busca->execute([$codigo]);
    $inv = $busca->fetch();
    if (!$inv) {
        $pdo->prepare('INSERT INTO fallos_codigo (ip, fecha_utc) VALUES (?, ?)')->execute([$ip, ahora_utc()]);
        return $fallo('Ese código no vale. Revísalo o pídenos otro');
    }

    $dispositivoHash = hash_secreto($dispositivo);
    $previo = $pdo->prepare('SELECT * FROM canjes WHERE invitacion_id = ? AND dispositivo_hash = ?');
    $previo->execute([$inv['id'], $dispositivoHash]);
    $canje = $previo->fetch();
    if ($canje) {
        $restan = epoch_utc((string)$canje['fin_utc']) - time();
        if ($restan <= 0) {
            return $fallo('Tu tiempo de invitado ha terminado. Regístrate para seguir jugando');
        }
        return ['ok' => true, 'mensaje' => '', 'restan' => $restan];
    }

    $usos = $pdo->prepare('SELECT COUNT(*) FROM canjes WHERE invitacion_id = ?');
    $usos->execute([$inv['id']]);
    if ((int)$usos->fetchColumn() >= (int)$inv['max_usos']) {
        return $fallo('Ese código ya se ha usado');
    }

    $segundos = (int)$inv['minutos'] * 60;
    $pdo->prepare('INSERT INTO canjes (invitacion_id, dispositivo_hash, inicio_utc, fin_utc, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?)')
        ->execute([$inv['id'], $dispositivoHash, ahora_utc(), gmdate('Y-m-d H:i:s', time() + $segundos), $ip, user_agent()]);
    return ['ok' => true, 'mensaje' => '', 'restan' => $segundos];
}
