import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import proj4 from "proj4";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  cellCenterToUtm,
  sceneToUtm,
  utmToGridCell,
  utmToScene,
} from "./coordinates.js";
import "./style.css";

type Mode = "change" | "elevation" | "uncertainty" | "support";

interface GridData {
  schemaVersion: number;
  width: number;
  height: number;
  originX: number;
  originY: number;
  resolutionM: number;
  baseElevationM: number;
  elevationM: (number | null)[];
  surfaceChangeM: (number | null)[];
  uncertaintyM: (number | null)[];
  supportCount: number[];
  measured: number[];
  significance: number[];
  statistics: Record<string, number | null>;
  provenance: Record<string, string>;
  buildings?: Array<{
    id: string;
    source: string;
    damage: string | number;
    col: number;
    row: number;
    elevationM: number;
    changeM: number | null;
    uncertaintyM: number | null;
    validFraction: number;
    significanceClass: string;
  }>;
}

interface PinDefinition {
  id: string;
  name: string;
  lon: number;
  lat: number;
  color: string;
}

interface Selection {
  col: number;
  row: number;
  index: number;
  east: number;
  north: number;
  lon: number;
  lat: number;
  label: string;
  pinId: string | null;
}

interface ImageryMetadata {
  sceneId: string;
  acquiredAt: string;
  offNadirDeg: number;
  azimuthDeg: number;
  originX: number;
  originY: number;
  resolutionM: number;
  width: number;
  height: number;
  image: string;
}

interface ImageryAsset {
  metadata: ImageryMetadata;
  image: HTMLImageElement;
}

const UTM45 = "+proj=utm +zone=45 +datum=WGS84 +units=m +no_defs";
const PINS: PinDefinition[] = [
  { id: "syabrubesi", name: "Syabrubesi", lon: 85.3344, lat: 28.1633, color: "#ffd45c" },
  { id: "timure", name: "Timure", lon: 85.3702, lat: 28.2555, color: "#38d4c5" },
  { id: "rasuwagadhi", name: "Rasuwagadhi", lon: 85.377744, lat: 28.279672, color: "#ff6b9c" },
];

const viewport = document.querySelector<HTMLElement>("#viewport")!;
const inspection = document.querySelector<HTMLElement>("#inspection")!;
const stats = document.querySelector<HTMLElement>("#statistics")!;
const legend = document.querySelector<HTMLElement>("#legend")!;
const exaggeration = document.querySelector<HTMLInputElement>("#exaggeration")!;
const exaggerationValue = document.querySelector<HTMLOutputElement>("#exaggeration-value")!;
const unsupported = document.querySelector<HTMLInputElement>("#unsupported")!;
const contextToggle = document.querySelector<HTMLButtonElement>("#context-toggle")!;
const contextPanel = document.querySelector<HTMLElement>("#context-panel")!;
const mapCoordinates = document.querySelector<HTMLOutputElement>("#map-coordinates")!;
const productGrid = document.querySelector<HTMLSelectElement>("#product-grid")!;
const imageryPanel = document.querySelector<HTMLElement>("#imagery-panel")!;
const imageryClose = document.querySelector<HTMLButtonElement>("#imagery-close")!;
const imageryLocation = document.querySelector<HTMLElement>("#imagery-location")!;
const viewACanvas = document.querySelector<HTMLCanvasElement>("#view-a-crop")!;
const viewBCanvas = document.querySelector<HTMLCanvasElement>("#view-b-crop")!;
const viewAMeta = document.querySelector<HTMLElement>("#view-a-meta")!;
const viewBMeta = document.querySelector<HTMLElement>("#view-b-meta")!;

