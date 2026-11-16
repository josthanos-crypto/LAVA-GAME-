<?php
declare(strict_types=1);

require __DIR__ . '/datos/lib.php';

header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');

const PAGE_ROWS = 500;

function h(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function celda_csv(string $v): string
{
    return ($v !== '' && strpos('=-@', $v[0]) !== false) ? "'" . $v : $v;
}

function enviar_csv(string $nombre, array $cabecera, array $filas)
{
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $nombre . '"');
    $f = fopen('php://output', 'w');
    fwrite($f, "\xEF\xBB\xBF");
    fputcsv($f, $cabecera, ';');
    foreach ($filas as $fila) {
        fputcsv($f, array_map(static fn($v) => celda_csv((string)$v), $fila), ';');
    }
    fclose($f);
    exit;
}

function entero(string $campo, int $min, int $max, int $defecto): int
{
    $v = (int)($_POST[$campo] ?? $defecto);
    return max($min, min($max, $v));
}

$config = require __DIR__ . '/datos/config.php';
$clave = (string)($_POST['clave'] ?? '');
$autenticado = $clave !== '' && hash_equals((string)$config['clave'], $clave);

if (!$autenticado) {
    if ($clave !== '') {
        sleep(2);
    }
    ?><!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Registros · Lava Game</title>
<style>body{font-family:system-ui,sans-serif;background:#170a05;color:#f3e6d8;display:grid;place-items:center;min-height:100vh;margin:0}
form{background:#2a1409;padding:28px;border-radius:14px;width:min(360px,90vw)}
input,button{font:inherit;padding:10px 12px;border-radius:8px;border:1px solid #ff9a1f;width:100%;box-sizing:border-box;margin-top:10px}
button{background:#ff6a12;color:#1a0a03;font-weight:700;cursor:pointer}.e{color:#ff9d8a;margin-top:10px}</style></head>
<body><form method="post"><h2>Registros de Lava Game</h2>
<label>Clave<input type="password" name="clave" autofocus autocomplete="current-password"></label>
<?php if ($clave !== '') { ?><div class="e">Clave incorrecta</div><?php } ?>
<button>Entrar</button></form></body></html>
<?php
    exit;
}

$pdo = db();
$accion = (string)($_POST['accion'] ?? '');
$id = (int)($_POST['id'] ?? 0);
$aviso = '';
$nuevosCodigos = [];

if ($accion === 'baja' && $id > 0) {
    $pdo->prepare('UPDATE registros SET baja_utc = ? WHERE id = ? AND baja_utc IS NULL')->execute([ahora_utc(), $id]);
    $aviso = 'Marcado como baja: ya no debes mandarle publicidad.';
} elseif ($accion === 'borrar' && $id > 0 && ($_POST['seguro'] ?? '') === '1') {
    $pdo->prepare('DELETE FROM registros WHERE id = ?')->execute([$id]);
    $aviso = 'Registro borrado del todo (incluida la prueba de consentimiento).';
} elseif ($accion === 'crear_codigos') {
    $cantidad = entero('cantidad', 1, 20, 1);
    $minutos = entero('minutos', 5, 1440, 120);
    $usos = entero('usos', 1, 500, 1);
    $nota = mb_substr(trim((string)($_POST['nota'] ?? '')), 0, 100);
    $nuevo = $pdo->prepare('INSERT INTO invitaciones (codigo, nota, minutos, max_usos, creado_utc, creado_local) VALUES (?, ?, ?, ?, ?, ?)');
    for ($i = 0; $i < $cantidad; $i++) {
        $codigo = generar_codigo();
        $nuevo->execute([$codigo, $nota, $minutos, $usos, ahora_utc(), ahora_local()]);
        $nuevosCodigos[] = $codigo;
    }
    $aviso = $cantidad === 1 ? 'Código creado:' : 'Códigos creados:';
} elseif ($accion === 'borrar_codigo' && $id > 0) {
    $pdo->prepare('DELETE FROM invitaciones WHERE id = ?')->execute([$id]);
    $aviso = 'Código borrado: ya no vale para nadie.';
} elseif ($accion === 'csv') {
    $filas = $pdo->query("SELECT r.id, r.contacto, COALESCE(r.telefono, ''), r.creado_local,
            COALESCE(r.confirmado_utc, ''),
            CASE WHEN r.baja_utc IS NOT NULL THEN 'BAJA' WHEN r.confirmado_utc IS NULL THEN 'PENDIENTE DE CONFIRMAR' ELSE 'ACEPTA PUBLICIDAD' END,
            COALESCE(r.baja_utc, ''), r.accesos
        FROM registros r ORDER BY r.id")->fetchAll(PDO::FETCH_NUM);
    enviar_csv('registros-lava-game.csv', ['id', 'correo', 'telefono', 'alta (hora Canarias)', 'confirmado (UTC)', 'estado', 'baja (UTC)', 'veces'], $filas);
} elseif ($accion === 'csv_pruebas') {
    $filas = $pdo->query("SELECT r.id, r.contacto, 'ACEPTA (casilla)', c.fecha_local, c.fecha_utc, c.version, c.texto, c.ip, c.ip_directa, c.user_agent, c.pagina
            FROM consentimientos c JOIN registros r ON r.id = c.registro_id
        UNION ALL
        SELECT r.id, r.contacto, 'CONFIRMA (enlace del correo)', f.fecha_local, f.fecha_utc, '', '', f.ip, '', f.user_agent, ''
            FROM confirmaciones f JOIN registros r ON r.id = f.registro_id
        ORDER BY 5, 1")->fetchAll(PDO::FETCH_NUM);
    enviar_csv('pruebas-consentimiento-lava-game.csv',
        ['id', 'correo', 'que paso', 'fecha (hora Canarias)', 'fecha (UTC)', 'version', 'texto aceptado', 'ip', 'ip directa', 'navegador', 'pagina'], $filas);
}

$ahora = ahora_utc();
$total = (int)$pdo->query('SELECT COUNT(*) FROM registros')->fetchColumn();
$confirmados = (int)$pdo->query('SELECT COUNT(*) FROM registros WHERE confirmado_utc IS NOT NULL AND baja_utc IS NULL')->fetchColumn();
$bajas = (int)$pdo->query('SELECT COUNT(*) FROM registros WHERE baja_utc IS NOT NULL')->fetchColumn();
$pendientes = $total - $confirmados - $bajas;
$enCurso = (int)$pdo->query("SELECT COUNT(*) FROM canjes WHERE fin_utc > '" . $ahora . "'")->fetchColumn();
$filas = $pdo->query('SELECT r.*, (SELECT COUNT(*) FROM consentimientos WHERE registro_id = r.id) AS pruebas
    FROM registros r ORDER BY r.id DESC LIMIT ' . PAGE_ROWS)->fetchAll();
$codigos = $pdo->query("SELECT i.*, (SELECT COUNT(*) FROM canjes WHERE invitacion_id = i.id) AS usados,
        (SELECT COUNT(*) FROM canjes WHERE invitacion_id = i.id AND fin_utc > '" . $ahora . "') AS en_curso
    FROM invitaciones i ORDER BY i.id DESC LIMIT 200")->fetchAll();
$campoClave = '<input type="hidden" name="clave" value="' . h($clave) . '">';
?><!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Registros · Lava Game</title>
<style>
body{font-family:system-ui,sans-serif;background:#170a05;color:#f3e6d8;margin:0;padding:18px}
h1{margin:0 0 12px}h2{color:#ffb340;margin:28px 0 10px}.cards{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px}
.card{background:#2a1409;border-radius:12px;padding:12px 18px}.card b{display:block;font-size:26px;color:#ffb340}
.bar{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}
button{font:inherit;padding:8px 14px;border-radius:8px;border:1px solid #ff9a1f;background:#ff6a12;color:#1a0a03;font-weight:700;cursor:pointer}
button.s{background:transparent;color:#f3e6d8;font-weight:500;padding:4px 10px}
input[type=text],input[type=number]{font:inherit;padding:8px 10px;border-radius:8px;border:1px solid #ff9a1f;background:#0e0502;color:#fff}
.nuevo label{display:inline-block;margin:0 12px 10px 0;font-size:13px;color:#cbb}.nuevo label input{display:block;margin-top:4px}
.ok{background:#12351f;border-radius:8px;padding:10px 14px;margin-bottom:12px}.ok code{display:block;margin-top:6px;user-select:all;font-size:15px}
.wrap{overflow-x:auto}table{border-collapse:collapse;width:100%;min-width:760px}
th,td{padding:8px 10px;border-bottom:1px solid #3d2112;text-align:left;font-size:14px}th{color:#ffb340}
.baja{color:#ff9d8a}.si{color:#7be39a}.pen{color:#ffd37a}form{display:inline}small{color:#a99}
</style></head><body>
<h1>Registros de Lava Game</h1>
<?php if ($aviso !== '') { ?>
<div class="ok"><?= h($aviso) ?>
<?php foreach ($nuevosCodigos as $c) { ?>
  <code><?= h(formatear_codigo($c)) ?> &nbsp;·&nbsp; <?= h(BASE_URL . '?codigo=' . formatear_codigo($c)) ?></code>
<?php } ?>
</div>
<?php } ?>
<div class="cards">
  <div class="card"><b><?= $total ?></b>registrados</div>
  <div class="card"><b><?= $confirmados ?></b>confirmados (aceptan publicidad)</div>
  <div class="card"><b><?= $pendientes ?></b>sin confirmar el correo</div>
  <div class="card"><b><?= $bajas ?></b>de baja</div>
  <div class="card"><b><?= $enCurso ?></b>invitados jugando ahora</div>
</div>
<div class="bar">
  <form method="post"><?= $campoClave ?><input type="hidden" name="accion" value="csv"><button>Descargar lista (Excel)</button></form>
  <form method="post"><?= $campoClave ?><input type="hidden" name="accion" value="csv_pruebas"><button>Descargar pruebas de consentimiento</button></form>
</div>

<h2>Códigos de invitación</h2>
<form method="post" class="nuevo"><?= $campoClave ?><input type="hidden" name="accion" value="crear_codigos">
  <label>Para quién (nota)<input type="text" name="nota" maxlength="100" placeholder="Ej.: Pepe de la gestoría"></label>
  <label>Minutos de juego<input type="number" name="minutos" value="120" min="5" max="1440"></label>
  <label>Personas que pueden usarlo<input type="number" name="usos" value="1" min="1" max="500"></label>
  <label>Cuántos códigos<input type="number" name="cantidad" value="1" min="1" max="20"></label>
  <button>Crear código</button>
</form>
<div class="wrap"><table>
<tr><th>Código</th><th>Nota</th><th>Tiempo</th><th>Usos</th><th>Ahora</th><th>Creado</th><th></th></tr>
<?php foreach ($codigos as $c) { ?>
<tr>
  <td><b><?= h(formatear_codigo($c['codigo'])) ?></b></td>
  <td><?= h($c['nota']) ?></td>
  <td><?= (int)$c['minutos'] ?> min</td>
  <td><?= (int)$c['usados'] ?> / <?= (int)$c['max_usos'] ?></td>
  <td><?= (int)$c['en_curso'] > 0 ? 'Jugando' : ((int)$c['usados'] > 0 ? 'Usado' : 'Sin usar') ?></td>
  <td><?= h($c['creado_local']) ?></td>
  <td><form method="post" onsubmit="return confirm('¿Borrar este código? Dejará de valer para quien lo tenga.')"><?= $campoClave ?><input type="hidden" name="accion" value="borrar_codigo"><input type="hidden" name="id" value="<?= (int)$c['id'] ?>"><button class="s">Borrar</button></form></td>
</tr>
<?php } ?>
</table></div>

<h2>Registrados</h2>
<div class="wrap"><table>
<tr><th>Alta</th><th>Correo</th><th>Teléfono</th><th>Estado</th><th>Veces</th><th></th></tr>
<?php foreach ($filas as $r) {
    if ($r['baja_utc'] !== null) {
        $estado = '<span class="baja">Baja ' . h(substr((string)$r['baja_utc'], 0, 10)) . '</span>';
    } elseif ($r['confirmado_utc'] === null) {
        $estado = '<span class="pen">Sin confirmar el correo</span>';
    } else {
        $estado = '<span class="si">Confirmado ' . h(substr((string)$r['confirmado_utc'], 0, 10)) . '</span>';
    } ?>
<tr>
  <td><?= h($r['creado_local']) ?></td>
  <td><?= h($r['contacto']) ?></td>
  <td><?= h((string)($r['telefono'] ?? '')) ?></td>
  <td><?= $estado ?></td>
  <td><?= (int)$r['accesos'] ?> <small>(<?= (int)$r['pruebas'] ?> pruebas)</small></td>
  <td>
    <?php if ($r['baja_utc'] === null) { ?>
    <form method="post"><?= $campoClave ?><input type="hidden" name="accion" value="baja"><input type="hidden" name="id" value="<?= (int)$r['id'] ?>"><button class="s">Dar de baja</button></form>
    <?php } ?>
    <form method="post" onsubmit="return confirm('¿Borrar este registro del todo? No se puede deshacer.')"><?= $campoClave ?><input type="hidden" name="accion" value="borrar"><input type="hidden" name="seguro" value="1"><input type="hidden" name="id" value="<?= (int)$r['id'] ?>"><button class="s">Borrar</button></form>
  </td>
</tr>
<?php } ?>
</table></div>
<?php if ($total > PAGE_ROWS) { ?><p><small>Se muestran los últimos <?= PAGE_ROWS ?>. La descarga trae todos.</small></p><?php } ?>
</body></html>
