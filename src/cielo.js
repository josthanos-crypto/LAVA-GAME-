import * as THREE from 'three';

/**
 * El cielo de verdad que pidió José Manuel: el disco del sol se ve de día, de noche
 * sale la luna con todas sus fases (nueva, crecientes, llena, menguantes: cambia cada
 * día de juego), y de vez en cuando llueve, con sus gotas y el cielo gris. Las
 * estrellas y las nubes ya las ponen realism.js y dayNight.js; esto las completa.
 * Con ?lluvia en la dirección llueve siempre (para probar).
 */

const smooth = THREE.MathUtils.smoothstep;

function canvas(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return { canvas: c, tex: t };
}

const RAIN_N = 650, RAIN_TOP = 26, RAIN_R = 34, DROP = 0.95;

export class Cielo {
  constructor(scene, forceRain = false) {
    this.scene = scene;
    this.forceRain = forceRain;
    this.rain = 0;
    this.moonPhase = -1;

    // --- el disco del sol ---
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff3cf, transparent: true, opacity: 0, fog: false, depthWrite: false });
    sunMat.userData.terrain = 'none';
    this.sunDisc = new THREE.Mesh(new THREE.CircleGeometry(52, 24), sunMat);
    this.sunDisc.renderOrder = -19;
    this.sunDisc.frustumCulled = false;
    scene.add(this.sunDisc);

    // --- la luna, con su cara pintada y la sombra de la fase ---
    this.moon = canvas(128, 128, () => {});
    const moonMat = new THREE.MeshBasicMaterial({ map: this.moon.tex, transparent: true, opacity: 0, fog: false, depthWrite: false });
    moonMat.userData.terrain = 'none';
    this.moonMesh = new THREE.Mesh(new THREE.PlaneGeometry(95, 95), moonMat);
    this.moonMesh.renderOrder = -18;
    this.moonMesh.frustumCulled = false;
    this.moonDir = new THREE.Vector3(-0.35, 0.82, 0.45).normalize();
    scene.add(this.moonMesh);

    // --- la lluvia: rayitas que caen alrededor de la cámara ---
    this.drops = [];
    const pos = new Float32Array(RAIN_N * 2 * 3);
    for (let i = 0; i < RAIN_N; i++) {
      this.drops.push({
        x: (Math.random() - 0.5) * RAIN_R * 2,
        z: (Math.random() - 0.5) * RAIN_R * 2,
        y: Math.random() * RAIN_TOP,
        v: 19 + Math.random() * 7,
      });
    }
    this.rainGeo = new THREE.BufferGeometry();
    this.rainGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const rainMat = new THREE.LineBasicMaterial({ color: 0xbfcdd8, transparent: true, opacity: 0 });
    rainMat.userData.terrain = 'none';
    this.rainMesh = new THREE.LineSegments(this.rainGeo, rainMat);
    this.rainMesh.frustumCulled = false;
    this.rainMesh.visible = false;
    scene.add(this.rainMesh);
  }

  /** la cara de la luna con la sombra de la fase p (0 nueva … 0,5 llena … 1 nueva) */
  drawMoon(p) {
    const g = this.moon.canvas.getContext('2d'), w = 128, r = 56;
    g.clearRect(0, 0, w, w);
    g.fillStyle = '#e3ddd0';
    g.beginPath(); g.arc(64, 64, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#c8c0b1';
    for (const [x, y, cr] of [[48, 50, 10], [82, 72, 13], [60, 92, 7], [90, 40, 6], [40, 78, 5]]) {
      g.beginPath(); g.arc(x, y, cr, 0, Math.PI * 2); g.fill();
    }
    // la sombra: un círculo que entra por un lado u otro según crezca o mengüe
    const dx = p < 0.5 ? -4 * r * p : 4 * r * (1 - p);
    g.globalCompositeOperation = 'destination-out';
    g.beginPath(); g.arc(64 + dx, 64, r * 1.03, 0, Math.PI * 2); g.fill();
    g.globalCompositeOperation = 'source-over';
    this.moon.tex.needsUpdate = true;
  }

  /** llueve a ratos: tramos de 3 horas sorteados con el día y la hora */
  rainTarget(gameMinutes, day) {
    if (this.forceRain) return 1;
    const slot = Math.floor(gameMinutes / 180) + day * 8;
    const r = Math.abs(Math.sin(slot * 127.1 + 311.7) * 43758.5453) % 1;
    return r > 0.8 ? Math.min(1, (r - 0.8) / 0.12) : 0;
  }

  /** se llama cada fotograma tras dayNight.update; devuelve cuánto llueve (0–1) */
  update(dt, gameMinutes, day, camPos, sunDir, night) {
    // el sol
    this.sunDisc.position.set(camPos.x + sunDir.x * 1500, camPos.y + sunDir.y * 1500, camPos.z + sunDir.z * 1500);
    this.sunDisc.lookAt(camPos);
    this.sunDisc.material.opacity = smooth(sunDir.y, 0.0, 0.09) * (1 - night) * (1 - this.rain * 0.85);

    // la luna y su fase (cada día de juego avanza: 8 días, ciclo entero)
    const phase = (day % 8) / 8;   // día 0 nueva, 2 creciente, 4 llena, 6 menguante
    if (phase !== this.moonPhase) { this.moonPhase = phase; this.drawMoon(phase); }
    this.moonMesh.position.set(camPos.x + this.moonDir.x * 1500, camPos.y + this.moonDir.y * 1500, camPos.z + this.moonDir.z * 1500);
    this.moonMesh.lookAt(camPos);
    this.moonMesh.material.opacity = smooth(night, 0.55, 0.95) * (1 - this.rain * 0.8);

    // la lluvia
    const target = this.rainTarget(gameMinutes, day);
    this.rain += (target - this.rain) * Math.min(1, dt * 0.6);
    if (this.rain > 0.02) {
      this.rainMesh.visible = true;
      this.rainMesh.position.set(camPos.x, Math.max(0, camPos.y - 8), camPos.z);
      const a = this.rainGeo.getAttribute('position');
      for (let i = 0; i < RAIN_N; i++) {
        const d = this.drops[i];
        d.y -= d.v * dt;
        if (d.y < 0) {
          d.y = RAIN_TOP;
          d.x = (Math.random() - 0.5) * RAIN_R * 2;
          d.z = (Math.random() - 0.5) * RAIN_R * 2;
        }
        a.setXYZ(i * 2, d.x, d.y, d.z);
        a.setXYZ(i * 2 + 1, d.x + 0.06, d.y + DROP, d.z);
      }
      a.needsUpdate = true;
      this.rainMesh.material.opacity = 0.5 * this.rain;
    } else {
      this.rainMesh.visible = false;
    }
    return this.rain;
  }
}