const query = new URLSearchParams(location.search);
const requestedGrid = query.get("grid") === "10m" ? "10m" : "32m";
productGrid.value = requestedGrid;
productGrid.addEventListener("change", () => {
  const next = new URL(location.href);
  if (productGrid.value === "10m") next.searchParams.set("grid", "10m");
  else next.searchParams.delete("grid");
  location.assign(next);
});

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x071018);
scene.fog = new THREE.FogExp2(0x071018, 0.000085);
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 1, 100000);
camera.position.set(6000, -9000, 7000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
viewport.append(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 0, 500);
scene.add(new THREE.HemisphereLight(0xbbe8ff, 0x17200f, 2.3));
const sun = new THREE.DirectionalLight(0xfff0d4, 2.5);
sun.position.set(-5000, -3000, 9000);
scene.add(sun);

const pinRoot = new THREE.Group();
scene.add(pinRoot);
const threePins = new Map<string, THREE.Group>();
const mapPins = new Map<string, import("maplibre-gl").Marker>();
let selectionPin: THREE.Group | undefined;
let selectedMapPin: import("maplibre-gl").Marker | undefined;
let maplibreApi: typeof import("maplibre-gl") | undefined;
let contextMap: import("maplibre-gl").Map | undefined;
let currentSelection: Selection | undefined;
let activePinId: string | null = null;

const changeStops = [
  new THREE.Color(0x6d287d),
  new THREE.Color(0x2759a5),
  new THREE.Color(0xe5e3d8),
  new THREE.Color(0xd0942d),
  new THREE.Color(0x7a210e),
];

let grid: GridData;
let mesh: THREE.Mesh;
let buildingPoints: THREE.Points | undefined;
let mode: Mode = "change";
let vertical = 2;
let positions: Float32Array;
let colors: Float32Array;

function ramp(value: number, min: number, max: number, stops: THREE.Color[]): THREE.Color {
  const t = Math.max(0, Math.min(0.999, (value - min) / (max - min)));
  const position = t * (stops.length - 1);
  const index = Math.floor(position);
  return stops[index]!.clone().lerp(stops[Math.min(index + 1, stops.length - 1)]!, position - index);
}

function colorAt(index: number): THREE.Color {
  const measured = grid.measured[index] === 1;
  if (!measured && !unsupported.checked) return new THREE.Color(0x071018);
  if (!measured) return new THREE.Color(0x26323a);
  if (mode === "change" && grid.significance[index] === 0) return new THREE.Color(0x667078);
  if (mode === "change") return ramp(grid.surfaceChangeM[index] ?? 0, -20, 20, changeStops);
  if (mode === "uncertainty") {
    return ramp(grid.uncertaintyM[index] ?? 0, 0, 10, [
      new THREE.Color(0x1f9d72),
      new THREE.Color(0xf0be45),
      new THREE.Color(0xc73b38),
    ]);
  }
  if (mode === "support") {
    return ramp(grid.supportCount[index] ?? 0, 1, 5, [
      new THREE.Color(0x596873),
      new THREE.Color(0x65d0e8),
      new THREE.Color(0xffffff),
    ]);
  }
  return ramp(
    grid.elevationM[index] ?? grid.baseElevationM,
    grid.baseElevationM,
    grid.baseElevationM + 1800,
    [new THREE.Color(0x184d3d), new THREE.Color(0x778b52), new THREE.Color(0xc4af82), new THREE.Color(0xf1efe8)],
  );
}

function gridElevation(col: number, row: number): number {
  const index = row * grid.width + col;
  return grid.elevationM[index] ?? grid.baseElevationM;
}

function makeLabelSprite(text: string, color: string): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 112;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "rgba(4, 16, 24, .88)";
  context.strokeStyle = color;
  context.lineWidth = 5;
  context.beginPath();
  context.roundRect(4, 4, 504, 104, 18);
  context.fill();
  context.stroke();
  context.fillStyle = "#fff";
  context.font = "700 38px Inter, system-ui, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 256, 57);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, fog: false }));
  sprite.scale.set(1000, 220, 1);
  sprite.position.z = 440;
  sprite.renderOrder = 30;
  return sprite;
}

