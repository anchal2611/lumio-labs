import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  RotateCcw,
  Maximize2,
  Box,
  Eye,
  Camera,
  Upload,
  Cpu,
  Dna,
  Bot,
  Layers,
  Sparkles,
  Info,
  Check,
  ChevronDown,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export type ModelPresetType = 'microcontroller' | 'dna' | 'robotics' | 'cpu' | 'custom';

interface ModelInfo {
  id: ModelPresetType;
  name: string;
  category: string;
  icon: React.ElementType;
  description: string;
  specs: { label: string; value: string }[];
}

const PRESET_MODELS: ModelInfo[] = [
  {
    id: 'microcontroller',
    name: 'IoT MCU Module (ESP32-S3)',
    category: 'Embedded Systems & IoT',
    icon: Cpu,
    description: 'Dual-core Xtensa 32-bit LX7 MCU with integrated 2.4 GHz Wi-Fi, BLE 5.0, GPIO headers, and hardware UART interface.',
    specs: [
      { label: 'Clock Speed', value: '240 MHz' },
      { label: 'SRAM / Flash', value: '512 KB / 8 MB' },
      { label: 'I/O Pins', value: '38 GPIOs' },
      { label: 'Operating Voltage', value: '3.3V DC' },
    ],
  },
  {
    id: 'dna',
    name: 'DNA Double Helix (B-DNA)',
    category: 'Biotechnology & Bio-Computing',
    icon: Dna,
    description: 'Right-handed antiparallel double helical nucleic acid macromolecule with complementary base pairing (A-T, G-C).',
    specs: [
      { label: 'Helical Pitch', value: '3.4 nm (10 bp/turn)' },
      { label: 'Diameter', value: '2.0 nm' },
      { label: 'Base Pairs', value: 'Adenine, Thymine, Guanine, Cytosine' },
      { label: 'Bond Type', value: 'Hydrogen bonds & phosphodiester' },
    ],
  },
  {
    id: 'robotics',
    name: '3-Axis Articulated Robotic Arm',
    category: 'Robotics & Automation',
    icon: Bot,
    description: 'Industrial robotic manipulator with kinematic revolute joints, harmonic drive actuators, and pneumatic end-effector.',
    specs: [
      { label: 'Degrees of Freedom', value: '3-DOF + Gripper' },
      { label: 'Payload Capacity', value: '2.5 kg' },
      { label: 'Reach Radius', value: '450 mm' },
      { label: 'Repeatability', value: '±0.05 mm' },
    ],
  },
  {
    id: 'cpu',
    name: 'Multi-Core Silicon CPU Die',
    category: 'Computer Architecture',
    icon: Layers,
    description: 'LGA microprocessor packaging showing integrated heat spreader (IHS), silicon core die, and gold-plated land grid array contacts.',
    specs: [
      { label: 'Core Topology', value: '8 Cores / 16 Threads' },
      { label: 'Process Node', value: '5 nm FinFET' },
      { label: 'L3 Cache', value: '32 MB Unified' },
      { label: 'Socket Type', value: 'LGA-1700' },
    ],
  },
];

interface Lab3DModelViewerProps {
  initialPreset?: ModelPresetType;
  title?: string;
  onModelChange?: (modelId: string) => void;
  className?: string;
}

