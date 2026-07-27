/* ============================================================
   Queenie — 3D Interactive Glowing / Pulsating Orb
   Three.js fluid sphere with audio-reactive shader (simplex noise
   displacement + fresnel glow). Reacts to mic level & AI speech.
   Graceful CSS fallback if WebGL/Three.js unavailable.
   ============================================================ */
(function () {
  const QueenieOrb = {};
  let renderer, scene, camera, orb, glow, core, points;
  let uniforms, glowUniforms, clock;
  let analyser = null, freqData = null, binCount = 0;
  let micActive = false, speaking = false, speakingEnv = 1;
  let level = 0;
  let drag = { active: false, x: 0, y: 0, rx: 0, ry: 0, vx: 0, vy: 0 };
  let hover = 0;

  const VERT = `
    uniform float uTime;
    uniform float uAudio;
    uniform float uHover;
    varying vec3 vNormal;
    varying vec3 vView;
    varying float vDisp;

    // --- Ashima simplex noise 3D ---
    vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
    float snoise(vec3 v){
      const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
      vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
      vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
      vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
      i=mod289(i);
      vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
      float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
      vec4 j=p-49.0*floor(p*ns.z*ns.z);
      vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
      vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
      vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
      vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
      vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
      vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
      vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
      p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
      vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
      return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
    }

    void main(){
      float n1 = snoise(normal * 1.6 + uTime * 0.45);
      float n2 = snoise(normal * 3.2 - uTime * 0.7);
      float disp = (n1 * 0.5 + n2 * 0.28) * (0.16 + uAudio * 0.85 + uHover * 0.25);
      vDisp = disp;
      vec3 pos = position + normal * disp;
      vNormal = normalize(normalMatrix * normal);
      vec4 mv = modelViewMatrix * vec4(pos, 1.0);
      vView = -mv.xyz;
      gl_Position = projectionMatrix * mv;
    }
  `;

  const FRAG = `
    uniform float uAudio;
    uniform float uHover;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    varying vec3 vNormal;
    varying vec3 vView;
    varying float vDisp;
    void main(){
      vec3 n = normalize(vNormal);
      vec3 v = normalize(vView);
      float fres = pow(1.0 - max(dot(n, v), 0.0), 2.4);
      vec3 base = mix(uColorA, uColorB, clamp(vDisp * 2.2 + 0.5, 0.0, 1.0));
      vec3 col = base + fres * uColorB * (1.4 + uAudio * 2.2 + uHover * 0.6);
      col += uColorA * uAudio * 0.5;
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  const GLOW_VERT = `
    varying vec3 vNormal; varying vec3 vView;
    void main(){
      vNormal = normalize(normalMatrix * normal);
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vView = -mv.xyz;
      gl_Position = projectionMatrix * mv;
    }
  `;
  const GLOW_FRAG = `
    uniform float uAudio; uniform vec3 uColor;
    varying vec3 vNormal; varying vec3 vView;
    void main(){
      vec3 n = normalize(vNormal); vec3 v = normalize(vView);
      float f = pow(1.0 - max(dot(n, v), 0.0), 3.0);
      float a = f * (0.45 + uAudio * 1.4);
      gl_FragColor = vec4(uColor, a);
    }
  `;

  QueenieOrb.init = function (canvas) {
    if (typeof THREE === "undefined") return false;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (e) {
      return false;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 4.2;

    clock = new THREE.Clock();
    uniforms = {
      uTime: { value: 0 },
      uAudio: { value: 0 },
      uHover: { value: 0 },
      uColorA: { value: new THREE.Color(0xff2d95) },
      uColorB: { value: new THREE.Color(0xa855f7) },
    };

    const geo = new THREE.IcosahedronGeometry(1.25, 32);
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, uniforms,
    });
    orb = new THREE.Mesh(geo, mat);
    scene.add(orb);

    // bright core
    core = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xff6fd8, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending })
    );
    scene.add(core);

    // outer glow shell
    glowUniforms = { uAudio: { value: 0 }, uColor: { value: new THREE.Color(0xff4fd8) } };
    glow = new THREE.Mesh(
      new THREE.SphereGeometry(1.7, 48, 48),
      new THREE.ShaderMaterial({
        vertexShader: GLOW_VERT, fragmentShader: GLOW_FRAG, uniforms: glowUniforms,
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.FrontSide,
      })
    );
    scene.add(glow);

    // particle starfield
    const N = 600, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 2.4 + Math.random() * 3.2;
      const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      pos[i * 3 + 2] = r * Math.cos(ph);
    }
    const pgeo = new THREE.BufferGeometry();
    pgeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    points = new THREE.Points(pgeo, new THREE.PointsMaterial({
      color: 0xc77dff, size: 0.035, transparent: true, opacity: 0.7,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    }));
    scene.add(points);

    // interaction
    canvas.addEventListener("pointerdown", (e) => { drag.active = true; drag.x = e.clientX; drag.y = e.clientY; });
    window.addEventListener("pointerup", () => { drag.active = false; });
    window.addEventListener("pointermove", (e) => {
      if (!drag.active) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.ry += dx * 0.005; drag.rx += dy * 0.005;
      drag.x = e.clientX; drag.y = e.clientY;
    });
    canvas.addEventListener("pointerenter", () => (hover = 1));
    canvas.addEventListener("pointerleave", () => (hover = 0));

    window.addEventListener("resize", QueenieOrb.resize);
    document.body.classList.add("webgl-ok");
    animate();
    return true;
  };

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    let target = 0;
    if (micActive && analyser) {
      analyser.getByteFrequencyData(freqData);
      let sum = 0; for (let i = 0; i < binCount; i++) sum += freqData[i];
      target = Math.min(1, (sum / binCount / 255) * 2.0);
    } else if (speaking) {
      speakingEnv *= 0.95;
      target = 0.32 + 0.42 * Math.abs(Math.sin(t * 9)) * (0.4 + speakingEnv) + 0.22 * speakingEnv;
    } else {
      target = 0.06 + 0.04 * Math.sin(t * 1.4);
    }
    level += (target - level) * 0.12;

    uniforms.uTime.value = t;
    uniforms.uAudio.value = level;
    uniforms.uHover.value += (hover - uniforms.uHover.value) * 0.06;
    glowUniforms.uAudio.value = level;

    if (!drag.active) { drag.ry += 0.0016; drag.rx += (0 - drag.rx) * 0.02; }
    orb.rotation.y = drag.ry; orb.rotation.x = drag.rx;
    glow.rotation.copy(orb.rotation);
    core.scale.setScalar(1 + level * 0.25);
    points.rotation.y += 0.0004;

    renderer.render(scene, camera);
  }

  QueenieOrb.setMicAnalyser = function (an) {
    analyser = an;
    freqData = an ? new Uint8Array(an.frequencyBinCount) : null;
    binCount = an ? an.frequencyBinCount : 0;
  };
  QueenieOrb.setMicActive = function (v) { micActive = v; };
  QueenieOrb.setSpeaking = function (v) { speaking = v; };
  QueenieOrb.pulse = function () { speakingEnv = 1; };
  QueenieOrb.resize = function () {
    if (!renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  window.QueenieOrb = QueenieOrb;
})();
