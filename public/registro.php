<?php
declare(strict_types=1);

require __DIR__ . '/datos/lib.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

const MAX_BODY = 4096;
const MAX_PER_IP_HOUR = 30;

function responder(int $codigo, array $datos)
{
    http_response_code($codigo);
    echo json_encode($datos + ['ok' => $codigo < 400, 'mensaje' => ''], JSON_UNESCAPED_UNICODE);
    exit;
}

function fallo(int $codigo, string $mensaje)
{
    responder($codigo, ['ok' => false, 'mensaje' => $mensaje]);
}

/** el registro al que pertenece un ticket (el papel que se queda el navegador) */
function registro_por_ticket(PDO $pdo, string $ticket): ?array
{
    if (!preg_match('/^[a-f0-9]{32}$/', $ticket)) {
        return null;
    }
    $q = $pdo->prepare('SELECT * FROM registros WHERE ticket_hash = ?');
    $q->execute([hash_secreto($ticket)]);
    $fila = $q->fetch();
    return $fila ?: null;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fallo(405, 'Método no permitido');
}

$crudo = file_get_contents('php://input', false, null, 0, MAX_BODY + 1);
if ($crudo === false || strlen($crudo) > MAX_BODY) {
    fallo(413, 'Datos demasiado grandes');
}
$datos = json_decode($crudo, true);
if (!is_array($datos)) {
    fallo(400, 'Datos no válidos');
}

$accion = (string)($datos['accion'] ?? 'registrar');
$ip = ip_cliente();

try {
    $pdo = db();

    if ($accion === 'codigo') {
        $dispositivo = (string)($datos['dispositivo'] ?? '');
        if (!preg_match('/^[a-f0-9]{16,64}$/', $dispositivo)) {
            fallo(400, 'Datos no válidos');
        }
        $r = canjear_codigo($pdo, (string)($datos['codigo'] ?? ''), $dispositivo, $ip);
        responder($r['ok'] ? 200 : 403, ['ok' => $r['ok'], 'mensaje' => $r['mensaje'], 'restan' => $r['restan']]);
    }

    if ($accion === 'estado') {
        $reg = registro_por_ticket($pdo, (string)($datos['ticket'] ?? ''));
        if ($reg === null) {
            fallo(404, 'No encontramos tu registro. Vuelve a ponerlo');
        }
        responder(200, ['estado' => $reg['confirmado_utc'] !== null ? 'listo' : 'pendiente']);
    }

    if ($accion === 'reenviar') {
        $reg = registro_por_ticket($pdo, (string)($datos['ticket'] ?? ''));
        if ($reg === null) {
            fallo(404, 'No encontramos tu registro. Vuelve a ponerlo');
        }
        if ($reg['confirmado_utc'] !== null) {
            responder(200, ['estado' => 'listo']);
        }
        $motivo = motivo_sin_envio($pdo, (int)$reg['id'], $ip);
        if ($motivo !== null) {
            fallo(429, $motivo);
        }
        if (!mandar_confirmacion($pdo, (int)$reg['id'], (string)$reg['contacto'], $ip)) {
            fallo(500, 'No hemos podido enviar el correo. Inténtalo otra vez');
        }
        responder(200, ['estado' => 'pendiente']);
    }

    if ($accion !== 'registrar') {
        fallo(400, 'Datos no válidos');
    }

    // campo trampa para robots: una persona no lo rellena
    if (!empty($datos['web'])) {
        responder(200, ['estado' => 'pendiente', 'ticket' => secreto(16)]);
    }

    if (($datos['acepto'] ?? false) !== true || ($datos['version'] ?? '') !== CONSENT_VERSION) {
        fallo(400, 'Tienes que aceptar la publicidad para jugar');
    }

    $mail = normalizar_contacto('email', (string)($datos['contacto'] ?? ''));
    if ($mail === null) {
        fallo(400, 'Ese correo no parece válido');
    }
    $correo = $mail[1];

    $telefono = null;
    $telefonoCrudo = trim((string)($datos['telefono'] ?? ''));
    if ($telefonoCrudo !== '') {
        $tel = normalizar_contacto('telefono', $telefonoCrudo);
        if ($tel === null) {
            fallo(400, 'Ese teléfono no parece válido (déjalo en blanco si no quieres ponerlo)');
        }
        $telefono = $tel[1];
    }

    limpiar_sin_confirmar($pdo);

    $recientes = $pdo->prepare('SELECT COUNT(*) FROM consentimientos WHERE ip = ? AND fecha_utc > ?');
    $recientes->execute([$ip, gmdate('Y-m-d H:i:s', time() - 3600)]);
    if ((int)$recientes->fetchColumn() >= MAX_PER_IP_HOUR) {
        fallo(429, 'Demasiados intentos desde tu conexión. Prueba más tarde');
    }

    $utc = ahora_utc();
    $local = ahora_local();
    $ticket = secreto(16);

    $pdo->beginTransaction();
    $buscar = $pdo->prepare('SELECT * FROM registros WHERE contacto = ?');
    $buscar->execute([$correo]);
    $reg = $buscar->fetch();

    if ($reg && $reg['confirmado_utc'] !== null && $reg['baja_utc'] === null) {
        // ya confirmado: entra sin tocar nada de lo que tiene guardado
        $pdo->prepare('UPDATE registros SET ultimo_acceso_utc = ?, accesos = accesos + 1 WHERE id = ?')->execute([$utc, $reg['id']]);
        $pdo->commit();
        responder(200, ['estado' => 'listo']);
    }

    if (!$reg) {
        $nuevo = $pdo->prepare('INSERT INTO registros (tipo, contacto, telefono, creado_utc, creado_local, ultimo_acceso_utc, ticket_hash) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $nuevo->execute(['email', $correo, $telefono, $utc, $local, $utc, hash_secreto($ticket)]);
        $id = (int)$pdo->lastInsertId();
    } else {
        $id = (int)$reg['id'];
        // si estaba de baja y vuelve, tiene que confirmar otra vez
        $pdo->prepare('UPDATE registros SET ultimo_acceso_utc = ?, accesos = accesos + 1, confirmado_utc = NULL,
                telefono = COALESCE(?, telefono), ticket_hash = ? WHERE id = ?')
            ->execute([$utc, $telefono, hash_secreto($ticket), $id]);
    }

    $prueba = $pdo->prepare('INSERT INTO consentimientos (registro_id, fecha_utc, fecha_local, version, texto, ip, ip_directa, user_agent, pagina)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $prueba->execute([
        $id, $utc, $local, CONSENT_VERSION, CONSENT_TEXTS[CONSENT_VERSION], $ip,
        (string)($_SERVER['REMOTE_ADDR'] ?? ''), user_agent(),
        substr((string)($_SERVER['HTTP_REFERER'] ?? ''), 0, 200),
    ]);
    $pdo->commit();

    $aviso = '';
    $motivo = motivo_sin_envio($pdo, $id, $ip);
    if ($motivo !== null) {
        $aviso = $motivo;
    } elseif (!mandar_confirmacion($pdo, $id, $correo, $ip)) {
        fallo(500, 'No hemos podido enviar el correo. Inténtalo otra vez');
    }
    responder(200, ['estado' => 'pendiente', 'ticket' => $ticket, 'mensaje' => $aviso]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('registro.php: ' . $e->getMessage());
    fallo(500, 'No hemos podido guardar tu registro. Inténtalo otra vez');
}
