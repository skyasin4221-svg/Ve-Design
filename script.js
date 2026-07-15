import { createIcons, icons } from "lucide";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const createLucideIcons = () => {
  createIcons({ icons });
};

createLucideIcons();

const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("[data-nav]");

navToggle?.addEventListener("click", () => {
  const isOpen = nav?.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 20);
};

let headerFrame = 0;
const requestHeaderUpdate = () => {
  if (headerFrame) return;
  headerFrame = requestAnimationFrame(() => {
    headerFrame = 0;
    updateHeader();
  });
};

window.addEventListener("scroll", requestHeaderUpdate, { passive: true });
updateHeader();

const revealItems = document.querySelectorAll(".reveal");

revealItems.forEach((item, index) => {
  item.style.setProperty("--reveal-delay", `${Math.min((index % 6) * 55, 275)}ms`);
});

if (reducedMotion) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

const tiltCards = document.querySelectorAll(".service-card, .work-card, .package-card");

tiltCards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    if (reducedMotion || event.pointerType === "touch") return;

    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    card.style.transform = `perspective(900px) rotateX(${y * -3}deg) rotateY(${x * 4}deg) translateY(-2px)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(contactForm);
  const name = String(formData.get("name") || "").trim();
  const service = String(formData.get("service") || "").trim();

  formStatus.textContent = `${name || "Thanks"}, your ${service || "project"} brief is ready for review.`;
  contactForm.reset();
});

const floatWindows = document.querySelectorAll("[data-float-window]");
const restoreWindows = document.querySelector("[data-restore-windows]");

const updateRestoreButton = () => {
  const allHidden = Array.from(floatWindows).every((windowPanel) => windowPanel.classList.contains("is-hidden"));
  restoreWindows?.classList.toggle("is-visible", allHidden);
};

floatWindows.forEach((windowPanel) => {
  const closeButton = windowPanel.querySelector("[data-window-close]");

  closeButton?.addEventListener("click", () => {
    windowPanel.classList.add("is-closing");

    window.setTimeout(() => {
      windowPanel.classList.add("is-hidden");
      windowPanel.classList.remove("is-closing");
      updateRestoreButton();
    }, 260);
  });
});

restoreWindows?.addEventListener("click", () => {
  floatWindows.forEach((windowPanel, index) => {
    window.setTimeout(() => {
      windowPanel.classList.remove("is-hidden", "is-closing");
    }, index * 80);
  });

  restoreWindows.classList.remove("is-visible");
});

const canvas = document.querySelector("#hero-3d");

const initFallbackCanvas = () => {
  if (!canvas) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  let width = 0;
  let height = 0;
  let frame = 0;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.floor(rect.width * ratio));
    height = Math.max(1, Math.floor(rect.height * ratio));
    canvas.width = width;
    canvas.height = height;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const draw = () => {
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    context.clearRect(0, 0, cssWidth, cssHeight);

    const centerX = cssWidth * 0.36;
    const centerY = cssHeight * 0.45;
    const pulse = reducedMotion ? 0 : Math.sin(frame * 0.025) * 8;

    context.lineWidth = 2;
    context.strokeStyle = "rgba(255, 95, 31, 0.78)";
    context.shadowColor = "rgba(255, 95, 31, 0.85)";
    context.shadowBlur = 18;

    context.fillStyle = "rgba(18, 16, 15, 0.92)";
    context.fillRect(centerX - 196, centerY - 90, 392, 224);
    context.strokeRect(centerX - 196, centerY - 90, 392, 224);

    context.fillStyle = "rgba(255, 95, 31, 0.18)";
    context.fillRect(centerX - 164, centerY - 50, 328, 132);
    context.fillStyle = "#ff5f1f";
    context.font = "800 18px Inter, Arial, sans-serif";
    context.fillText("VE DESIGN", centerX - 136, centerY - 8);
    context.fillStyle = "#ffffff";
    context.font = "700 14px Inter, Arial, sans-serif";
    context.fillText("Websites  Branding  SEO  Content", centerX - 136, centerY + 28);

    context.fillStyle = "rgba(18, 16, 15, 0.9)";
    context.fillRect(centerX - 242, centerY + 132, 484, 46);
    context.fillStyle = "rgba(255, 95, 31, 0.68)";
    context.fillRect(centerX - 70 + pulse * 0.4, centerY + 148, 140, 8);

    if (!reducedMotion) {
      frame += 1;
      requestAnimationFrame(draw);
    }
  };

  resize();
  window.addEventListener("resize", resize);
  draw();
};

const initLaptopHero = () => {
  if (!canvas) return;

  try {
    const testCanvas = document.createElement("canvas");
    const testContext = testCanvas.getContext("webgl2") || testCanvas.getContext("webgl");
    if (!testContext) {
      initFallbackCanvas();
      return;
    }
  } catch (error) {
    initFallbackCanvas();
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0.08, 5.75);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  canvas.closest(".hero-scene")?.classList.add("is-3d-ready");
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0xffffff, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const root = new THREE.Group();
  scene.add(root);

  const laptop = new THREE.Group();
  root.add(laptop);

  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xc9c3b8,
    metalness: 0.82,
    roughness: 0.18,
    clearcoat: 0.72,
    clearcoatRoughness: 0.14,
  });
  const darkBodyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x16110e,
    metalness: 0.58,
    roughness: 0.24,
    clearcoat: 0.74,
    clearcoatRoughness: 0.16,
  });
  const edgeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xff5f1f,
    metalness: 0.36,
    roughness: 0.28,
    emissive: 0x3a0d02,
    emissiveIntensity: 0.24,
  });
  const keyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x080706,
    metalness: 0.14,
    roughness: 0.5,
  });
  const keyLegendMaterial = new THREE.MeshBasicMaterial({
    color: 0xf7efe5,
    transparent: true,
    opacity: 0.62,
    depthWrite: false,
  });
  const bezelMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x070606,
    metalness: 0.2,
    roughness: 0.3,
    clearcoat: 0.8,
  });
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x111417,
    metalness: 0.12,
    roughness: 0.05,
    clearcoat: 1,
    transparent: true,
    opacity: 0.9,
  });
  const rubberMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x060504,
    metalness: 0.06,
    roughness: 0.64,
  });

  const screenCanvas = document.createElement("canvas");
  screenCanvas.width = 1024;
  screenCanvas.height = 640;
  const screenCtx = screenCanvas.getContext("2d");
  const screenTexture = new THREE.CanvasTexture(screenCanvas);
  screenTexture.colorSpace = THREE.SRGBColorSpace;

  const screenMaterial = new THREE.MeshBasicMaterial({
    map: screenTexture,
    transparent: true,
    opacity: 0.96,
  });

  const drawScreen = (elapsed, closeProgress) => {
    const pulse = 0.5 + Math.sin(elapsed * 2.2) * 0.5;
    screenCtx.clearRect(0, 0, screenCanvas.width, screenCanvas.height);
    screenCtx.fillStyle = "#f6f1ea";
    screenCtx.fillRect(0, 0, screenCanvas.width, screenCanvas.height);

    const fillRound = (x, y, w, h, r, fill) => {
      screenCtx.beginPath();
      screenCtx.roundRect(x, y, w, h, r);
      screenCtx.fillStyle = fill;
      screenCtx.fill();
    };

    const heroGlow = screenCtx.createRadialGradient(744, 94, 12, 680, 190, 430);
    heroGlow.addColorStop(0, `rgba(255, 95, 31, ${0.28 + pulse * 0.08})`);
    heroGlow.addColorStop(0.45, "rgba(255, 166, 64, 0.14)");
    heroGlow.addColorStop(1, "rgba(255, 95, 31, 0)");
    screenCtx.fillStyle = heroGlow;
    screenCtx.fillRect(0, 0, screenCanvas.width, screenCanvas.height);

    fillRound(36, 34, 952, 572, 30, "#fffaf4");
    fillRound(58, 58, 908, 54, 18, "#17120f");
    screenCtx.fillStyle = "#ff5f1f";
    screenCtx.font = "900 32px Inter, Arial, sans-serif";
    screenCtx.fillText("VE", 88, 96);
    screenCtx.fillStyle = "#ffffff";
    screenCtx.font = "800 22px Inter, Arial, sans-serif";
    screenCtx.fillText("Design Studio", 146, 94);

    const navItems = ["Web", "Brand", "SEO", "Content"];
    navItems.forEach((item, index) => {
      screenCtx.fillStyle = index === 0 ? "#ff5f1f" : "rgba(255,255,255,0.68)";
      screenCtx.font = "800 16px Inter, Arial, sans-serif";
      screenCtx.fillText(item, 610 + index * 74, 92);
    });

    fillRound(72, 140, 202, 402, 22, "#17120f");
    fillRound(96, 174, 92, 18, 9, "#ff5f1f");
    ["Launch page", "Brand kit", "SEO audit", "Content ads"].forEach((item, index) => {
      const y = 232 + index * 68;
      fillRound(96, y, 142, 12, 6, index === 0 ? "#ffffff" : "rgba(255,255,255,0.52)");
      fillRound(96, y + 24, 96 + index * 18, 8, 4, "rgba(255,255,255,0.18)");
    });
    fillRound(94, 476, 126, 38, 14, "#ff5f1f");

    fillRound(304, 140, 430, 248, 26, "#ffffff");
    screenCtx.fillStyle = "#17120f";
    screenCtx.font = "900 42px Inter, Arial, sans-serif";
    screenCtx.fillText("Modern", 336, 206);
    screenCtx.fillText("web systems", 336, 258);
    screenCtx.fillStyle = "#6b625b";
    screenCtx.font = "700 18px Inter, Arial, sans-serif";
    screenCtx.fillText("Sites, branding, SEO and content built together.", 338, 304);
    fillRound(338, 334, 142, 38, 15, "#ff5f1f");
    fillRound(500, 344, 110, 18, 9, "#34444a");

    fillRound(760, 140, 188, 248, 26, "#17120f");
    fillRound(792, 176, 124, 24, 12, "#ff5f1f");
    screenCtx.strokeStyle = "rgba(255,255,255,0.22)";
    screenCtx.lineWidth = 3;
    screenCtx.beginPath();
    screenCtx.moveTo(796, 318);
    screenCtx.bezierCurveTo(840, 246, 878, 380, 926, 262);
    screenCtx.stroke();
    ["92", "64", "18"].forEach((value, index) => {
      screenCtx.fillStyle = "#ffffff";
      screenCtx.font = "900 26px Inter, Arial, sans-serif";
      screenCtx.fillText(value, 796 + index * 48, 244);
    });

    [
      ["Website", 304, 418, 188, 98, "#ff5f1f"],
      ["Brand", 516, 418, 188, 98, "#34444a"],
      ["Content", 728, 418, 220, 98, "#17120f"],
    ].forEach(([label, x, y, w, h, color], index) => {
      fillRound(x, y, w, h, 22, color);
      screenCtx.fillStyle = "#ffffff";
      screenCtx.font = "900 20px Inter, Arial, sans-serif";
      screenCtx.fillText(label, x + 24, y + 40);
      screenCtx.fillStyle = "rgba(255,255,255,0.42)";
      screenCtx.fillRect(x + 24, y + 62, w - 54 - index * 12, 8);
    });

    screenCtx.fillStyle = "rgba(23, 18, 15, 0.08)";
    screenCtx.fillRect(76, 564, 872, 2);

    if (closeProgress > 0.05) {
      screenCtx.fillStyle = `rgba(0,0,0,${closeProgress * 0.72})`;
      screenCtx.fillRect(0, 0, screenCanvas.width, screenCanvas.height);
    }

    screenTexture.needsUpdate = true;
  };

  const roundedBox = (width, height, depth, radius = 0.05, segments = 5) =>
    new RoundedBoxGeometry(width, height, depth, segments, radius);

  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = 512;
  shadowCanvas.height = 160;
  const shadowCtx = shadowCanvas.getContext("2d");
  const shadowGradient = shadowCtx.createRadialGradient(256, 80, 18, 256, 80, 250);
  shadowGradient.addColorStop(0, "rgba(23, 18, 15, 0.28)");
  shadowGradient.addColorStop(0.42, "rgba(255, 95, 31, 0.14)");
  shadowGradient.addColorStop(1, "rgba(23, 18, 15, 0)");
  shadowCtx.fillStyle = shadowGradient;
  shadowCtx.fillRect(0, 0, shadowCanvas.width, shadowCanvas.height);
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  shadowTexture.colorSpace = THREE.SRGBColorSpace;
  const laptopShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(4.9, 1.45),
    new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    })
  );
  laptopShadow.rotation.x = -Math.PI / 2;
  laptopShadow.position.set(0, -1.07, 0.4);
  root.add(laptopShadow);

  const base = new THREE.Mesh(roundedBox(4.38, 0.18, 2.58, 0.08, 7), bodyMaterial);
  base.position.set(0, -0.82, 0.24);
  laptop.add(base);

  const deckInset = new THREE.Mesh(roundedBox(3.72, 0.028, 1.18, 0.055, 5), darkBodyMaterial);
  deckInset.position.set(0, -0.69, -0.14);
  laptop.add(deckInset);

  const frontLip = new THREE.Mesh(roundedBox(4.44, 0.052, 0.12, 0.04, 4), edgeMaterial);
  frontLip.position.set(0, -0.695, 1.5);
  laptop.add(frontLip);

  const frontBevel = new THREE.Mesh(roundedBox(3.86, 0.026, 0.1, 0.025, 3), bodyMaterial);
  frontBevel.position.set(0, -0.665, 1.3);
  laptop.add(frontBevel);

  const trackpad = new THREE.Mesh(roundedBox(1.18, 0.024, 0.54, 0.045, 5), glassMaterial);
  trackpad.position.set(0, -0.655, 0.98);
  laptop.add(trackpad);

  const keyRows = [
    { count: 14, startX: -1.55, z: -0.55, offset: 0, w: 0.17 },
    { count: 13, startX: -1.46, z: -0.39, offset: 0.04, w: 0.18 },
    { count: 12, startX: -1.36, z: -0.22, offset: 0.08, w: 0.19 },
    { count: 11, startX: -1.24, z: -0.05, offset: 0.12, w: 0.2 },
    { count: 9, startX: -1.1, z: 0.14, offset: 0.08, w: 0.2 },
  ];

  keyRows.forEach((row, rowIndex) => {
    for (let col = 0; col < row.count; col += 1) {
      const width = col === 0 || col === row.count - 1 ? row.w + 0.05 : row.w;
      const key = new THREE.Mesh(roundedBox(width, 0.032, 0.11, 0.018, 3), keyMaterial);
      const x = row.startX + col * 0.235 + row.offset;
      key.position.set(x, -0.647, row.z);
      laptop.add(key);

      if ((col + rowIndex) % 3 === 0) {
        const legend = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.34, 0.014), keyLegendMaterial);
        legend.rotation.x = -Math.PI / 2;
        legend.position.set(x, -0.628, row.z - 0.018);
        laptop.add(legend);
      }
    }
  });

  const spacebar = new THREE.Mesh(roundedBox(1.24, 0.032, 0.12, 0.02, 3), keyMaterial);
  spacebar.position.set(0, -0.646, 0.34);
  laptop.add(spacebar);
  const spacebarLegend = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.014), keyLegendMaterial);
  spacebarLegend.rotation.x = -Math.PI / 2;
  spacebarLegend.position.set(0, -0.627, 0.32);
  laptop.add(spacebarLegend);

  const speakerSlitGeometry = roundedBox(0.018, 0.012, 0.28, 0.006, 2);
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 8; i += 1) {
      const slit = new THREE.Mesh(speakerSlitGeometry, rubberMaterial);
      slit.position.set(side * (1.74 + i * 0.035), -0.642, 0.18);
      laptop.add(slit);
    }
  }

  const frontHighlight = new THREE.Mesh(
    new THREE.PlaneGeometry(3.82, 0.025),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    })
  );
  frontHighlight.rotation.x = -Math.PI / 2;
  frontHighlight.position.set(0, -0.626, 1.25);
  laptop.add(frontHighlight);

  const powerKey = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.02, 28), edgeMaterial);
  powerKey.rotation.x = Math.PI / 2;
  powerKey.position.set(1.72, -0.636, -0.42);
  laptop.add(powerKey);

  const hingeLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.072, 0.58, 32), darkBodyMaterial);
  hingeLeft.rotation.z = Math.PI / 2;
  hingeLeft.position.set(-1.45, -0.65, -1.03);
  laptop.add(hingeLeft);

  const hingeRight = hingeLeft.clone();
  hingeRight.position.x = 1.45;
  laptop.add(hingeRight);

  const hingeGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 2.0, 32), edgeMaterial);
  hingeGlow.rotation.z = Math.PI / 2;
  hingeGlow.position.set(0, -0.646, -1.03);
  laptop.add(hingeGlow);

  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, -0.68, -1.08);
  laptop.add(lidPivot);

  const lidBack = new THREE.Mesh(roundedBox(4.26, 2.5, 0.13, 0.08, 7), bodyMaterial);
  lidBack.position.set(0, 1.17, 0);
  lidPivot.add(lidBack);

  const lidLogoTexture = new THREE.TextureLoader().load("./assets/brand/ve-logo.png");
  lidLogoTexture.colorSpace = THREE.SRGBColorSpace;
  const lidLogo = new THREE.Mesh(
    new THREE.PlaneGeometry(0.86, 0.34),
    new THREE.MeshBasicMaterial({
      map: lidLogoTexture,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  lidLogo.position.set(0, 1.18, -0.073);
  lidPivot.add(lidLogo);

  const screenBezel = new THREE.Mesh(roundedBox(3.92, 2.18, 0.032, 0.065, 6), bezelMaterial);
  screenBezel.position.set(0, 1.17, 0.073);
  lidPivot.add(screenBezel);

  const screenGlass = new THREE.Mesh(new THREE.PlaneGeometry(3.52, 1.86), screenMaterial);
  screenGlass.position.set(0, 1.13, 0.096);
  lidPivot.add(screenGlass);

  const screenGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.58, 1.92),
    new THREE.MeshBasicMaterial({
      color: 0xff5f1f,
      transparent: true,
      opacity: 0.09,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  screenGlow.position.set(0, 1.13, 0.101);
  lidPivot.add(screenGlow);

  const cameraDot = new THREE.Mesh(new THREE.CircleGeometry(0.033, 24), new THREE.MeshBasicMaterial({ color: 0x2b2622 }));
  cameraDot.position.set(0, 2.19, 0.104);
  lidPivot.add(cameraDot);

  const accentGeometry = new THREE.BufferGeometry();
  accentGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [
        -1.8, -1.15, -0.68, 1.9, 0.9, -0.68,
        -1.3, 1.2, -0.7, -0.28, 1.42, -0.7,
        0.82, -1.22, -0.7, 1.82, -0.92, -0.7,
      ],
      3
    )
  );
  const accentLines = new THREE.LineSegments(
    accentGeometry,
    new THREE.LineBasicMaterial({ color: 0xff5f1f, transparent: true, opacity: 0.28 })
  );
  root.add(accentLines);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xffd8ba, 1.5));
  const keyLight = new THREE.DirectionalLight(0xffffff, 3.1);
  keyLight.position.set(-3.6, 4.1, 4.8);
  scene.add(keyLight);
  const orangeLight = new THREE.PointLight(0xff5f1f, 4.6, 9);
  orangeLight.position.set(2.2, 1.4, 3.2);
  scene.add(orangeLight);
  const fillLight = new THREE.DirectionalLight(0xfff1e2, 1.4);
  fillLight.position.set(4.2, 1.1, 3.4);
  scene.add(fillLight);
  const rimLight = new THREE.PointLight(0xffffff, 2.2, 8);
  rimLight.position.set(-2.8, 0.4, 3.6);
  scene.add(rimLight);

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let closeTarget = 0;
  let closeProgress = 0;
  let heroIsVisible = true;

  const heroElement = document.querySelector(".hero");
  if ("IntersectionObserver" in window && heroElement) {
    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        heroIsVisible = entry.isIntersecting;
      },
      { rootMargin: "180px 0px" }
    );
    heroObserver.observe(heroElement);
  }

  window.addEventListener(
    "pointermove",
    (event) => {
      if (reducedMotion) return;
      targetX = (event.clientX / window.innerWidth - 0.5) * 0.22;
      targetY = (event.clientY / window.innerHeight - 0.5) * 0.16;
    },
    { passive: true }
  );

  const updateScrollClose = () => {
    const hero = document.querySelector(".hero");
    const closeDistance = Math.max((hero?.offsetHeight || window.innerHeight) * 0.88, 640);
    closeTarget = THREE.MathUtils.clamp(window.scrollY / closeDistance, 0, 1);
    document.documentElement.style.setProperty("--hero-progress", closeTarget.toFixed(4));
    document.documentElement.style.setProperty("--hero-icon-opacity", (0.92 - closeTarget * 0.28).toFixed(3));
    document.documentElement.style.setProperty("--hero-window-opacity", (1 - closeTarget * 0.18).toFixed(3));
    document.documentElement.style.setProperty("--hero-window-up", `${Math.round(closeTarget * -58)}px`);
    document.documentElement.style.setProperty("--hero-window-right", `${Math.round(closeTarget * 42)}px`);
    document.documentElement.style.setProperty("--hero-window-left", `${Math.round(closeTarget * -34)}px`);
  };

  let closeFrame = 0;
  const requestScrollClose = () => {
    if (closeFrame) return;
    closeFrame = requestAnimationFrame(() => {
      closeFrame = 0;
      updateScrollClose();
    });
  };

  window.addEventListener("scroll", requestScrollClose, { passive: true });
  updateScrollClose();

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / Math.max(rect.height, 1);
    camera.updateProjectionMatrix();

    if (rect.width < 520) {
      root.position.set(0.02, -0.9, -0.36);
      root.scale.setScalar(0.5);
    } else if (rect.width < 760) {
      root.position.set(0.04, -0.92, -0.34);
      root.scale.setScalar(0.62);
    } else {
      root.position.set(0.06, -0.04, -0.04);
      root.scale.setScalar(0.84);
    }
  };

  const clock = new THREE.Clock();
  const smoothstep = (value) => {
    const t = THREE.MathUtils.clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  };

  const render = () => {
    if (!reducedMotion) {
      requestAnimationFrame(render);
    }

    if (!heroIsVisible) return;

    const elapsed = clock.getElapsedTime();

    currentX += (targetX - currentX) * 0.055;
    currentY += (targetY - currentY) * 0.055;
    closeProgress += (closeTarget - closeProgress) * 0.075;
    const alignProgress = smoothstep(closeProgress / 0.5);
    const shutProgress = smoothstep((closeProgress - 0.52) / 0.48);
    const hoverAmount = 1 - closeProgress * 0.82;
    const orbitAmount = Math.sin(alignProgress * Math.PI) * 0.04;

    lidPivot.rotation.x = THREE.MathUtils.lerp(-0.2, 1.5, shutProgress);
    laptop.rotation.y =
      THREE.MathUtils.lerp(0.02, -0.42, alignProgress) +
      orbitAmount +
      currentX * 0.26 * (1 - shutProgress * 0.8) +
      Math.sin(elapsed * 0.22) * 0.01 * hoverAmount;
    laptop.rotation.x =
      THREE.MathUtils.lerp(0.055, 0.34, alignProgress) +
      currentY * 0.28 * (1 - shutProgress * 0.86) +
      shutProgress * 0.03 +
      Math.sin(elapsed * 0.18) * 0.008 * hoverAmount;
    laptop.rotation.z = THREE.MathUtils.lerp(0, -0.035, alignProgress);
    laptop.position.x = THREE.MathUtils.lerp(-0.18, 0.08, alignProgress);
    laptop.position.y = Math.sin(elapsed * 0.72) * 0.018 * hoverAmount - shutProgress * 0.04;
    accentLines.rotation.z = Math.sin(elapsed * 0.24) * 0.016;
    accentLines.material.opacity = 0.28 * (1 - shutProgress * 0.54);
    screenMaterial.opacity = 0.97 - shutProgress * 0.54;
    screenGlow.material.opacity = (1 - shutProgress) * (0.08 + Math.sin(elapsed * 1.8) * 0.02);
    laptopShadow.material.opacity = 0.72 - shutProgress * 0.18;

    drawScreen(elapsed, shutProgress);
    renderer.render(scene, camera);
  };

  resize();
  window.addEventListener("resize", resize);
  render();
};

const initThreeHero = () => {
  initLaptopHero();
  return;
  if (!canvas) return;

  try {
    const testCanvas = document.createElement("canvas");
    const testContext = testCanvas.getContext("webgl2") || testCanvas.getContext("webgl");
    if (!testContext) {
      initFallbackCanvas();
      return;
    }
  } catch (error) {
    initFallbackCanvas();
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.22, 6.4);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0xffffff, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const root = new THREE.Group();
  scene.add(root);

  const modelRoot = new THREE.Group();
  root.add(modelRoot);

  const cameraStage = new THREE.Group();
  modelRoot.add(cameraStage);

  const accentGroup = new THREE.Group();
  root.add(accentGroup);

  const accentGeometry = new THREE.BufferGeometry();
  accentGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [
        -1.55, -0.88, -0.55, 1.72, 0.76, -0.55,
        -1.08, 1.02, -0.56, -0.28, 1.25, -0.56,
        0.72, -1.12, -0.56, 1.72, -0.82, -0.56,
        1.12, 0.88, -0.56, 1.72, 1.18, -0.56,
      ],
      3
    )
  );
  const accentLines = new THREE.LineSegments(
    accentGeometry,
    new THREE.LineBasicMaterial({
      color: 0xff5f1f,
      transparent: true,
      opacity: 0.26,
      depthWrite: false,
    })
  );
  accentGroup.add(accentLines);

  const roundedBoxGeometry = (width, height, depth, radius = 0.12) => {
    const x = -width / 2;
    const y = -height / 2;
    const shape = new THREE.Shape();
    shape.moveTo(x + radius, y);
    shape.lineTo(x + width - radius, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + radius);
    shape.lineTo(x + width, y + height - radius);
    shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    shape.lineTo(x + radius, y + height);
    shape.quadraticCurveTo(x, y + height, x, y + height - radius);
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.035,
      bevelSize: 0.035,
      bevelSegments: 3,
    });
    geometry.center();
    return geometry;
  };

  const cameraShell = new THREE.Group();
  cameraStage.add(cameraShell);

  const shellMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x171310,
    metalness: 0.42,
    roughness: 0.34,
    clearcoat: 0.76,
    clearcoatRoughness: 0.18,
  });

  const rubberMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x090807,
    metalness: 0.22,
    roughness: 0.52,
    clearcoat: 0.32,
  });

  const accentMaterial = new THREE.MeshBasicMaterial({ color: 0xff5f1f });

  const cameraBody = new THREE.Mesh(roundedBoxGeometry(2.78, 1.42, 0.48, 0.16), shellMaterial);
  cameraBody.position.set(-0.16, -0.78, 0.28);
  cameraShell.add(cameraBody);

  const grip = new THREE.Mesh(roundedBoxGeometry(0.56, 1.44, 0.6, 0.14), rubberMaterial);
  grip.position.set(-1.18, -0.82, 0.34);
  cameraShell.add(grip);

  const viewfinder = new THREE.Mesh(roundedBoxGeometry(0.78, 0.3, 0.42, 0.08), shellMaterial);
  viewfinder.position.set(-0.34, -0.02, 0.3);
  cameraShell.add(viewfinder);

  const hotShoe = new THREE.Mesh(roundedBoxGeometry(0.5, 0.12, 0.22, 0.04), rubberMaterial);
  hotShoe.position.set(-0.34, 0.16, 0.36);
  cameraShell.add(hotShoe);

  const shutter = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 36), accentMaterial);
  shutter.rotation.x = Math.PI / 2;
  shutter.position.set(-0.98, 0.02, 0.58);
  cameraShell.add(shutter);

  const lensBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.76, 0.58, 96), rubberMaterial);
  lensBarrel.rotation.x = Math.PI / 2;
  lensBarrel.position.set(0.78, -0.78, 0.64);
  cameraShell.add(lensBarrel);

  const lensTrim = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.024, 10, 128), accentMaterial);
  lensTrim.position.set(0.78, -0.78, 0.92);
  cameraShell.add(lensTrim);

  for (let index = 0; index < 24; index += 1) {
    const angle = (index / 24) * Math.PI * 2;
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.13, 0.08), shellMaterial);
    ridge.position.set(0.78 + Math.cos(angle) * 0.68, -0.78 + Math.sin(angle) * 0.68, 0.7);
    ridge.rotation.z = angle;
    cameraShell.add(ridge);
  }

  const createGlareTexture = () => {
    const glareCanvas = document.createElement("canvas");
    glareCanvas.width = 256;
    glareCanvas.height = 256;
    const ctx = glareCanvas.getContext("2d");

    const glow = ctx.createRadialGradient(90, 72, 4, 128, 128, 118);
    glow.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    glow.addColorStop(0.22, "rgba(120, 209, 255, 0.5)");
    glow.addColorStop(0.48, "rgba(255, 95, 31, 0.25)");
    glow.addColorStop(1, "rgba(255, 95, 31, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, glareCanvas.width, glareCanvas.height);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.58)";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(70, 62);
    ctx.lineTo(128, 40);
    ctx.lineTo(194, 72);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(glareCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };

  const lensFx = new THREE.Group();
  lensFx.position.set(0.78, -0.78, 0.92);
  cameraStage.add(lensFx);

  const lensGlass = new THREE.Mesh(
    new THREE.CircleGeometry(0.46, 96),
    new THREE.MeshPhysicalMaterial({
      color: 0x08131d,
      metalness: 0.12,
      roughness: 0.03,
      transparent: true,
      opacity: 0.72,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      side: THREE.DoubleSide,
    })
  );
  lensFx.add(lensGlass);

  const apertureGlass = new THREE.Mesh(
    new THREE.CircleGeometry(0.28, 80),
    new THREE.MeshBasicMaterial({
      color: 0x010101,
      transparent: true,
      opacity: 0.82,
      side: THREE.DoubleSide,
    })
  );
  apertureGlass.position.z = 0.012;
  lensFx.add(apertureGlass);

  const outerLensRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.5, 0.018, 10, 128),
    new THREE.MeshBasicMaterial({ color: 0xff5f1f, transparent: true, opacity: 0.74 })
  );
  lensFx.add(outerLensRing);

  const innerLensRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.32, 0.01, 8, 112),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.44 })
  );
  innerLensRing.position.z = 0.018;
  lensFx.add(innerLensRing);

  const glareSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: createGlareTexture(),
      transparent: true,
      opacity: 0.78,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  glareSprite.scale.set(0.82, 0.82, 1);
  glareSprite.position.set(-0.08, 0.08, 0.08);
  lensFx.add(glareSprite);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xffd8ba, 1.35));

  const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
  keyLight.position.set(-3.6, 4.2, 5.2);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(0xff5f1f, 4.8, 10);
  rimLight.position.set(3.2, 1.7, 3.2);
  scene.add(rimLight);

  const softLight = new THREE.PointLight(0xffffff, 1.4, 12);
  softLight.position.set(-2.2, -1.1, 3.4);
  scene.add(softLight);

  const loader = new GLTFLoader();
  let loadedModel = null;
  let scrollSpin = 0;
  const baseCameraRotation = { x: -0.04, y: -0.22, z: 0.02 };

  loader.load(
    "./assets/models/DslrCamera.glb",
    (gltf) => {
      const model = gltf.scene;

      model.traverse((child) => {
        if (!child.isMesh) return;

        child.castShadow = true;
        child.receiveShadow = true;

        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.filter(Boolean).forEach((material) => {
          const materialName = `${material.name || ""} ${child.name || ""}`.toLowerCase();
          const isLens = materialName.includes("lense") || materialName.includes("lens");

          material.envMapIntensity = 1;
          material.roughness = isLens ? 0.18 : 0.44;
          material.metalness = isLens ? 0.32 : 0.22;

          if (material.color && isLens) {
            material.color.set("#101010");
            material.emissive?.set("#111827");
            material.emissiveIntensity = 0.18;
          } else if (material.color && materialName.includes("lambert3")) {
            material.color.set("#ff5f1f");
          } else if (material.color) {
            material.color.set("#1d1b19");
          }
          material.needsUpdate = true;
        });
      });

      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      model.position.sub(center);
      model.scale.setScalar(3.1 / Math.max(size.x, size.y, size.z));
      model.rotation.set(0, 0, 0);

      cameraStage.add(model);
      loadedModel = model;
      resize();
    },
    undefined,
    (error) => {
      console.warn("The realistic camera model could not be loaded.", error);
    }
  );

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  window.addEventListener(
    "pointermove",
    (event) => {
      if (reducedMotion) return;
      targetX = (event.clientX / window.innerWidth - 0.5) * 0.3;
      targetY = (event.clientY / window.innerHeight - 0.5) * 0.2;
    },
    { passive: true }
  );

  const updateScrollSpin = () => {
    scrollSpin = window.scrollY * 0.0021;
  };

  window.addEventListener("scroll", updateScrollSpin, { passive: true });
  updateScrollSpin();

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / Math.max(rect.height, 1);
    camera.updateProjectionMatrix();

    if (rect.width < 760) {
      root.position.set(0.08, -0.72, -0.5);
      root.scale.setScalar(0.56);
      lensFx.position.set(0.68, -0.78, 0.92);
    } else {
      root.position.set(1.9, 0.72, -0.08);
      root.scale.setScalar(0.98);
      lensFx.position.set(0.78, -0.78, 0.92);
    }
  };

  const clock = new THREE.Clock();

  const render = () => {
    const elapsed = clock.getElapsedTime();

    currentX += (targetX - currentX) * 0.055;
    currentY += (targetY - currentY) * 0.055;

    root.rotation.y = currentX + Math.sin(elapsed * 0.28) * 0.04;
    root.rotation.x = currentY + Math.sin(elapsed * 0.22) * 0.018;
    accentGroup.rotation.z = Math.sin(elapsed * 0.22) * 0.018;
    lensFx.rotation.z = scrollSpin * 0.8 + elapsed * 0.22;
    outerLensRing.rotation.z = -elapsed * 0.5 - scrollSpin;
    innerLensRing.rotation.z = elapsed * 0.72 + scrollSpin * 1.2;
    glareSprite.material.opacity = 0.66 + Math.sin(elapsed * 1.7) * 0.16;

    if (loadedModel) {
      cameraStage.rotation.y = baseCameraRotation.y + scrollSpin + currentX * 0.45 + Math.sin(elapsed * 0.28) * 0.035;
      cameraStage.rotation.x = baseCameraRotation.x + currentY * 0.35 + Math.sin(elapsed * 0.22) * 0.014;
      cameraStage.rotation.z = baseCameraRotation.z;
    }

    renderer.render(scene, camera);

    if (!reducedMotion) {
      requestAnimationFrame(render);
    }
  };

  resize();
  window.addEventListener("resize", resize);
  render();
};

initThreeHero();