export const Lab3DModelViewer: React.FC<Lab3DModelViewerProps> = ({
  initialPreset = 'microcontroller',
  title = 'Interactive 3D Virtual Lab Model',
  onModelChange,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activeModel, setActiveModel] = useState<ModelPresetType>(initialPreset);
  const [isWireframe, setIsWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showInfo, setShowInfo] = useState(true);
  const [customModelName, setCustomModelName] = useState<string | null>(null);

  // Three.js instances ref
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const currentModelGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);

  // Dynamic mesh references for animations
  const dynamicPartsRef = useRef<{
    ledMesh?: THREE.Mesh;
    dnaGroup?: THREE.Group;
    robotArmJoint1?: THREE.Group;
    robotArmJoint2?: THREE.Group;
  }>({});

  const currentInfo = PRESET_MODELS.find((m) => m.id === activeModel) || PRESET_MODELS[0];

  // Build 3D Models
  const buildModel = (type: ModelPresetType, scene: THREE.Scene, wireframe: boolean): THREE.Group => {
    const group = new THREE.Group();

    if (type === 'microcontroller') {
      // 1. PCB Board
      const pcbGeo = new THREE.BoxGeometry(6.4, 0.2, 4.0);
      const pcbMat = new THREE.MeshStandardMaterial({
        color: 0x0f5132,
        roughness: 0.35,
        metalness: 0.2,
        wireframe,
      });
      const pcb = new THREE.Mesh(pcbGeo, pcbMat);
      pcb.receiveShadow = true;
      group.add(pcb);

      // Microcontroller IC (ESP32-S3)
      const icGeo = new THREE.BoxGeometry(2.4, 0.3, 2.4);
      const icMat = new THREE.MeshStandardMaterial({
        color: 0x1f2937,
        roughness: 0.2,
        metalness: 0.6,
        wireframe,
      });
      const ic = new THREE.Mesh(icGeo, icMat);
      ic.position.set(0, 0.2, 0);
      ic.castShadow = true;
      group.add(ic);

      // Metal Shield Plate
      const shieldGeo = new THREE.BoxGeometry(2.1, 0.1, 2.1);
      const shieldMat = new THREE.MeshStandardMaterial({
        color: 0xd1d5db,
        roughness: 0.1,
        metalness: 0.85,
        wireframe,
      });
      const shield = new THREE.Mesh(shieldGeo, shieldMat);
      shield.position.set(0, 0.38, 0);
      group.add(shield);

      // USB Type-C Port
      const usbGeo = new THREE.BoxGeometry(0.9, 0.35, 1.2);
      const usbMat = new THREE.MeshStandardMaterial({
        color: 0x9ca3af,
        metalness: 0.9,
        roughness: 0.2,
        wireframe,
      });
      const usb = new THREE.Mesh(usbGeo, usbMat);
      usb.position.set(-2.8, 0.25, 0);
      group.add(usb);

      // Status LEDs (Blue & Amber)
      const ledGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.15, 16);
      const ledMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.9,
        wireframe,
      });
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(1.8, 0.2, 1.2);
      group.add(led);
      dynamicPartsRef.current.ledMesh = led;

      // GPIO Pin Headers (Top and Bottom dual-in-line pins)
      const pinGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8);
      const pinMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.9,
        roughness: 0.1,
        wireframe,
      });

      for (let i = -14; i <= 14; i++) {
        // Top row
        const pinTop = new THREE.Mesh(pinGeo, pinMat);
        pinTop.position.set(i * 0.2, 0.35, 1.8);
        group.add(pinTop);

        // Bottom row
        const pinBottom = new THREE.Mesh(pinGeo, pinMat);
        pinBottom.position.set(i * 0.2, 0.35, -1.8);
        group.add(pinBottom);
      }
    } else if (type === 'dna') {
      // DNA Double Helix Structure
      const dnaGroup = new THREE.Group();
      const numBasePairs = 24;
      const radius = 1.6;
      const heightStep = 0.32;
      const angleStep = Math.PI / 6;

      const backboneMat1 = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.2, metalness: 0.3, wireframe });
      const backboneMat2 = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.2, metalness: 0.3, wireframe });
      const basePairMatA = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, wireframe }); // Adenine
      const basePairMatT = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3, wireframe }); // Thymine

      const nodeGeo = new THREE.SphereGeometry(0.18, 16, 16);

      for (let i = 0; i < numBasePairs; i++) {
        const y = (i - numBasePairs / 2) * heightStep;
        const angle = i * angleStep;

        const x1 = Math.cos(angle) * radius;
        const z1 = Math.sin(angle) * radius;
        const x2 = Math.cos(angle + Math.PI) * radius;
        const z2 = Math.sin(angle + Math.PI) * radius;

        // Backbone strand 1 node
        const node1 = new THREE.Mesh(nodeGeo, backboneMat1);
        node1.position.set(x1, y, z1);
        dnaGroup.add(node1);

        // Backbone strand 2 node
        const node2 = new THREE.Mesh(nodeGeo, backboneMat2);
        node2.position.set(x2, y, z2);
        dnaGroup.add(node2);

        // Base pair hydrogen rung (cylinder connecting strand 1 and 2)
        const rungLength = radius * 2;
        const rungGeo = new THREE.CylinderGeometry(0.06, 0.06, rungLength, 8);
        const rung = new THREE.Mesh(rungGeo, i % 2 === 0 ? basePairMatA : basePairMatT);
        rung.position.set(0, y, 0);
        rung.rotation.z = Math.PI / 2;
        rung.rotation.y = -angle;
        dnaGroup.add(rung);
      }

      group.add(dnaGroup);
      dynamicPartsRef.current.dnaGroup = dnaGroup;
    } else if (type === 'robotics') {
      // 3-Axis Articulated Robotic Arm
      const baseGeo = new THREE.CylinderGeometry(1.5, 1.8, 0.4, 32);
      const metalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.7, wireframe });
      const orangeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3, metalness: 0.4, wireframe });
      const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.1, metalness: 0.95, wireframe });

      const base = new THREE.Mesh(baseGeo, metalMat);
      base.position.y = 0.2;
      group.add(base);

      // Shoulder Turret
      const turretGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.8, 24);
      const turret = new THREE.Mesh(turretGeo, orangeMat);
      turret.position.y = 0.7;
      group.add(turret);

      // Joint 1 Group (Upper Arm)
      const joint1Group = new THREE.Group();
      joint1Group.position.set(0, 1.1, 0);

      const arm1Geo = new THREE.BoxGeometry(0.5, 2.6, 0.6);
      const arm1 = new THREE.Mesh(arm1Geo, orangeMat);
      arm1.position.set(0, 1.2, 0);
      arm1.rotation.z = 0.25;
      joint1Group.add(arm1);

      // Elbow Actuator Hub
      const elbowGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.7, 24);
      elbowGeo.rotateX(Math.PI / 2);
      const elbow = new THREE.Mesh(elbowGeo, chromeMat);
      elbow.position.set(0.65, 2.4, 0);
      joint1Group.add(elbow);

      // Forearm Group
      const joint2Group = new THREE.Group();
      joint2Group.position.set(0.65, 2.4, 0);

      const arm2Geo = new THREE.BoxGeometry(0.4, 2.2, 0.5);
      const arm2 = new THREE.Mesh(arm2Geo, metalMat);
      arm2.position.set(0.5, 0.9, 0);
      arm2.rotation.z = -0.55;
      joint2Group.add(arm2);

      // Gripper Hand
      const wristGeo = new THREE.SphereGeometry(0.35, 16, 16);
      const wrist = new THREE.Mesh(wristGeo, chromeMat);
      wrist.position.set(1.4, 1.6, 0);
      joint2Group.add(wrist);

      // Two-Finger Claw
      const fingerGeo = new THREE.BoxGeometry(0.12, 0.7, 0.2);
      const finger1 = new THREE.Mesh(fingerGeo, chromeMat);
      finger1.position.set(1.6, 2.0, 0.25);
      const finger2 = new THREE.Mesh(fingerGeo, chromeMat);
      finger2.position.set(1.6, 2.0, -0.25);
      joint2Group.add(finger1);
      joint2Group.add(finger2);

      joint1Group.add(joint2Group);
      group.add(joint1Group);

      dynamicPartsRef.current.robotArmJoint1 = joint1Group;
      dynamicPartsRef.current.robotArmJoint2 = joint2Group;
    } else if (type === 'cpu') {
      // Silicon CPU Package Architecture
      // PCB Substrate
      const substrateGeo = new THREE.BoxGeometry(4.8, 0.16, 4.8);
      const substrateMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.3, metalness: 0.2, wireframe });
      const substrate = new THREE.Mesh(substrateGeo, substrateMat);
      group.add(substrate);

      // LGA Gold Contacts on bottom
      const contactGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 8);
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.95, roughness: 0.1, wireframe });
      for (let x = -8; x <= 8; x += 2) {
        for (let z = -8; z <= 8; z += 2) {
          const contact = new THREE.Mesh(contactGeo, goldMat);
          contact.position.set(x * 0.25, -0.1, z * 0.25);
          group.add(contact);
        }
      }

      // Integrated Heat Spreader (IHS) Nickel-plated copper lid
      const ihsGeo = new THREE.BoxGeometry(3.6, 0.35, 3.6);
      const ihsMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.85, roughness: 0.18, wireframe });
      const ihs = new THREE.Mesh(ihsGeo, ihsMat);
      ihs.position.y = 0.25;
      group.add(ihs);

      // Central Silicon Core Die (Elevated view)
      const dieGeo = new THREE.BoxGeometry(1.6, 0.08, 2.2);
      const dieMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        metalness: 0.6,
        roughness: 0.15,
        wireframe,
      });
      const die = new THREE.Mesh(dieGeo, dieMat);
      die.position.set(0, 0.46, 0);
      group.add(die);
    }

    return group;
  };

  // Initialize Three.js Scene, Camera, Lights, Renderer, and Controls
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16); // Clean dark studio slate
    sceneRef.current = scene;

    // Camera
    const width = container.clientWidth;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(6, 5, 8);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 25;
    controls.minDistance = 2;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(8, 12, 8);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.8);
    dirLight2.position.set(-8, -4, -6);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x818cf8, 1.2, 15);
    pointLight.position.set(0, 4, 0);
    scene.add(pointLight);

    // Floor Grid Helper
    const gridHelper = new THREE.GridHelper(14, 20, 0x3b82f6, 0x1e293b);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // Initial Model
    const modelGroup = buildModel(activeModel, scene, isWireframe);
    scene.add(modelGroup);
    currentModelGroupRef.current = modelGroup;

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Auto-rotation of model
      if (autoRotate && currentModelGroupRef.current) {
        currentModelGroupRef.current.rotation.y += 0.008;
      }

      // Dynamic animations
      if (dynamicPartsRef.current.ledMesh) {
        const pulse = (Math.sin(elapsed * 5) + 1) / 2;
        (dynamicPartsRef.current.ledMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4 + pulse * 1.5;
      }

      if (dynamicPartsRef.current.dnaGroup) {
        dynamicPartsRef.current.dnaGroup.rotation.y = elapsed * 0.4;
      }

      if (dynamicPartsRef.current.robotArmJoint1 && dynamicPartsRef.current.robotArmJoint2) {
        dynamicPartsRef.current.robotArmJoint1.rotation.y = Math.sin(elapsed * 0.8) * 0.4;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 500;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      controls.dispose();
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, []);

  // Synchronize activeModel whenever initialPreset prop changes
  useEffect(() => {
    if (initialPreset) {
      setActiveModel(initialPreset);
      setCustomModelName(null);
    }
  }, [initialPreset]);

  // Adjust camera framing when activeModel changes
  useEffect(() => {
    if (cameraRef.current && controlsRef.current) {
      if (activeModel === 'dna') {
        cameraRef.current.position.set(0, 4, 10);
      } else if (activeModel === 'robotics') {
        cameraRef.current.position.set(7, 6, 8);
      } else {
        cameraRef.current.position.set(6, 5, 8);
      }
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [activeModel]);

  // Update Model on activeModel or isWireframe change
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (currentModelGroupRef.current) {
      scene.remove(currentModelGroupRef.current);
    }

    if (activeModel !== 'custom') {
      const newModel = buildModel(activeModel, scene, isWireframe);
      scene.add(newModel);
      currentModelGroupRef.current = newModel;
    }
  }, [activeModel, isWireframe]);

  // Update Grid visibility
  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = showGrid;
    }
  }, [showGrid]);

  const handleSelectModel = (presetId: ModelPresetType) => {
    setActiveModel(presetId);
    onModelChange?.(presetId);
  };

  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(6, 5, 8);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  const handleDownloadSnapshot = () => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `lumio-3d-lab-${activeModel}-${Date.now()}.png`;
    a.click();
  };

  // Custom GLTF / GLB File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const contents = event.target?.result;
      if (!contents) return;

      const loader = new GLTFLoader();
      loader.parse(
        contents as ArrayBuffer,
        '',
        (gltf) => {
          const scene = sceneRef.current;
          if (!scene) return;

          if (currentModelGroupRef.current) {
            scene.remove(currentModelGroupRef.current);
          }

          // Center and scale imported model
          const box = new THREE.Box3().setFromObject(gltf.scene);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z) || 1;
          const scale = 5 / maxDim;
          gltf.scene.scale.set(scale, scale, scale);

          const center = box.getCenter(new THREE.Vector3());
          gltf.scene.position.sub(center.multiplyScalar(scale));

          scene.add(gltf.scene);
          currentModelGroupRef.current = gltf.scene as any;
          setActiveModel('custom');
          setCustomModelName(file.name);
        },
        (error) => {
          console.error('Error loading 3D model:', error);
          alert('Could not load 3D model. Please verify file format (.glb or .gltf).');
        }
      );
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className={`flex flex-col h-full bg-slate-950 rounded-xl border border-slate-800 shadow-xl overflow-hidden relative ${className}`}>
      {/* 3D Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white text-xs tracking-tight">{title}</span>
            <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
              <span>{customModelName || currentInfo.name}</span>
              <span className="text-slate-600">•</span>
              <span className="text-brand-aqua">{currentInfo.category}</span>
            </div>
          </div>
        </div>

        {/* Preset Selector & Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Model Preset Pills */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
            {PRESET_MODELS.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => handleSelectModel(m.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                    activeModel === m.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
                  title={m.name}
                >
                  <Icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{m.id.toUpperCase()}</span>
                </button>
              );
            })}
          </div>

          {/* Upload Custom Model */}
          <label className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer transition-colors" title="Load custom .glb or .gltf file">
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline text-[11px]">Upload .GLB</span>
            <input type="file" accept=".glb,.gltf" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Wireframe Toggle */}
          <button
            onClick={() => setIsWireframe(!isWireframe)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isWireframe ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title={isWireframe ? 'Solid Shader' : 'Wireframe Mesh'}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          {/* Auto-Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded-lg border transition-colors ${
              autoRotate ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title={autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          {/* Reset Camera */}
          <button
            onClick={handleResetCamera}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Reset Camera View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Snapshot Button */}
          <button
            onClick={handleDownloadSnapshot}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Export 3D Model PNG Snapshot"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>

          {/* Info Toggle */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-1.5 rounded-lg border transition-colors ${
              showInfo ? 'bg-amber-600/20 border-amber-500 text-amber-300' : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Toggle Engineering Specifications Card"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D Canvas Mount */}
      <div className="flex-1 relative overflow-hidden">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Orbit Interaction Hint Overlay */}
        <div className="absolute bottom-3 left-3 pointer-events-none text-[10px] text-slate-500 bg-slate-900/80 backdrop-blur-xs border border-slate-800 px-2 py-1 rounded-md flex items-center gap-2">
          <span>Left Click + Drag: Rotate</span>
          <span>•</span>
          <span>Scroll: Zoom</span>
          <span>•</span>
          <span>Right Click: Pan</span>
        </div>

        {/* Technical Specs Floating Drawer */}
        {showInfo && activeModel !== 'custom' && (
          <div className="absolute top-3 right-3 w-64 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 text-xs shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800">
              <span className="font-bold text-white text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-400" />
                Technical Specifications
              </span>
              <button onClick={() => setShowInfo(false)} className="text-slate-500 hover:text-slate-300">
                ×
              </button>
            </div>
            <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
              {currentInfo.description}
            </p>
            <div className="space-y-1.5">
              {currentInfo.specs.map((spec, i) => (
                <div key={i} className="flex items-center justify-between text-[10px] py-1 border-b border-slate-800/60 last:border-0">
                  <span className="text-slate-400">{spec.label}</span>
                  <span className="font-mono font-semibold text-slate-200">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