function makeThreePin(id: string, label: string, color: string): THREE.Group {
  const group = new THREE.Group();
  group.userData.pinId = id;
  const material = new THREE.MeshBasicMaterial({ color, depthTest: false, fog: false });
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(22, 22, 220, 14), material);
  stem.rotation.x = Math.PI / 2;
  stem.position.z = 110;
  stem.renderOrder = 25;
  const head = new THREE.Mesh(new THREE.SphereGeometry(72, 20, 16), material);
  head.position.z = 270;
  head.renderOrder = 25;
  group.add(stem, head, makeLabelSprite(label, color));
  return group;
}

function positionThreePin(pin: THREE.Group, east: number, north: number): boolean {
  const cell = utmToGridCell(grid, east, north);
  if (!cell) {
    pin.visible = false;
    return false;
  }
  const [x, y] = utmToScene(grid, east, north);
  pin.position.set(x, y, (gridElevation(cell.col, cell.row) - grid.baseElevationM) * vertical + 18);
  pin.userData.east = east;
  pin.userData.north = north;
  pin.visible = true;
  return true;
}

function buildThreePins(): void {
  pinRoot.clear();
  threePins.clear();
  for (const definition of PINS) {
    const [east, north] = proj4("EPSG:4326", UTM45, [definition.lon, definition.lat]);
    const pin = makeThreePin(definition.id, definition.name, definition.color);
    positionThreePin(pin, east, north);
    threePins.set(definition.id, pin);
    pinRoot.add(pin);
  }
  selectionPin = makeThreePin("selected-location", "Selected", "#ff3b8d");
  selectionPin.visible = false;
  pinRoot.add(selectionPin);
}

function updateThreePins(): void {
  for (const pin of threePins.values()) {
    positionThreePin(pin, Number(pin.userData.east), Number(pin.userData.north));
  }
  if (selectionPin?.visible && currentSelection && !currentSelection.pinId) {
    positionThreePin(selectionPin, currentSelection.east, currentSelection.north);
  }
}

function updateGeometry(): void {
  for (let index = 0; index < grid.elevationM.length; index += 1) {
    positions[index * 3 + 2] = ((grid.elevationM[index] ?? grid.baseElevationM) - grid.baseElevationM) * vertical;
    const color = colorAt(index);
    colors.set([color.r, color.g, color.b], index * 3);
  }
  mesh.geometry.attributes.position!.needsUpdate = true;
  mesh.geometry.attributes.color!.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
  if (buildingPoints && grid.buildings) {
    const attribute = buildingPoints.geometry.getAttribute("position") as THREE.BufferAttribute;
    grid.buildings.forEach((building, index) => {
      attribute.setZ(index, (building.elevationM - grid.baseElevationM) * vertical + 20);
    });
    attribute.needsUpdate = true;
  }
  updateThreePins();
}

function updateLegend(): void {
  const labels: Record<Mode, string> = {
    change: "−20 m erosion ← 0 → +20 m deposition",
    elevation: "Low elevation → high elevation",
    uncertainty: "Low uncertainty → high uncertainty",
    support: "Sparse support → repeated support",
  };
  legend.title = labels[mode];
}

function setActivePin(pinId: string | null): void {
  activePinId = pinId;
  for (const [id, pin] of threePins) pin.scale.setScalar(id === pinId ? 1.35 : 1);
  for (const [id, marker] of mapPins) marker.getElement().classList.toggle("active", id === pinId);
}

function focusScene(east: number, north: number, elevationM: number): void {
  const [x, y] = utmToScene(grid, east, north);
  const target = new THREE.Vector3(x, y, (elevationM - grid.baseElevationM) * vertical);
  const offset = camera.position.clone().sub(controls.target);
  if (offset.length() < 1200) offset.set(1800, -2600, 2100);
  controls.target.copy(target);
  camera.position.copy(target.clone().add(offset));
  controls.update();
}

