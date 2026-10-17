import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';

/**
 * Capa de realismo: cielo físico (dispersión atmosférica), estrellas, nubes
 * volumétricas falsas, reflejos del entorno sacados del propio cielo y
 * posproceso cinematográfico (oclusión ambiental, bloom, etalonaje, SMAA).
 */

// Uniform compartido: cuánto brillan las ventanas por la noche (0–1)
export const windowGlow = { value: 0 };

/** Cielo de dispersión de Rayleigh/Mie que sigue a la cámara */
export function createSky(scene) {
  const sky = new Sky();
  sky.scale.setScalar(2500);
  const u = sky.material.uniforms;
  u.turbidity.value = 3.4;          // calima suave
  u.rayleigh.value = 1.35;
  u.mieCoefficient.value = 0.0045;
  u.mieDirectionalG.value = 0.86;
  sky.material.depthWrite = false;
  // ganancia del cielo: el shader original está pensado para exposición ~0.5 y
  // satura a blanco con la exposición del juego; así conserva el azul
  sky.material.uniforms.gain = { value: 0.55 };
  sky.material.fragmentShader = sky.material.fragmentShader
    .replace('uniform vec3 up;', 'uniform vec3 up;\nuniform float gain;')
    .replace('gl_FragColor = vec4( retColor, 1.0 );', 'gl_FragColor = vec4( retColor * gain, 1.0 );');
  sky.renderOrder = -20;
  sky.frustumCulled = false;
  scene.add(sky);
  return sky;
}

/** Estrellas: puntos en una cúpula, se encienden al caer la noche */
export function createStars(scene) {
  const N = 2200;
  const pos = new Float32Array(N * 3);
  const size = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const u = Math.random(), v = Math.random() * 0.92 + 0.08;
    const th = u * Math.PI * 2, y = v;
    const r = Math.sqrt(1 - y * y);
    pos[i * 3] = Math.cos(th) * r * 2000;
    pos[i * 3 + 1] = y * 2000;
    pos[i * 3 + 2] = Math.sin(th) * r * 2000;
    size[i] = Math.random() < 0.06 ? 2.6 : 1 + Math.random();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('size', new THREE.BufferAttribute(size, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: false,
    uniforms: { opacity: { value: 0 } },
    vertexShader: `
      attribute float size; varying float vS;
      void main() {
        vS = size;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * 1.4;
        gl_Position = projectionMatrix * mv;
        gl_Position.z = gl_Position.w * 0.9999;
      }`,
    fragmentShader: `
      uniform float opacity; varying float vS;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d) * opacity;
        gl_FragColor = vec4(vec3(0.85, 0.9, 1.0) * (0.7 + vS * 0.25), a);
      }`,
  });
  const pts = new THREE.Points(g, mat);
  pts.frustumCulled = false;
  pts.renderOrder = -19;
  scene.add(pts);
  return pts;
}

/** Capa de nubes con ruido fractal, iluminada por el sol */
export function createClouds(scene) {
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide,
    uniforms: {
      time: { value: 0 },
      sunDir: { value: new THREE.Vector3(0, 1, 0) },
      sunCol: { value: new THREE.Color(1, 0.95, 0.85) },
      ambCol: { value: new THREE.Color(0.75, 0.82, 0.92) },
      cover: { value: 0.42 },
      night: { value: 0 },
    },
    vertexShader: `
      varying vec3 vW;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: `
      uniform float time, cover, night; uniform vec3 sunDir, sunCol, ambCol;
      varying vec3 vW;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
        return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
      float fbm(vec2 p){ float a=0.5, s=0.0; for(int i=0;i<6;i++){ s+=a*n(p); p*=2.03; a*=0.5; } return s; }
      void main() {
        vec2 p = vW.xz * 0.0011 + vec2(time * 0.004, time * 0.0015);
        float d = fbm(p);
        float c = smoothstep(cover, cover + 0.28, d);
        // auto-sombreado: muestra desplazada hacia el sol
        float d2 = fbm(p + sunDir.xz * 0.06);
        float lit = clamp(0.55 + (d - d2) * 2.2, 0.25, 1.15);
        vec3 col = mix(ambCol, sunCol, lit);
        col = mix(col, vec3(0.06, 0.08, 0.12), night * 0.85);
        // se desvanece hacia el horizonte
        float dist = length(vW.xz - cameraPosition.xz);
        float fade = 1.0 - smoothstep(1400.0, 2300.0, dist);
        gl_FragColor = vec4(col, c * 0.92 * fade);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(5200, 5200), mat);
  mesh.rotation.x = Math.PI / 2;
  mesh.position.y = 520;
  mesh.renderOrder = -18;
  mesh.frustumCulled = false;
  scene.add(mesh);
  return mesh;
}

