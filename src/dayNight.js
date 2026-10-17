import * as THREE from 'three';
import { windowGlow } from './realism.js';

const DEG = Math.PI / 180;
const smooth = THREE.MathUtils.smoothstep;
const lerp = THREE.MathUtils.lerp;

/**
 * Ciclo día/noche canario con sol real: el sol sale por el este (~7:00),
 * culmina al sur y se pone por el oeste (~19:45). El cielo físico, la niebla,
 * las nubes, los reflejos y las luces de la ciudad se derivan de su altura.
 * gameMinutes: 0–1439 (minutos del día).
 */
export class DayNight {
  constructor({ scene, sun, hemi, fill, sky, stars, clouds, renderer, streetHeadMat, cloudsMat }) {
    this.scene = scene;
    this.sun = sun;
    this.hemi = hemi;
    this.fill = fill;
    this.sky = sky;
    this.stars = stars;
    this.clouds = clouds;
    this.renderer = renderer;
    this.streetHeadMat = streetHeadMat;
    this.cloudsMat = cloudsMat;
    this.night = 0; // 0 día … 1 noche cerrada
    this.allowShadows = true;
    this.sunDir = new THREE.Vector3(0, 1, 0);
    this._c = new THREE.Color();
    this._c2 = new THREE.Color();
  }

  /** dirección del sol (x = este, z = sur, y = arriba) y elevación en grados */
  static sunAt(mins, out = new THREE.Vector3()) {
    const h = mins / 60;
    const t = (h - 7.0) / 12.75;              // 0 al alba, 1 al ocaso
    const elevDeg = Math.sin(t * Math.PI) * 72 - (t < 0 || t > 1 ? 12 : 0);
    const e = THREE.MathUtils.clamp(elevDeg, -25, 80) * DEG;
    const az = THREE.MathUtils.clamp(t, -0.15, 1.15) * Math.PI;
    out.set(Math.cos(az) * Math.cos(e), Math.sin(e), Math.sin(az) * Math.cos(e) * 0.55).normalize();
    return { dir: out, elevDeg: Math.asin(out.y) / DEG };
  }

  static nightFromMinutes(mins) {
    const { elevDeg } = DayNight.sunAt(mins);
    return 1 - smooth(elevDeg, -9, 4);
  }

  update(gameMinutes, playerX = 0, playerZ = 0) {
    const { dir, elevDeg } = DayNight.sunAt(gameMinutes, this.sunDir);
    const night = 1 - smooth(elevDeg, -9, 4);
    const golden = 1 - smooth(elevDeg, 2, 22);   // luz dorada cerca del horizonte
    this.night = night;

    // --- cielo físico ---
    const u = this.sky.material.uniforms;
    u.sunPosition.value.copy(dir);
    u.turbidity.value = lerp(3.0, 7.5, golden);  // más calima al atardecer
    u.rayleigh.value = lerp(1.25, 2.6, golden);
    u.mieCoefficient.value = lerp(0.004, 0.009, golden);

    // --- sol / luna ---
    // de noche la misma luz hace de luna: alta, fría y tenue
    const lightDir = night > 0.5
      ? new THREE.Vector3(-0.35, 0.82, 0.45).normalize()
      : new THREE.Vector3(dir.x, Math.max(dir.y, Math.sin(7 * DEG)), dir.z).normalize();
    this.sun.position.set(playerX + lightDir.x * 320, lightDir.y * 320, playerZ + lightDir.z * 320);
    this.sun.target.position.set(playerX, 0, playerZ);
    this.sun.target.updateMatrixWorld();

    const sunCol = this._c.setHex(0xfff3e2).lerp(this._c2.setHex(0xff8a3c), golden);
    const dayI = 3.1 * smooth(elevDeg, -1, 12);
    if (night > 0.5) {
      this.sun.color.setHex(0x9db4e0);
      this.sun.intensity = lerp(0.08, 0.55, (night - 0.5) * 2);
    } else {
      this.sun.color.copy(sunCol);
      this.sun.intensity = Math.max(0.05, dayI);
    }
    this.sun.castShadow = this.allowShadows && (night < 0.35 || night > 0.85);

    // --- luz de cielo ---
    this.hemi.intensity = lerp(0.4, 0.18, night);
    this.hemi.color.setHex(0xbcd8f2).lerp(this._c2.setHex(0xffb38a), golden * 0.5).lerp(this._c2.setHex(0x203458), night);
    this.hemi.groundColor.setHex(0x8a7a64).lerp(this._c2.setHex(0x0c0e12), night);
    if (this.fill) {
      this.fill.intensity = lerp(0.28, 0.05, night);
      this.fill.position.set(playerX - dir.x * 100, 40, playerZ - dir.z * 100);
      this.fill.color.setHex(night > 0.5 ? 0x304868 : 0x9fc0e6);
    }

    // --- niebla del color del horizonte ---
    if (this.scene.fog) {
      const fog = this._c.setHex(0xc9dbe6).lerp(this._c2.setHex(0xe0a77c), golden * 0.75).lerp(this._c2.setHex(0x0a1120), night);
      this.scene.fog.color.copy(fog);
      if (this.scene.fog.isFogExp2) this.scene.fog.density = lerp(0.00042, 0.0009, Math.max(golden * 0.6, night * 0.8));
    }

    // exposición: de noche se abre un poco para leer la ciudad iluminada
    this.renderer.toneMappingExposure = lerp(0.62, 1.1, night) + golden * (1 - night) * 0.22;

    // --- farolas, ventanas y rótulos ---
    const lampsOn = smooth(night, 0.3, 0.65);
    if (this.streetHeadMat) {
      this.streetHeadMat.emissive.setHex(0xffd9a0);
      this.streetHeadMat.emissiveIntensity = lampsOn * 6;
      this.streetHeadMat.color.setHex(lampsOn > 0.2 ? 0xfff0c8 : 0x2e3338);
    }
    windowGlow.value = smooth(night, 0.25, 0.8) * 0.55;

    // --- estrellas y nubes ---
    if (this.stars) {
      this.stars.material.uniforms.opacity.value = smooth(night, 0.7, 1);
    }
    if (this.cloudsMat?.uniforms) {
      const cu = this.cloudsMat.uniforms;
      cu.sunDir.value.copy(dir);
      cu.sunCol.value.setHex(0xfffaf0).lerp(this._c2.setHex(0xff9a5a), golden);
      cu.ambCol.value.setHex(0xb4c4d6).lerp(this._c2.setHex(0xa07888), golden * 0.6);
      cu.night.value = night;
    }

    return night;
  }

  label(mins) {
    const h = Math.floor(mins / 60);
    if (h >= 6 && h < 8) return 'Amanecer';
    if (h >= 8 && h < 12) return 'Mañana';
    if (h >= 12 && h < 17) return 'Tarde';
    if (h >= 17 && h < 20) return 'Atardecer';
    if (h >= 20 || h < 6) return 'Noche';
    return '';
  }
}