function markerElement(definition: PinDefinition, selected = false): HTMLButtonElement {
  const element = document.createElement("button");
  element.className = `geo-pin${selected ? " selected-location" : ""}`;
  element.dataset.pinId = definition.id;
  element.style.setProperty("--pin-color", definition.color);
  element.title = definition.name;
  element.setAttribute("aria-label", definition.name);
  return element;
}

function syncMapSelection(selection: Selection): void {
  if (!contextMap || !maplibreApi) return;
  selectedMapPin?.remove();
  selectedMapPin = undefined;
  if (!selection.pinId) {
    const element = markerElement(
      { id: "selected-location", name: "Selected terrain cell", lon: selection.lon, lat: selection.lat, color: "#ff3b8d" },
      true,
    );
    selectedMapPin = new maplibreApi.Marker({ element, anchor: "center" })
      .setLngLat([selection.lon, selection.lat])
      .setPopup(
        new maplibreApi.Popup({ offset: 18 }).setHTML(
          `<strong>Selected terrain cell</strong><br>${selection.lat.toFixed(5)}°N, ${selection.lon.toFixed(5)}°E`,
        ),
      )
      .addTo(contextMap);
  }
  contextMap.flyTo({ center: [selection.lon, selection.lat], zoom: Math.max(contextMap.getZoom(), 13), duration: 650 });
}

function updateInspection(selection: Selection): void {
  const elevation = grid.elevationM[selection.index];
  const change = grid.surfaceChangeM[selection.index];
  const uncertainty = grid.uncertaintyM[selection.index];
  const support = grid.supportCount[selection.index] ?? 0;
  inspection.textContent = `${selection.label} · ${selection.lat.toFixed(5)}°N, ${selection.lon.toFixed(5)}°E · elevation ${elevation?.toFixed(1) ?? "n/a"} m · change ${change?.toFixed(1) ?? "unsupported"} m · uncertainty ${uncertainty?.toFixed(1) ?? "n/a"} m · support ${support}`;
}

function selectUtm(
  east: number,
  north: number,
  label: string,
  pinId: string | null = null,
  focus = true,
): void {
  const cell = utmToGridCell(grid, east, north);
  if (!cell) {
    inspection.textContent = `${label} is outside the current product grid.`;
    return;
  }
  const index = cell.row * grid.width + cell.col;
  const [centerEast, centerNorth] = cellCenterToUtm(grid, cell.col, cell.row);
  const [lon, lat] = proj4(UTM45, "EPSG:4326", [centerEast, centerNorth]);
  const selection: Selection = {
    ...cell,
    index,
    east: centerEast,
    north: centerNorth,
    lon,
    lat,
    label,
    pinId,
  };
  currentSelection = selection;
  setActivePin(pinId);
  if (selectionPin) {
    selectionPin.visible = !pinId;
    if (!pinId) positionThreePin(selectionPin, centerEast, centerNorth);
  }
  updateInspection(selection);
  syncMapSelection(selection);
  void renderImagery(selection);
  if (focus) focusScene(centerEast, centerNorth, gridElevation(cell.col, cell.row));
}

function selectLonLat(
  lon: number,
  lat: number,
  label: string,
  pinId: string | null = null,
  focus = true,
): void {
  const [east, north] = proj4("EPSG:4326", UTM45, [lon, lat]);
  selectUtm(east, north, label, pinId, focus);
}

function pinFromIntersection(object: THREE.Object3D): string | null {
  let current: THREE.Object3D | null = object;
  while (current) {
    if (typeof current.userData.pinId === "string") return current.userData.pinId;
    current = current.parent;
  }
  return null;
}