/** Reflejos de entorno sacados del cielo actual (se rehacen si el sol se mueve) */
export class SkyEnvironment {
  constructor(renderer, scene, sky) {
    this.renderer = renderer;
    this.scene = scene;
    this.pmrem = new THREE.PMREMGenerator(renderer);
    this.envScene = new THREE.Scene();
    this.envSky = new Sky();
    this.envSky.scale.setScalar(100);
    this.envSky.material = sky.material; // comparte uniforms con el cielo visible
    this.envScene.add(this.envSky);
    // suelo neutro para que lo de abajo no refleje cielo
    const ground = new THREE.Mesh(new THREE.CircleGeometry(60, 24),
      new THREE.MeshBasicMaterial({ color: 0x5a5248 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    this.envScene.add(ground);
    this.groundMat = ground.material;
    this.lastSun = new THREE.Vector3(9, 9, 9);
    this.rt = null;
  }

  update(sunDir, night) {
    if (sunDir.distanceTo(this.lastSun) < 0.035) return;
    this.lastSun.copy(sunDir);
    this.groundMat.color.setRGB(0.35, 0.32, 0.28).multiplyScalar(1 - night * 0.9);
    const old = this.rt;
    this.rt = this.pmrem.fromScene(this.envScene, 0, 0.1, 200);
    this.scene.environment = this.rt.texture;
    // el cielo físico emite mucha radiancia: se dosifica para no aplanar la luz del sol
    this.scene.environmentIntensity = THREE.MathUtils.lerp(0.32, 0.2, night);
    old?.dispose();
  }
}

/** Etalonaje: contraste, saturación, viñeta, aberración leve y grano */
const GradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    contrast: { value: 1.08 },
    saturation: { value: 1.06 },
    warmth: { value: 0.03 },
    vignette: { value: 0.32 },
    grain: { value: 0.035 },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float time, contrast, saturation, warmth, vignette, grain;
    varying vec2 vUv;
    float rnd(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + time) * 43758.5453); }
    void main(){
      vec2 dc = vUv - 0.5;
      float r2 = dot(dc, dc);
      // aberración cromática solo en los bordes
      vec2 off = dc * r2 * 0.012;
      vec3 c = vec3(texture2D(tDiffuse, vUv + off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - off).b);
      c = (c - 0.5) * contrast + 0.5;
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      c = mix(vec3(l), c, saturation);
      // luces cálidas, sombras ligeramente frías (look atlántico)
      c += vec3(warmth, warmth * 0.35, -warmth) * smoothstep(0.35, 1.0, l);
      c += vec3(-0.012, 0.0, 0.018) * (1.0 - smoothstep(0.0, 0.35, l));
      c *= 1.0 - vignette * smoothstep(0.08, 0.55, r2);
      c += (rnd(vUv * 731.0) - 0.5) * grain;
      gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
    }`,
};

/** Cadena de posproceso según calidad: 'full' | 'lite' | 'off' */
export class PostFX {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.mode = 'full';
    const w = innerWidth, h = innerHeight;
    this.composer = new EffectComposer(renderer);
    this.renderPass = new RenderPass(scene, camera);
    this.gtao = new GTAOPass(scene, camera, w, h);
    this.gtao.output = GTAOPass.OUTPUT.Default;
    // las fachadas son caras dobles: el pase de normales también debe verlas por ambos lados
    if (this.gtao.normalMaterial) this.gtao.normalMaterial.side = THREE.DoubleSide;
    this.gtao.blendIntensity = 1.0;
    this.aoHidden = [];
    // el pase de oclusión no debe ver el cielo, las nubes ni las hojas recortadas
    const gtaoRender = this.gtao.render.bind(this.gtao);
    this.gtao.render = (...args) => {
      const vis = this.aoHidden.map(o => o.visible);
      for (const o of this.aoHidden) o.visible = false;
      gtaoRender(...args);
      this.aoHidden.forEach((o, i) => { o.visible = vis[i]; });
    };
    this.gtao.updateGtaoMaterial({ radius: 2.2, distanceExponent: 1.2, thickness: 1.5, distanceFallOff: 1, scale: 1, samples: 12, screenSpaceRadius: false });
    this.gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
    this.bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.22, 0.55, 0.92);
    this.output = new OutputPass();
    this.grade = new ShaderPass(GradeShader);
    this.smaa = new SMAAPass(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
    for (const p of [this.renderPass, this.gtao, this.bloom, this.output, this.grade, this.smaa]) {
      this.composer.addPass(p);
    }
    addEventListener('resize', () => this.resize());
  }

  /** objetos que no deben proyectar oclusión ambiental */
  excludeFromAO(...objs) { this.aoHidden.push(...objs.filter(Boolean)); }

  setMode(mode) {
    this.mode = mode;
    this.gtao.enabled = mode === 'full';
    this.smaa.enabled = mode !== 'off';
    this.resize();
  }

  resize() {
    const w = innerWidth, h = innerHeight;
    this.composer.setPixelRatio(this.renderer.getPixelRatio());
    this.composer.setSize(w, h);
  }

  /** night 0–1 ajusta bloom y etalonaje */
  update(night, time) {
    this.bloom.strength = THREE.MathUtils.lerp(0.18, 0.5, night);
    this.bloom.threshold = THREE.MathUtils.lerp(0.95, 0.72, night);
    this.bloom.radius = THREE.MathUtils.lerp(0.45, 0.7, night);
    const u = this.grade.uniforms;
    u.time.value = time % 100;
    u.warmth.value = THREE.MathUtils.lerp(0.035, -0.01, night);
    u.saturation.value = THREE.MathUtils.lerp(1.07, 0.92, night);
    u.vignette.value = THREE.MathUtils.lerp(0.3, 0.45, night);
  }

  render() {
    if (this.mode === 'off') this.renderer.render(this.scene, this.camera);
    else this.composer.render();
  }
}

/**
 * Material de mar: dos capas de oleaje desplazándose en direcciones
 * distintas sobre el mismo mapa de normales, reflejo del cielo y
 * espuma/turquesa en aguas someras cerca de la orilla.
 */
export function oceanMaterial(normalTex) {
  normalTex.wrapS = normalTex.wrapT = THREE.RepeatWrapping;
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x0a5480,
    roughness: 0.1,
    metalness: 0.0,
    ior: 1.333,
    reflectivity: 0.4,
    clearcoat: 0.35,
    clearcoatRoughness: 0.12,
    normalMap: normalTex,
    normalScale: new THREE.Vector2(0.55, 0.55),
    envMapIntensity: 1.25,
  });
  const time = { value: 0 };
  mat.userData.time = time;
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = time;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;\nvarying vec3 vWPos;')
      .replace('#include <normal_fragment_maps>', `
        vec2 wuv = vWPos.xz;
        vec3 n1 = texture2D(normalMap, wuv * 0.031 + vec2(uTime * 0.011, uTime * 0.007)).xyz * 2.0 - 1.0;
        vec3 n2 = texture2D(normalMap, wuv * 0.0083 - vec2(uTime * 0.004, -uTime * 0.006)).xyz * 2.0 - 1.0;
        vec3 n3 = texture2D(normalMap, wuv * 0.11 + vec2(-uTime * 0.03, uTime * 0.021)).xyz * 2.0 - 1.0;
        vec3 mapN = normalize(vec3((n1.xy + n2.xy * 1.3 + n3.xy * 0.35) * normalScale, 1.0));
        normal = normalize(tbn * mapN);
      `)
;
  };
  return mat;
}
