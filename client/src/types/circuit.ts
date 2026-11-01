export type CircuitComponentType = 
  | 'esp32'
  | 'breadboard'
  | 'led'
  | 'resistor'
  | 'pushbutton'
  | 'battery'
  | 'buzzer'
  | 'servo'
  | 'irsensor'
  | 'lcd';

export interface PinDefinition {
  id: string;
  name: string;
  type: 'power' | 'ground' | 'digital' | 'analog' | 'anode' | 'cathode';
  position: 'top' | 'bottom' | 'left' | 'right';
}

export interface CircuitComponent {
  id: string;
  type: CircuitComponentType;
  label: string;
  x: number;
  y: number;
  properties: {
    resistance?: number; // ohms
    color?: string; // for LED
    voltage?: number; // for battery
    state?: boolean; // on/off for button, led
    servoAngle?: number; // 0-180
    lcdText?: string;
    irDetected?: boolean;
    gpioState?: Record<string, boolean | number>;
  };
  pins: PinDefinition[];
}

export interface WireConnection {
  id: string;
  fromComponentId: string;
  fromPinId: string;
  toComponentId: string;
  toPinId: string;
  color: string;
}

export interface CircuitSimulationState {
  isRunning: boolean;
  isPowered: boolean;
  simulationTimeSeconds: number;
  activeLeds: Record<string, boolean>;
  activeBuzzer: Record<string, boolean>;
  activeServos: Record<string, number>;
  serialLogs: { timestamp: string; message: string }[];
  errorMessage?: string;
}