function attachTerrainPicking(): void {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let pointerDown: { x: number; y: number } | undefined;
  renderer.domElement.addEventListener("pointerdown", (event) => {
    pointerDown = { x: event.clientX, y: event.clientY };
  });
  renderer.domElement.addEventListener("pointerup", (event) => {
    if (!pointerDown || Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) > 5) return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const pinHit = raycaster.intersectObjects(pinRoot.children, true)[0];
    if (pinHit) {
      const pinId = pinFromIntersection(pinHit.object);
      const definition = PINS.find((item) => item.id === pinId);
      if (definition) {
        selectLonLat(definition.lon, definition.lat, definition.name, definition.id);
        return;
      }
    }
    const hit = raycaster.intersectObject(mesh)[0];
    if (!hit) return;
    const [east, north] = sceneToUtm(grid, hit.point.x, hit.point.y);
    selectUtm(east, north, "Selected terrain cell", null, false);
  });
}

function build(data: GridData): void {
  grid = data;
  const { width, height, resolutionM } = grid;
  const span = Math.max(width, height) * resolutionM;
  camera.position.set(span * 0.38, -span * 0.58, span * 0.45);
  camera.far = span * 10;
  camera.updateProjectionMatrix();
  scene.fog = new THREE.FogExp2(0x071018, 1.35 / span);
  positions = new Float32Array(width * height * 3);
  colors = new Float32Array(width * height * 3);
  const indices: number[] = [];
  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      const index = row * width + col;
      positions.set(
        [(col - (width - 1) / 2) * resolutionM, ((height - 1) / 2 - row) * resolutionM, 0],
        index * 3,
      );
    }
  }
  for (let row = 0; row < height - 1; row += 1) {
    for (let col = 0; col < width - 1; col += 1) {
      const a = row * width + col;
      const b = a + 1;
      const c = a + width;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, metalness: 0, side: THREE.DoubleSide }),
  );
  scene.add(mesh);
  buildThreePins();
  updateGeometry();
  if (grid.buildings?.length) {
    const buildingPositions = new Float32Array(grid.buildings.length * 3);
    const buildingColors = new Float32Array(grid.buildings.length * 3);
    grid.buildings.forEach((building, index) => {
      buildingPositions.set(
        [
          (building.col - (width - 1) / 2) * resolutionM,
          ((height - 1) / 2 - building.row) * resolutionM,
          (building.elevationM - grid.baseElevationM) * vertical + 20,
        ],
        index * 3,
      );
      const significance = building.significanceClass ?? "MEASURED_NOT_SIGNIFICANT";
      const color = significance === "SIGNIFICANT_POSITIVE"
        ? new THREE.Color(0xff6b32)
        : significance === "SIGNIFICANT_NEGATIVE"
          ? new THREE.Color(0x8046c7)
          : new THREE.Color(0x74838c);
      buildingColors.set([color.r, color.g, color.b], index * 3);
    });
    const pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.setAttribute("position", new THREE.BufferAttribute(buildingPositions, 3));
    pointsGeometry.setAttribute("color", new THREE.BufferAttribute(buildingColors, 3));
    buildingPoints = new THREE.Points(
      pointsGeometry,
      new THREE.PointsMaterial({ size: 28, vertexColors: true, sizeAttenuation: true }),
    );
    scene.add(buildingPoints);
  }
  stats.innerHTML = Object.entries(grid.statistics)
    .map(([key, value]) => `<dt>${key.replace(/[A-Z]/g, (match) => ` ${match.toLowerCase()}`)}</dt><dd>${typeof value === "number" ? value.toFixed(key.includes("Fraction") ? 3 : 2) : "n/a"}</dd>`)
    .join("");
  controls.target.set(0, 0, 500);
  controls.update();
  updateLegend();
  attachTerrainPicking();
}

document.querySelectorAll<HTMLButtonElement>("button[data-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("button[data-mode]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    mode = button.dataset.mode as Mode;
    updateGeometry();
    updateLegend();
  });
});

exaggeration.addEventListener("input", () => {
  vertical = Number(exaggeration.value);
  exaggerationValue.value = `${vertical}×`;
  updateGeometry();
});
unsupported.addEventListener("change", updateGeometry);
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

