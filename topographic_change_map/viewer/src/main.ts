import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import "maplibre-gl/dist/maplibre-gl.css";
import "./style.css";

type Mode = "change" | "elevation" | "uncertainty" | "support";
interface GridData {
  schemaVersion:number; width:number; height:number; originX:number; originY:number; resolutionM:number; baseElevationM:number;
  elevationM:(number|null)[]; surfaceChangeM:(number|null)[]; uncertaintyM:(number|null)[]; supportCount:number[]; measured:number[]; significance:number[];
  statistics:Record<string,number|null>; provenance:Record<string,string>;
  buildings?:Array<{id:string;source:string;damage:string|number;col:number;row:number;elevationM:number;changeM:number|null;uncertaintyM:number|null;validFraction:number;significanceClass:string}>;
}

const viewport=document.querySelector<HTMLElement>("#viewport")!;
const inspection=document.querySelector<HTMLElement>("#inspection")!;
const stats=document.querySelector<HTMLElement>("#statistics")!;
const legend=document.querySelector<HTMLElement>("#legend")!;
const exaggeration=document.querySelector<HTMLInputElement>("#exaggeration")!;
const exaggerationValue=document.querySelector<HTMLOutputElement>("#exaggeration-value")!;
const unsupported=document.querySelector<HTMLInputElement>("#unsupported")!;
const contextToggle=document.querySelector<HTMLButtonElement>("#context-toggle")!;
const contextPanel=document.querySelector<HTMLElement>("#context-panel")!;
const mapCoordinates=document.querySelector<HTMLOutputElement>("#map-coordinates")!;

const scene=new THREE.Scene(); scene.background=new THREE.Color(0x071018); scene.fog=new THREE.FogExp2(0x071018,0.000085);
const camera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,1,100000); camera.position.set(6000,-9000,7000);
const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight); viewport.append(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement); controls.enableDamping=true; controls.dampingFactor=.08; controls.target.set(0,0,500);
scene.add(new THREE.HemisphereLight(0xbbe8ff,0x17200f,2.3)); const sun=new THREE.DirectionalLight(0xfff0d4,2.5);sun.position.set(-5000,-3000,9000);scene.add(sun);

const changeStops=[new THREE.Color(0x6d287d),new THREE.Color(0x2759a5),new THREE.Color(0xe5e3d8),new THREE.Color(0xd0942d),new THREE.Color(0x7a210e)];
function ramp(value:number,min:number,max:number,stops:THREE.Color[]):THREE.Color { const t=Math.max(0,Math.min(.999,(value-min)/(max-min))); const p=t*(stops.length-1),i=Math.floor(p);return stops[i]!.clone().lerp(stops[Math.min(i+1,stops.length-1)]!,p-i); }
function percentile(values:number[],p:number):number { const s=[...values].sort((a,b)=>a-b);return s[Math.min(s.length-1,Math.floor(p*(s.length-1)))]??0; }

