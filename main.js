import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TextureLoader } from "three";

// Vytvoreni sceny
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const textureLoader = new TextureLoader();
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// pozice kamery
camera.position.set(100, 100, 100);
camera.lookAt(scene.position);

// svetlo
const ambientLight = new THREE.AmbientLight(0xffffff);
const pointLight = new THREE.PointLight(0xffffff, 2, 300);
scene.add(ambientLight);
scene.add(pointLight);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = true;
controls.enableZoom = true;
controls.enableRotate = true;
controls.enableDamping = true;
controls.dampingFactor = 0.05;

controls.touches = {
  ONE: THREE.TOUCH.ROTATE,
  TWO: THREE.TOUCH.DOLLY_PAN,
};
controls.mouseButtons = {
  LEFT: THREE.MOUSE.ROTATE,
  MIDDLE: THREE.MOUSE.DOLLY,
  RIGHT: THREE.MOUSE.PAN,
};

controls.minDistance = 20;
controls.maxDistance = 300;
controls.maxPolarAngle = Math.PI / 1.5;

// Slunce
const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunTexture = textureLoader.load("textures/sun.jpg");
const sunMaterial = new THREE.MeshBasicMaterial({
  map: sunTexture,
  emissive: 0xffff00,
  emissiveIntensity: 0.5,
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Funkce k tvorbe planet
function createPlanet(size, textureImage, distance, hasRings = false) {
  const texture = textureLoader.load(`textures/${textureImage}`);
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(size, 32, 32),
    new THREE.MeshStandardMaterial({
      map: texture,
      metalness: 0,
      roughness: 1,
    })
  );

  if (hasRings) {
    const innerRadius = size * 2;
    const outerRadius = size * 4;
    const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 128);

    const ringTexture = textureLoader.load("textures/saturn-ring.png");

    const ringMaterial = new THREE.MeshStandardMaterial({
      map: ringTexture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      metalness: 0.3,
      roughness: 0.4,
      emissive: 0x222222,
      emissiveIntensity: 0.2,
    });

    const rings = new THREE.Mesh(ringGeometry, ringMaterial);

    rings.rotation.x = Math.PI / 2;
    const ringsLight = new THREE.PointLight(0xffffff, 1.5);
    ringsLight.position.set(0, 10, 0);
    planet.add(ringsLight);

    planet.add(rings);
  }

  const orbit = new THREE.Object3D();
  orbit.add(planet);
  planet.position.x = distance;
  scene.add(orbit);
  createOrbitLine(distance);
  return { planet, orbit };
}

// Obezne drahy (linky)
function createOrbitLine(radius) {
  const points = [];
  const segments = 128;
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    points.push(
      new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius)
    );
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0x454545 });
  const line = new THREE.LineLoop(geometry, material);
  scene.add(line);
}

// Tvorba planet
const mercury = createPlanet(0.4, "mercury.jpg", 10);
const venus = createPlanet(0.9, "venus.jpg", 15);
const earth = createPlanet(1, "earth.jpg", 20);
const mars = createPlanet(0.6, "mars.jpg", 25);
const jupiter = createPlanet(2.5, "jupiter.jpg", 35);
const saturn = createPlanet(2, "saturn.jpg", 45, true);
const uranus = createPlanet(1.5, "uranus.jpg", 55);
const neptune = createPlanet(1.5, "neptune.jpg", 65);

// Nakloneni saturnu
saturn.planet.rotation.z = Math.PI / 8;

// Pozadi (hvezdy)
function createStars() {
  const starsGeometry = new THREE.BufferGeometry();
  const starsCount = 2000;
  const positions = new Float32Array(starsCount * 3);

  for (let i = 0; i < starsCount; i++) {
    const i3 = i * 3;
    const radius = 400;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);
  }

  starsGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.5,
    sizeAttenuation: true,
  });

  const stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);
}

createStars();

// Pauza
let isPaused = false;
document.addEventListener("keydown", (event) => {
  if (event.key === "p" || event.key === "P") {
    isPaused = !isPaused;
  }
});

// Animace
function animate() {
  requestAnimationFrame(animate);
  if (!isPaused) {
    controls.update();

    // Rotace planet kolem slunce
    mercury.orbit.rotation.y += 0.02;
    venus.orbit.rotation.y += 0.015;
    earth.orbit.rotation.y += 0.01;
    mars.orbit.rotation.y += 0.008;
    jupiter.orbit.rotation.y += 0.004;
    saturn.orbit.rotation.y += 0.002;
    uranus.orbit.rotation.y += 0.001;
    neptune.orbit.rotation.y += 0.0005;

    // Rotace planet kolem sve osy
    mercury.planet.rotation.y += 0.02;
    venus.planet.rotation.y += 0.015;
    earth.planet.rotation.y += 0.01;
    mars.planet.rotation.y += 0.008;
    jupiter.planet.rotation.y += 0.004;
    saturn.planet.rotation.y += 0.002;
    uranus.planet.rotation.y += 0.001;
    neptune.planet.rotation.y += 0.0005;
  }
  renderer.render(scene, camera);
}

animate();