async function initializeContextMap(): Promise<void> {
  if (contextMap) return;
  const maplibregl = await import("maplibre-gl");
  maplibreApi = maplibregl;
  contextMap = new maplibregl.Map({
    container: "context-map",
    center: [85.35, 28.21],
    zoom: 10.3,
    attributionControl: true,
    style: {
      version: 8,
      sources: {
        osm: {
          type: "raster",
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "© OpenStreetMap contributors",
        },
      },
      layers: [{ id: "osm", type: "raster", source: "osm" }],
    },
  });
  contextMap.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
  contextMap.on("mousemove", (event) => {
    mapCoordinates.value = `${event.lngLat.lat.toFixed(5)}°N, ${event.lngLat.lng.toFixed(5)}°E`;
  });
  contextMap.on("click", (event) => {
    selectLonLat(event.lngLat.lng, event.lngLat.lat, "Selected map location", null, true);
  });
  contextMap.on("load", async () => {
    const sources = await Promise.all(
      ["unosat_damage_area", "hot_flood_extent", "strong-pair-common-footprint", "measured-support", "mapped-tiles-1km"].map(
        async (name) => [name, await fetch(`./context/${name}.geojson`).then((response) => response.json())] as const,
      ),
    );
    for (const [name, data] of sources) contextMap!.addSource(name, { type: "geojson", data });
    contextMap!.addLayer({ id: "unosat-fill", type: "fill", source: "unosat_damage_area", paint: { "fill-color": "#d94c4c", "fill-opacity": 0.22 } });
    contextMap!.addLayer({ id: "unosat-line", type: "line", source: "unosat_damage_area", paint: { "line-color": "#d94c4c", "line-width": 2.5 } });
    contextMap!.addLayer({ id: "hot-line", type: "line", source: "hot_flood_extent", paint: { "line-color": "#ff7777", "line-width": 2 } });
    contextMap!.addLayer({ id: "pair-line", type: "line", source: "strong-pair-common-footprint", paint: { "line-color": "#18c8f4", "line-width": 3 } });
    contextMap!.addLayer({ id: "measured-fill", type: "fill", source: "measured-support", paint: { "fill-color": "#f4aa35", "fill-opacity": 0.82 } });
    contextMap!.addLayer({ id: "tiles-line", type: "line", source: "mapped-tiles-1km", paint: { "line-color": "#f5e76b", "line-width": 1.5 } });
    for (const definition of PINS) {
      const element = markerElement(definition);
      let marker: import("maplibre-gl").Marker;
      element.addEventListener("click", (event) => {
        event.stopImmediatePropagation();
        event.preventDefault();
        selectLonLat(definition.lon, definition.lat, definition.name, definition.id, true);
        marker.togglePopup();
      });
      marker = new maplibregl.Marker({ element, anchor: "bottom" })
        .setLngLat([definition.lon, definition.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 22, anchor: "bottom" }).setHTML(
            `<strong>${definition.name}</strong><br>${definition.lat.toFixed(5)}°N, ${definition.lon.toFixed(5)}°E<br><small>Same colour in the 3D terrain</small>`,
          ),
        )
        .addTo(contextMap!);
      mapPins.set(definition.id, marker);
    }
    contextMap!.fitBounds([[85.3002, 28.1297], [85.4039, 28.2930]], { padding: 34, duration: 0 });
    if (currentSelection) syncMapSelection(currentSelection);
    setActivePin(activePinId);
  });
}

