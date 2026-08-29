/* <corridor-3d> — stylized low-poly Bhote Koshi / Trishuli corridor. Procedural terrain, flood channel, place markers. */
(function () {
  const PLACES = [
    { id: 'gyirong', name: 'Gyirong Port', km: -3, side: 0, reported: 560, confirmed: 2, unknown: 558, last: '26 Aug 08:30' },
    { id: 'timure', name: 'Timure', km: 4, side: 0.4, reported: 190, confirmed: 123, unknown: 67, last: '26 Aug 08:45' },
    { id: 'syabrubesi', name: 'Syabrubesi', km: 16, side: -0.6, reported: 140, confirmed: 96, unknown: 44, last: '27 Aug' },
    { id: 'langtang', name: 'Langtang village', km: 20, side: -7, reported: 60, confirmed: 0, unknown: 60, last: '27 Aug', off: true },
    { id: 'mailung', name: 'UT-1 camp (Mailung)', km: 26, side: 0.7, reported: 320, confirmed: 254, unknown: 66, last: '28 Aug' },
    { id: 'betrawati', name: 'Betrawati', km: 40, side: -0.5, reported: 450, confirmed: 380, unknown: 70, last: '29 Aug' },
    { id: 'bidur', name: 'Bidur / Trishuli', km: 46, side: 0.6, reported: 300, confirmed: 265, unknown: 35, last: '29 Aug' },
    { id: 'devighat', name: 'Devighat', km: 50, side: -0.4, reported: 120, confirmed: 110, unknown: 10, last: '29 Aug' },
    { id: 'galchhi', name: 'Galchhi', km: 60, side: 0.5, reported: 85, confirmed: 80, unknown: 5, last: '29 Aug' },
    { id: 'malekhu', name: 'Malekhu', km: 68, side: -0.3, reported: 40, confirmed: 38, unknown: 2, last: '29 Aug' }
  ];
  const UNKNOWN_C = 0xb06a00, CONFIRMED_C = 0x1c7a45, FLOOD_C = 0xec3013, LAKE_C = 0x5b7f8f;

  class Corridor3D extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      const dark = this.getAttribute('theme') === 'dark';
      this._dark = dark;
      this.style.cssText += ';display:block;position:relative;overflow:hidden;background:' + (dark ? '#10131a' : '#e9e7e5') + ';';
      if (!this.clientHeight) this.style.height = (this.getAttribute('height') || '480') + 'px';
      this._card = document.createElement('div');
      this._card.style.cssText = dark
        ? 'position:absolute;display:none;z-index:3;background:#171b24;border:1px solid rgba(255,255,255,.22);box-shadow:0 6px 20px rgba(0,0,0,.5);padding:10px 12px;font:400 12px/1.45 Sora,system-ui,sans-serif;color:#f2efe8;min-width:180px;pointer-events:auto'
        : 'position:absolute;display:none;z-index:3;background:#f3f2f2;border:1px solid rgba(32,30,29,.4);box-shadow:0 3px 10px rgba(45,43,43,.16);padding:10px 12px;font:400 12px/1.45 Archivo,system-ui,sans-serif;color:#201e1d;min-width:180px;pointer-events:auto';
      this.appendChild(this._card);
      this._boot().catch(err => this._fallback(err));
    }
    _fallback() {
      this.innerHTML = '<div style="position:absolute;inset:0;display:grid;place-items:center;font:600 13px Archivo,system-ui,sans-serif;color:#605d5d;text-align:left;padding:24px">3D view unavailable on this connection — showing places list below.</div>';
    }
    async _boot() {
      const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');
      const W = () => this.clientWidth, H = () => this.clientHeight;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(W(), H());
      renderer.domElement.style.cssText = 'position:absolute;inset:0;touch-action:none';
      this.insertBefore(renderer.domElement, this._card);
      const dark = this._dark;
      const BG = dark ? 0x10131a : 0xe9e7e5, TER = dark ? 0x272d3a : 0xdedbd8;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(BG);
      scene.fog = new THREE.Fog(BG, 70, 160);

      // River path: x = km along corridor (-10..74 mapped to -42..42), z meander
      const kmToX = km => (km - 32) * 0.84;
      const meander = x => Math.sin(x * 0.16) * 3.2 + Math.sin(x * 0.043 + 1.2) * 5;
      const baseElev = x => 14 * Math.pow(Math.max(0, (38 - x) / 80), 1.35); // north high → south low, 1.5x exaggerated
      const n2 = (x, z) => Math.sin(x * 0.35 + z * 0.9) * Math.cos(z * 0.5 - x * 0.21) + 0.6 * Math.sin(x * 0.9 + 2.3) * Math.sin(z * 1.7);
      const terrainH = (x, z) => {
        const d = Math.abs(z - meander(x));
        const wall = Math.min(1, d / (5 + (x + 42) * 0.10)); // gorge narrow in north, opens south
        const ridge = Math.pow(wall, 1.6) * (10 + baseElev(x) * 1.5) + n2(x, z) * (0.7 + wall * 1.8);
        return baseElev(x) + ridge - 1.2;
      };
      const geo = new THREE.PlaneGeometry(96, 52, 150, 80);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) pos.setY(i, terrainH(pos.getX(i), pos.getZ(i)));
      geo.computeVertexNormals();
      const terrain = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: TER, flatShading: true, roughness: 1 }));
      scene.add(terrain);

      // Flood channel draped on terrain
      const pts = [];
      for (let km = -10; km <= 74; km += 0.8) {
        const x = kmToX(km), z = meander(x);
        pts.push(new THREE.Vector3(x, terrainH(x, z) + 0.35, z));
      }
      const flood = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 200, 0.5, 6),
        new THREE.MeshStandardMaterial({ color: dark ? 0xffb000 : FLOOD_C, emissive: dark ? 0xffb000 : FLOOD_C, emissiveIntensity: dark ? 0.9 : 0.55, roughness: 0.6 })
      );
      scene.add(flood);

      // Barrier lakes upstream
      [-8, -6].forEach(km => {
        const x = kmToX(km), z = meander(x);
        const lake = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.3, 10),
          new THREE.MeshStandardMaterial({ color: LAKE_C, emissive: LAKE_C, emissiveIntensity: 0.5 }));
        lake.position.set(x, terrainH(x, z) + 0.5, z);
        scene.add(lake);
      });

      // Markers
      const markers = [];
      PLACES.forEach(p => {
        const x = kmToX(p.km), z = meander(x) + p.side * (p.off ? 1 : 2.2);
        const h = 1.5 + Math.sqrt(p.reported) * 0.32;
        const heavy = p.unknown / Math.max(1, p.reported) > 0.4;
        const uc = dark ? 0xffb84d : UNKNOWN_C, cc = dark ? 0x35c274 : CONFIRMED_C;
        const m = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, h, 8),
          new THREE.MeshStandardMaterial({ color: heavy ? uc : cc, emissive: heavy ? uc : cc, emissiveIntensity: dark ? 0.5 : 0.25 }));
        const y = terrainH(x, z);
        m.position.set(x, y + h / 2 + 0.2, z);
        m.userData = p; scene.add(m); markers.push(m);
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.8, 10, 8), m.material);
        cap.position.set(x, y + h + 0.6, z); cap.userData = p; scene.add(cap); markers.push(cap);
      });

      scene.add(new THREE.AmbientLight(dark ? 0x9fb0d8 : 0xffffff, dark ? 0.5 : 0.75));
      const sun = new THREE.DirectionalLight(dark ? 0xcdd8f5 : 0xfff4ea, dark ? 1.1 : 1.4); sun.position.set(-30, 50, 25); scene.add(sun);

      const cam = new THREE.PerspectiveCamera(42, W() / H(), 0.5, 400);
      let az = -0.9, pol = 0.98, rad = 62, drift = true;
      const target = new THREE.Vector3(0, 4, 0);
      const setCam = () => {
        cam.position.set(target.x + rad * Math.sin(pol) * Math.sin(az), target.y + rad * Math.cos(pol), target.z + rad * Math.sin(pol) * Math.cos(az));
        cam.lookAt(target);
      };

      // Minimal orbit controls
      let down = null;
      const el = renderer.domElement;
      el.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, az, pol, moved: false }; el.setPointerCapture(e.pointerId); });
      el.addEventListener('pointermove', e => {
        if (!down) return;
        const dx = e.clientX - down.x, dy = e.clientY - down.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) { down.moved = true; drift = false; }
        az = down.az - dx * 0.005; pol = Math.min(1.35, Math.max(0.35, down.pol - dy * 0.005));
      });
      el.addEventListener('pointerup', e => {
        if (down && !down.moved) this._pick(e, cam, markers, THREE);
        down = null;
      });
      el.addEventListener('wheel', e => { e.preventDefault(); drift = false; rad = Math.min(120, Math.max(28, rad + e.deltaY * 0.05)); }, { passive: false });

      const ray = new THREE.Raycaster(), v2 = new THREE.Vector2();
      this._pick = (e, cam, markers) => {
        const r = el.getBoundingClientRect();
        v2.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        ray.setFromCamera(v2, cam);
        const hit = ray.intersectObjects(markers)[0];
        if (!hit) { this._card.style.display = 'none'; return; }
        const p = hit.object.userData;
        this._card.innerHTML =
          '<div style="font-weight:800;font-size:13px;margin-bottom:4px">' + p.name + '</div>' +
          '<div>' + p.reported + ' reported · <span style="color:' + (this._dark ? '#35c274' : '#1c7a45') + ';font-weight:600">' + p.confirmed + ' confirmed</span> · <span style="color:' + (this._dark ? '#ffb84d' : '#b06a00') + ';font-weight:600">' + p.unknown + ' unknown</span></div>' +
          '<div style="color:' + (this._dark ? '#9aa3b5' : '#605d5d') + ';margin-top:2px">Last contact ' + p.last + '</div>' +
          '<a href="#" style="color:' + (this._dark ? '#ffb000' : '#ec3013') + ';font-weight:600;text-decoration:underline;text-underline-offset:3px;display:inline-block;margin-top:6px">Place page →</a>';
        const px = Math.min(e.clientX - r.left, r.width - 210), py = Math.min(e.clientY - r.top, r.height - 120);
        this._card.style.left = Math.max(8, px) + 'px'; this._card.style.top = Math.max(8, py) + 'px';
        this._card.style.display = 'block';
      };

      new ResizeObserver(() => { renderer.setSize(W(), H()); cam.aspect = W() / H(); cam.updateProjectionMatrix(); }).observe(this);
      const tick = () => {
        if (!this.isConnected) { renderer.dispose(); return; }
        if (drift) az += 0.0009;
        setCam(); renderer.render(scene, cam);
        requestAnimationFrame(tick);
      };
      tick();
    }
  }
  if (!customElements.get('corridor-3d')) customElements.define('corridor-3d', Corridor3D);
})();
