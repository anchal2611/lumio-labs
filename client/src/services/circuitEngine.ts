import { CircuitComponent, WireConnection, CircuitSimulationState } from '../types/circuit';

export function runCircuitStep(
  components: CircuitComponent[],
  wires: WireConnection[],
  stepIndex: number,
  pushButtonStates: Record<string, boolean>
): CircuitSimulationState {
  const activeLeds: Record<string, boolean> = {};
  const activeBuzzer: Record<string, boolean> = {};
  const activeServos: Record<string, number> = {};
  const serialLogs: { timestamp: string; message: string }[] = [];

  // Check if power source exists (Battery or ESP32)
  const powerSources = components.filter(
    (c) => c.type === 'battery' || c.type === 'esp32'
  );

  const isPowered = powerSources.length > 0;

  if (!isPowered) {
    return {
      isRunning: true,
      isPowered: false,
      simulationTimeSeconds: stepIndex * 0.5,
      activeLeds,
      activeBuzzer,
      activeServos,
      serialLogs: [{
        timestamp: new Date().toLocaleTimeString(),
        message: '[SYSTEM] No active power source (Battery or ESP32 3V3/5V) detected on canvas.',
      }],
      errorMessage: 'No power source detected. Add a 9V Battery or ESP32 development board.',
    };
  }

  // Find components wired to power and ground
  for (const comp of components) {
    if (comp.type === 'led') {
      // Check if LED anode is wired to a power source or a closed push-button
      const hasPower = wires.some(
        (w) => (w.toComponentId === comp.id && w.toPinId === 'anode') ||
               (w.fromComponentId === comp.id && w.fromPinId === 'anode')
      );
      const hasGnd = wires.some(
        (w) => (w.toComponentId === comp.id && w.toPinId === 'cathode') ||
               (w.fromComponentId === comp.id && w.fromPinId === 'cathode')
      );

      // Check if there is an intervening push button
      const buttonInCircuit = components.find((c) => c.type === 'pushbutton');
      const isButtonClosed = buttonInCircuit ? (pushButtonStates[buttonInCircuit.id] ?? false) : true;

      if (hasPower && hasGnd && isButtonClosed) {
        activeLeds[comp.id] = true;
      }
    }

    if (comp.type === 'buzzer') {
      const hasPower = wires.some((w) => w.toComponentId === comp.id || w.fromComponentId === comp.id);
      if (hasPower) {
        activeBuzzer[comp.id] = true;
      }
    }

    if (comp.type === 'servo') {
      // Animate servo sweep: 0 -> 90 -> 180 -> 90
      const angleSequence = [0, 45, 90, 135, 180, 135, 90, 45];
      activeServos[comp.id] = angleSequence[stepIndex % angleSequence.length];
    }
  }

  // Generate Virtual Serial Monitor telemetry
  const timeStr = new Date().toLocaleTimeString();
  const esp32 = components.find((c) => c.type === 'esp32');

  if (esp32) {
    const irSensor = components.find((c) => c.type === 'irsensor');
    const irState = irSensor?.properties.irDetected ?? (stepIndex % 3 === 0);

    if (stepIndex === 0) {
      serialLogs.push({
        timestamp: timeStr,
        message: '[BOOT] ESP32-WROOM-32 Revision 1 Initialized (CPU Freq: 240MHz)',
      });
      serialLogs.push({
        timestamp: timeStr,
        message: '[CONFIG] Serial initialized at 115200 baud | Free Heap: 294,840 bytes',
      });
    }

    if (irSensor) {
      serialLogs.push({
        timestamp: timeStr,
        message: `[GPIO 14] IR Sensor Read: ${irState ? 'OBSTACLE DETECTED (Logic HIGH)' : 'CLEAR (Logic LOW)'}`,
      });
    }

    const ledCount = Object.keys(activeLeds).length;
    if (ledCount > 0) {
      serialLogs.push({
        timestamp: timeStr,
        message: `[GPIO 2] LED Output pin driven HIGH -> Current draw: 18.2 mA`,
      });
    }
  } else {
    serialLogs.push({
      timestamp: timeStr,
      message: `[CIRCUIT] DC Loop Active: ${Object.keys(activeLeds).length} LED(s) illuminated.`,
    });
  }

  return {
    isRunning: true,
    isPowered: true,
    simulationTimeSeconds: stepIndex * 0.5,
    activeLeds,
    activeBuzzer,
    activeServos,
    serialLogs,
  };
}

export const DEFAULT_CIRCUIT_COMPONENTS: CircuitComponent[] = [
  {
    id: 'esp32-1',
    type: 'esp32',
    label: 'ESP32 Dev Module',
    x: 60,
    y: 80,
    properties: {
      voltage: 3.3,
    },
    pins: [
      { id: '3v3', name: '3V3', type: 'power', position: 'left' },
      { id: 'gnd', name: 'GND', type: 'ground', position: 'left' },
      { id: 'gpio2', name: 'D2 (LED)', type: 'digital', position: 'right' },
      { id: 'gpio14', name: 'D14 (IR)', type: 'digital', position: 'right' },
      { id: 'gpio18', name: 'D18 (PWM)', type: 'digital', position: 'right' },
    ],
  },
  {
    id: 'btn-1',
    type: 'pushbutton',
    label: 'Tactile Push Button',
    x: 340,
    y: 100,
    properties: {
      state: false,
    },
    pins: [
      { id: 'term1', name: 'Pin 1A', type: 'digital', position: 'left' },
      { id: 'term2', name: 'Pin 1B', type: 'digital', position: 'right' },
    ],
  },
  {
    id: 'res-1',
    type: 'resistor',
    label: '220Ω Resistor',
    x: 480,
    y: 100,
    properties: {
      resistance: 220,
    },
    pins: [
      { id: 'in', name: '1', type: 'power', position: 'left' },
      { id: 'out', name: '2', type: 'power', position: 'right' },
    ],
  },
  {
    id: 'led-1',
    type: 'led',
    label: 'Aqua LED 5mm',
    x: 620,
    y: 100,
    properties: {
      color: '#38BDF8',
      state: false,
    },
    pins: [
      { id: 'anode', name: 'Anode (+)', type: 'anode', position: 'left' },
      { id: 'cathode', name: 'Cathode (-)', type: 'cathode', position: 'right' },
    ],
  },
];

export const DEFAULT_CIRCUIT_WIRES: WireConnection[] = [
  {
    id: 'wire-1',
    fromComponentId: 'esp32-1',
    fromPinId: 'gpio2',
    toComponentId: 'btn-1',
    toPinId: 'term1',
    color: '#3B82F6',
  },
  {
    id: 'wire-2',
    fromComponentId: 'btn-1',
    fromPinId: 'term2',
    toComponentId: 'res-1',
    toPinId: 'in',
    color: '#0D9488',
  },
  {
    id: 'wire-3',
    fromComponentId: 'res-1',
    fromPinId: 'out',
    toComponentId: 'led-1',
    toPinId: 'anode',
    color: '#67E8F9',
  },
  {
    id: 'wire-4',
    fromComponentId: 'led-1',
    fromPinId: 'cathode',
    toComponentId: 'esp32-1',
    toPinId: 'gnd',
    color: '#1E293B',
  },
];