contextToggle.addEventListener("click", async () => {
  contextPanel.classList.toggle("visible");
  const visible = contextPanel.classList.contains("visible");
  contextToggle.classList.toggle("active", visible);
  if (visible) {
    await initializeContextMap();
    setTimeout(() => contextMap?.resize(), 0);
  }
});

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load ${url}`));
    image.src = url;
  });
}

async function loadImageryAsset(name: "view-a" | "view-b"): Promise<ImageryAsset> {
  const metadata = await fetch(`./imagery/${name}.json`).then(async (response) => {
    if (!response.ok) throw new Error(`Imagery metadata request failed: ${response.status}`);
    return await response.json() as ImageryMetadata;
  });
  return { metadata, image: await loadImage(`./imagery/${metadata.image}`) };
}

let imageryAssetsPromise: Promise<[ImageryAsset, ImageryAsset]> | undefined;

function getImageryAssets(): Promise<[ImageryAsset, ImageryAsset]> {
  imageryAssetsPromise ??= Promise.all([loadImageryAsset("view-a"), loadImageryAsset("view-b")]);
  return imageryAssetsPromise;
}

function drawImageryCrop(canvas: HTMLCanvasElement, asset: ImageryAsset, selection: Selection): void {
  const context = canvas.getContext("2d")!;
  const { metadata, image } = asset;
  const sourceX = (selection.east - metadata.originX) / metadata.resolutionM;
  const sourceY = (metadata.originY - selection.north) / metadata.resolutionM;
  const cropSize = Math.round(640 / metadata.resolutionM);
  context.fillStyle = "#020609";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    sourceX - cropSize / 2,
    sourceY - cropSize / 2,
    cropSize,
    cropSize,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  context.strokeStyle = "rgba(0, 0, 0, .8)";
  context.lineWidth = 5;
  context.beginPath();
  context.moveTo(centerX - 25, centerY);
  context.lineTo(centerX + 25, centerY);
  context.moveTo(centerX, centerY - 25);
  context.lineTo(centerX, centerY + 25);
  context.stroke();
  context.strokeStyle = "#ff3b8d";
  context.lineWidth = 2;
  context.stroke();
  const scalePixels = (100 / 640) * canvas.width;
  context.strokeStyle = "#fff";
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(18, canvas.height - 22);
  context.lineTo(18 + scalePixels, canvas.height - 22);
  context.stroke();
  context.fillStyle = "#fff";
  context.font = "700 18px system-ui, sans-serif";
  context.fillText("100 m", 18, canvas.height - 30);
}

function imageryMetaText(metadata: ImageryMetadata): string {
  const time = metadata.acquiredAt.slice(11, 19);
  return `${time}Z · ${metadata.offNadirDeg.toFixed(1)}° off-nadir · az ${metadata.azimuthDeg.toFixed(1)}°`;
}

async function renderImagery(selection: Selection): Promise<void> {
  imageryPanel.classList.add("visible");
  document.body.classList.add("imagery-open");
  const measured = grid.measured[selection.index] === 1;
  imageryLocation.textContent = `${selection.label} · ${selection.lat.toFixed(5)}°N, ${selection.lon.toFixed(5)}°E · ${measured ? "direct parallax support" : "no direct parallax support at this cell"}`;
  try {
    const [viewA, viewB] = await getImageryAssets();
    if (currentSelection !== selection) return;
    viewAMeta.textContent = imageryMetaText(viewA.metadata);
    viewBMeta.textContent = imageryMetaText(viewB.metadata);
    drawImageryCrop(viewACanvas, viewA, selection);
    drawImageryCrop(viewBCanvas, viewB, selection);
  } catch (error) {
    imageryLocation.textContent = `Satellite preview unavailable: ${String(error)}`;
  }
}

imageryClose.addEventListener("click", () => {
  imageryPanel.classList.remove("visible");
  document.body.classList.remove("imagery-open");
});

function animate(): void {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

fetch(requestedGrid === "10m" ? "./data/surface-grid-10m.json" : "./data/surface-grid.json")
  .then(async (response) => {
    if (!response.ok) throw new Error(`Data request failed: ${response.status}`);
    return await response.json() as GridData;
  })
  .then(build)
  .catch((error) => {
    viewport.innerHTML = `<div class="error"><h2>Terrain data unavailable</h2>${String(error)}</div>`;
  });