let grid:GridData; let mesh:THREE.Mesh; let buildingPoints:THREE.Points|undefined; let mode:Mode="change"; let vertical=2;
let positions:Float32Array,colors:Float32Array;
function colorAt(index:number):THREE.Color {
  const measured=grid.measured[index]===1;
  if(!measured && !unsupported.checked) return new THREE.Color(0x071018);
  if(!measured) return new THREE.Color(0x26323a);
  if(mode==="change"&&grid.significance[index]===0) return new THREE.Color(0x667078);
  if(mode==="change") return ramp(grid.surfaceChangeM[index]??0,-20,20,changeStops);
  if(mode==="uncertainty") return ramp(grid.uncertaintyM[index]??0,0,10,[new THREE.Color(0x1f9d72),new THREE.Color(0xf0be45),new THREE.Color(0xc73b38)]);
  if(mode==="support") return ramp(grid.supportCount[index]??0,1,5,[new THREE.Color(0x596873),new THREE.Color(0x65d0e8),new THREE.Color(0xffffff)]);
  return ramp(grid.elevationM[index]??grid.baseElevationM,grid.baseElevationM,grid.baseElevationM+1800,[new THREE.Color(0x184d3d),new THREE.Color(0x778b52),new THREE.Color(0xc4af82),new THREE.Color(0xf1efe8)]);
}
function updateGeometry():void { for(let i=0;i<grid.elevationM.length;i++){ positions[i*3+2]=((grid.elevationM[i]??grid.baseElevationM)-grid.baseElevationM)*vertical; const c=colorAt(i);colors.set([c.r,c.g,c.b],i*3); } mesh.geometry.attributes.position!.needsUpdate=true;mesh.geometry.attributes.color!.needsUpdate=true;mesh.geometry.computeVertexNormals();if(buildingPoints&&grid.buildings){const attribute=buildingPoints.geometry.getAttribute("position") as THREE.BufferAttribute;grid.buildings.forEach((building,i)=>attribute.setZ(i,(building.elevationM-grid.baseElevationM)*vertical+20));attribute.needsUpdate=true;} }
function updateLegend():void { const labels:Record<Mode,string>={change:"−20 m erosion ← 0 → +20 m deposition",elevation:"Low elevation → high elevation",uncertainty:"Low uncertainty → high uncertainty",support:"Sparse support → repeated support"};legend.title=labels[mode]; }
function build(data:GridData):void {
  grid=data; const {width,height,resolutionM}=grid;positions=new Float32Array(width*height*3);colors=new Float32Array(width*height*3);const indices:number[]=[];
  for(let row=0;row<height;row++)for(let col=0;col<width;col++){const i=row*width+col;positions.set([(col-(width-1)/2)*resolutionM,((height-1)/2-row)*resolutionM,0],i*3);}
  for(let row=0;row<height-1;row++)for(let col=0;col<width-1;col++){const a=row*width+col,b=a+1,c=a+width,d=c+1;indices.push(a,c,b,b,c,d);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute("position",new THREE.BufferAttribute(positions,3));geometry.setAttribute("color",new THREE.BufferAttribute(colors,3));geometry.setIndex(indices);
  mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.86,metalness:0,side:THREE.DoubleSide}));scene.add(mesh);updateGeometry();
  if(grid.buildings?.length){const buildingPositions=new Float32Array(grid.buildings.length*3),buildingColors=new Float32Array(grid.buildings.length*3);grid.buildings.forEach((building,i)=>{buildingPositions.set([(building.col-(width-1)/2)*resolutionM,((height-1)/2-building.row)*resolutionM,(building.elevationM-grid.baseElevationM)*vertical+20],i*3);const significance=building.significanceClass??"MEASURED_NOT_SIGNIFICANT",color=significance==="SIGNIFICANT_POSITIVE"?new THREE.Color(0xff6b32):significance==="SIGNIFICANT_NEGATIVE"?new THREE.Color(0x8046c7):new THREE.Color(0x74838c);buildingColors.set([color.r,color.g,color.b],i*3);});const pointsGeometry=new THREE.BufferGeometry();pointsGeometry.setAttribute("position",new THREE.BufferAttribute(buildingPositions,3));pointsGeometry.setAttribute("color",new THREE.BufferAttribute(buildingColors,3));buildingPoints=new THREE.Points(pointsGeometry,new THREE.PointsMaterial({size:28,vertexColors:true,sizeAttenuation:true}));scene.add(buildingPoints);}
  stats.innerHTML=Object.entries(grid.statistics).map(([key,value])=>`<dt>${key.replace(/[A-Z]/g,m=>` ${m.toLowerCase()}`)}</dt><dd>${typeof value==="number"?value.toFixed(key.includes("Fraction")?3:2):"n/a"}</dd>`).join("");
  controls.target.set(0,0,500);controls.update();updateLegend();
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();renderer.domElement.addEventListener("click",event=>{const rect=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObject(mesh)[0];if(!hit)return;const index=hit.face?.a??0,row=Math.floor(index/grid.width),col=index%grid.width;inspection.textContent=`Cell ${col}, ${row} · elevation ${(grid.elevationM[index]??NaN).toFixed(1)} m · change ${grid.surfaceChangeM[index]?.toFixed(1)??"unsupported"} m · uncertainty ${grid.uncertaintyM[index]?.toFixed(1)??"n/a"} m · support ${grid.supportCount[index]}`;});
}
document.querySelectorAll<HTMLButtonElement>("button[data-mode]").forEach(button=>button.addEventListener("click",()=>{document.querySelectorAll("button[data-mode]").forEach(b=>b.classList.remove("active"));button.classList.add("active");mode=button.dataset.mode as Mode;updateGeometry();updateLegend();}));
exaggeration.addEventListener("input",()=>{vertical=Number(exaggeration.value);exaggerationValue.value=`${vertical}×`;updateGeometry();});unsupported.addEventListener("change",updateGeometry);
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
let contextMap:import("maplibre-gl").Map|undefined;
async function initializeContextMap():Promise<void>{if(contextMap)return;const maplibregl=await import("maplibre-gl");contextMap=new maplibregl.Map({container:"context-map",center:[85.35,28.21],zoom:10.3,attributionControl:true,style:{version:8,sources:{osm:{type:"raster",tiles:["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],tileSize:256,attribution:"© OpenStreetMap contributors"}},layers:[{id:"osm",type:"raster",source:"osm"}]}});contextMap.addControl(new maplibregl.NavigationControl({showCompass:false}),"top-right");contextMap.on("mousemove",event=>{mapCoordinates.value=`${event.lngLat.lat.toFixed(5)}°N, ${event.lngLat.lng.toFixed(5)}°E`;});contextMap.on("load",async()=>{const sources=await Promise.all(["unosat_damage_area","hot_flood_extent","strong-pair-common-footprint","measured-support","mapped-tiles-1km"].map(async name=>[name,await fetch(`./context/${name}.geojson`).then(response=>response.json())] as const));for(const[name,data]of sources)contextMap!.addSource(name,{type:"geojson",data});contextMap!.addLayer({id:"unosat-fill",type:"fill",source:"unosat_damage_area",paint:{"fill-color":"#d94c4c","fill-opacity":.22}});contextMap!.addLayer({id:"unosat-line",type:"line",source:"unosat_damage_area",paint:{"line-color":"#d94c4c","line-width":2.5}});contextMap!.addLayer({id:"hot-line",type:"line",source:"hot_flood_extent",paint:{"line-color":"#ff7777","line-width":2}});contextMap!.addLayer({id:"pair-line",type:"line",source:"strong-pair-common-footprint",paint:{"line-color":"#18c8f4","line-width":3}});contextMap!.addLayer({id:"measured-fill",type:"fill",source:"measured-support",paint:{"fill-color":"#f4aa35","fill-opacity":.82}});contextMap!.addLayer({id:"tiles-line",type:"line",source:"mapped-tiles-1km",paint:{"line-color":"#f5e76b","line-width":1.5}});const settlements=await fetch("./context/settlements.geojson").then(response=>response.json());for(const item of settlements.features){const [lon,lat]=item.geometry.coordinates;new maplibregl.Marker({color:"#ffd45c",scale:.75}).setLngLat([lon,lat]).setPopup(new maplibregl.Popup({offset:20}).setHTML(`<strong>${item.properties.name}</strong><br>${lat.toFixed(5)}°N, ${lon.toFixed(5)}°E`)).addTo(contextMap!);}contextMap!.fitBounds([[85.0126,27.8141],[85.5334,28.3403]],{padding:35,duration:0});});}
contextToggle.addEventListener("click",async()=>{contextPanel.classList.toggle("visible");const visible=contextPanel.classList.contains("visible");contextToggle.classList.toggle("active",visible);if(visible){await initializeContextMap();setTimeout(()=>contextMap?.resize(),0);}});
function animate(){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);}animate();
fetch("./data/surface-grid.json").then(response=>{if(!response.ok)throw new Error(`Data request failed: ${response.status}`);return response.json();}).then(build).catch(error=>{viewport.innerHTML=`<div class="error"><h2>Terrain data unavailable</h2>${String(error)}</div>`;});
