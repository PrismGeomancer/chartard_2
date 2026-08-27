/* global THREE */
(() => {
  const chaosStyles = document.createElement('link');
  chaosStyles.rel = 'stylesheet';
  chaosStyles.href = 'chaos.css';
  document.head.appendChild(chaosStyles);
  document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(button.dataset.copy); } catch (_) {}
    const original = button.innerHTML;
    button.textContent = 'Copied ✓';
    setTimeout(() => { button.innerHTML = original; }, 1500);
  }));
  document.getElementById('year').textContent = new Date().getFullYear();
  const canvas = document.getElementById('coin-canvas');
  if (!window.THREE || !canvas) return;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 100); camera.position.set(0, 0, 7.2);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace;
  const coin = new THREE.Group(); scene.add(coin);
  const logo = new THREE.TextureLoader().load('images/logo.png'); logo.colorSpace = THREE.SRGBColorSpace;
  const edge = new THREE.Mesh(new THREE.CylinderGeometry(2.12, 2.12, .28, 80), new THREE.MeshStandardMaterial({ color: 0xff6b27, metalness: .7, roughness: .22 })); edge.rotation.x = Math.PI / 2; coin.add(edge);
  const faceGeo = new THREE.CircleGeometry(2.04, 80), faceMat = new THREE.MeshStandardMaterial({ map: logo, metalness: .22, roughness: .45 });
  const front = new THREE.Mesh(faceGeo, faceMat); front.position.z = .151; coin.add(front);
  const back = new THREE.Mesh(faceGeo, new THREE.MeshStandardMaterial({ color: 0x4377e8, metalness: .55, roughness: .3 })); back.position.z = -.151; back.rotation.y = Math.PI; coin.add(back);
  coin.add(new THREE.Mesh(new THREE.TorusGeometry(2.24, .025, 8, 80), new THREE.MeshBasicMaterial({ color: 0xffd6b8, transparent: true, opacity: .7 })));
  const halo = new THREE.Mesh(new THREE.TorusGeometry(2.82, .012, 8, 96), new THREE.MeshBasicMaterial({ color: 0xff6b27, transparent: true, opacity: .35 })); halo.rotation.x = .6; scene.add(halo);
  scene.add(new THREE.HemisphereLight(0xffc7a5, 0x151838, 2.4));
  const key = new THREE.PointLight(0xff742f, 22, 18); key.position.set(-3, 3, 4); scene.add(key);
  const rim = new THREE.PointLight(0x4377e8, 15, 15); rim.position.set(3, -2, 2); scene.add(rim);
  const sparks = new THREE.BufferGeometry(), count = 220, positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) { const radius = 2.8 + Math.random() * 2.2, a = Math.random() * Math.PI * 2, z = (Math.random() - .5) * 2; positions.set([Math.cos(a) * radius, Math.sin(a) * radius, z], i * 3); }
  sparks.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(sparks, new THREE.PointsMaterial({ color: 0xffb071, size: .035, transparent: true, opacity: .85 })); scene.add(particles);
  let pointerX = 0, pointerY = 0;
  window.addEventListener('pointermove', e => { pointerX = e.clientX / innerWidth - .5; pointerY = e.clientY / innerHeight - .5; });
  function resize() { const r = canvas.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(canvas); resize(); const clock = new THREE.Clock();
  function animate() { const t = clock.getElapsedTime(); coin.rotation.y += .007; coin.rotation.x = Math.sin(t * .7) * .12 + pointerY * .18; coin.rotation.z = Math.sin(t * .5) * .07 - pointerX * .18; coin.position.y = Math.sin(t * .9) * .16; halo.rotation.z -= .004; particles.rotation.z += .0015; particles.rotation.y = Math.sin(t * .25) * .18; renderer.render(scene, camera); requestAnimationFrame(animate); }
  animate();

  function makeSectionWorld(id, palette, useLogo) {
    const target = document.getElementById(id); if (!target) return;
    const world = new THREE.Scene(), view = new THREE.PerspectiveCamera(38, 1, .1, 100);
    view.position.z = 8;
    const draw = new THREE.WebGLRenderer({ canvas: target, alpha: true, antialias: true });
    draw.setPixelRatio(Math.min(devicePixelRatio, 1.5)); draw.outputColorSpace = THREE.SRGBColorSpace;
    world.add(new THREE.HemisphereLight(palette[0], palette[1], 2.8));
    const light = new THREE.PointLight(palette[0], 15, 18); light.position.set(-3, 3, 5); world.add(light);
    const group = new THREE.Group(); world.add(group);
    const main = new THREE.Mesh(new THREE.IcosahedronGeometry(1.45, 1), new THREE.MeshStandardMaterial({ color: palette[0], roughness: .3, metalness: .35, flatShading: true }));
    main.position.set(2.7, .05, 0); group.add(main);
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.1, .065, 8, 64), new THREE.MeshBasicMaterial({ color: palette[1], transparent: true, opacity: .82 })); ringA.position.set(2.7, .05, 0); ringA.rotation.x = .9; group.add(ringA);
    const ringB = ringA.clone(); ringB.rotation.x = -.5; ringB.rotation.y = .65; ringB.material = ringA.material.clone(); ringB.material.opacity = .45; group.add(ringB);
    const small = new THREE.Mesh(new THREE.DodecahedronGeometry(.45, 0), new THREE.MeshStandardMaterial({ color: palette[1], roughness: .25, metalness: .45 })); small.position.set(-3, 1.8, -1); group.add(small);
    if (useLogo) { const t = new THREE.TextureLoader().load('images/logo.png'); t.colorSpace = THREE.SRGBColorSpace; const card = new THREE.Mesh(new THREE.PlaneGeometry(2.45, 2.45), new THREE.MeshBasicMaterial({ map: t, transparent: true })); card.position.set(-2.8, -.8, .2); card.rotation.z = -.18; group.add(card); }
    const bits = new THREE.BufferGeometry(), amount = 90, data = new Float32Array(amount * 3);
    for (let i = 0; i < amount; i++) data.set([(Math.random()-.5)*12, (Math.random()-.5)*7, (Math.random()-.5)*3], i*3);
    bits.setAttribute('position', new THREE.BufferAttribute(data,3)); const dust = new THREE.Points(bits, new THREE.PointsMaterial({ color:palette[1], size:.055, transparent:true, opacity:.6 })); world.add(dust);
    function fit(){const b=target.getBoundingClientRect();draw.setSize(b.width,b.height,false);view.aspect=b.width/b.height;view.updateProjectionMatrix()} new ResizeObserver(fit).observe(target); fit();
    const timer = new THREE.Clock(); function loop(){const time=timer.getElapsedTime();main.rotation.x=time*.27;main.rotation.y=time*.43;ringA.rotation.z=time*.42;ringB.rotation.z=-time*.27;small.rotation.x=-time*.7;small.rotation.z=time*.4;group.position.y=Math.sin(time*.55)*.18;dust.rotation.z=time*.025;draw.render(world,view);requestAnimationFrame(loop)} loop();
  }
  makeSectionWorld('mission-canvas', [0xff6b27, 0x4377e8], true);
  makeSectionWorld('meme-canvas', [0xffdf80, 0xff6b27], false);
  makeSectionWorld('join-canvas', [0xffdf80, 0xff6b27], true);
})();
