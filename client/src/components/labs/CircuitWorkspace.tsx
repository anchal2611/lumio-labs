import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Play,
  Square,
  RotateCcw,
  Plus,
  Terminal,
  Activity,
  Cpu,
  Radio,
  Lightbulb,
  Sliders,
  Volume2,
  Eye,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  CircuitComponent,
  WireConnection,
  CircuitSimulationState,
} from '../../types/circuit';
import {
  runCircuitStep,
  DEFAULT_CIRCUIT_COMPONENTS,
  DEFAULT_CIRCUIT_WIRES,
} from '../../services/circuitEngine';
import { useToast } from '../../contexts/ToastContext';

export const CircuitWorkspace: React.FC = () => {
  const [components, setComponents] = useState<CircuitComponent[]>(DEFAULT_CIRCUIT_COMPONENTS);
  const [wires, setWires] = useState<WireConnection[]>(DEFAULT_CIRCUIT_WIRES);
  const [isSimulating, setIsSimulating] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [buttonPressed, setButtonPressed] = useState<Record<string, boolean>>({ 'btn-1': false });
  const [simulationState, setSimulationState] = useState<CircuitSimulationState | null>(null);
  const [baudRate, setBaudRate] = useState('115200');
  const [serialLogs, setSerialLogs] = useState<{ timestamp: string; message: string }[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  const toast = useToast();
  const simTimerRef = useRef<any>(null);

  useEffect(() => {
    if (isSimulating) {
      simTimerRef.current = setInterval(() => {
        setStepCount((prev) => {
          const next = prev + 1;
          const state = runCircuitStep(components, wires, next, buttonPressed);
          setSimulationState(state);
          if (state.serialLogs.length > 0) {
            setSerialLogs((logs) => [...logs, ...state.serialLogs].slice(-40));
          }
          return next;
        });
      }, 600);
    } else {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    }
    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, [isSimulating, components, wires, buttonPressed]);

  const handleStartSim = () => {
    setIsSimulating(true);
    setStepCount(0);
    const initial = runCircuitStep(components, wires, 0, buttonPressed);
    setSimulationState(initial);
    setSerialLogs(initial.serialLogs);
    toast.success('Simulation Started', 'ESP32 virtual clock running at 240MHz.');
  };

  const handleStopSim = () => {
    setIsSimulating(false);
    toast.info('Simulation Stopped', 'Virtual power supply disconnected.');
  };

  const handleReset = () => {
    setIsSimulating(false);
    setComponents(DEFAULT_CIRCUIT_COMPONENTS);
    setWires(DEFAULT_CIRCUIT_WIRES);
    setButtonPressed({ 'btn-1': false });
    setSimulationState(null);
    setSerialLogs([]);
    toast.info('Reset Completed', 'Restored default ESP32 LED breadboard circuit.');
  };

  const handleToggleButton = (btnId: string) => {
    const nextState = !buttonPressed[btnId];
    setButtonPressed((prev) => ({ ...prev, [btnId]: nextState }));

    if (isSimulating) {
      const state = runCircuitStep(components, wires, stepCount, {
        ...buttonPressed,
        [btnId]: nextState,
      });
      setSimulationState(state);
      setSerialLogs((logs) => [
        ...logs,
        {
          timestamp: new Date().toLocaleTimeString(),
          message: `[INTERRUPT] Tactile Pushbutton ${btnId} State -> ${nextState ? 'PRESSED (CLOSED CIRCUIT)' : 'RELEASED (OPEN)'}`,
        },
      ]);
    }
  };

  const handleAddComponent = (type: any, label: string) => {
    const newComp: CircuitComponent = {
      id: `${type}-${Date.now()}`,
      type,
      label,
      x: 200 + Math.random() * 200,
      y: 120 + Math.random() * 100,
      properties: {
        voltage: type === 'battery' ? 9.0 : undefined,
        resistance: type === 'resistor' ? 1000 : undefined,
        color: type === 'led' ? '#22C55E' : undefined,
      },
      pins: [
        { id: 'p1', name: 'Pin 1', type: 'digital', position: 'left' },
        { id: 'p2', name: 'Pin 2', type: 'digital', position: 'right' },
      ],
    };

    setComponents((prev) => [...prev, newComp]);
    toast.success('Component Added', `Placed ${label} onto breadboard workspace.`);
  };

  return (
    <div className="flex flex-col h-[820px] bg-white rounded-xl border border-slate-200/80 shadow-subtle overflow-hidden">
      {/* Top Circuit Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-navy-900 font-bold text-xs">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Virtual Circuit Simulation Engine</span>
          </div>
          <Badge variant={isSimulating ? 'success' : 'neutral'} size="sm">
            {isSimulating ? 'Simulation Live' : 'Idle'}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={handleReset}
          >
            Reset Circuit
          </Button>

          {isSimulating ? (
            <Button
              size="sm"
              variant="danger"
              leftIcon={<Square className="w-3.5 h-3.5 fill-white" />}
              onClick={handleStopSim}
            >
              Stop Simulation
            </Button>
          ) : (
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Play className="w-3.5 h-3.5 fill-white" />}
              onClick={handleStartSim}
            >
              Start Simulation
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Component Palette + Center Canvas + Right Serial Monitor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Palette */}
        <div className="w-60 bg-slate-50/70 border-r border-slate-200/80 p-3 flex flex-col shrink-0">
          <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">
            Component Library
          </h4>
          <p className="text-[11px] text-brand-muted mb-3 leading-snug">
            Click any component to instantiate it on the virtual schematic breadboard:
          </p>

          <div className="space-y-1.5 overflow-y-auto flex-1">
            <button
              onClick={() => handleAddComponent('esp32', 'NodeMCU ESP32')}
              className="w-full flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 hover:border-primary text-xs font-medium text-navy-900 shadow-2xs transition-all hover:translate-x-0.5"
            >
              <Cpu className="w-4 h-4 text-primary" />
              <span>ESP32 MCU Board</span>
            </button>
            <button
              onClick={() => handleAddComponent('led', 'Red 5mm LED')}
              className="w-full flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 hover:border-primary text-xs font-medium text-navy-900 shadow-2xs transition-all hover:translate-x-0.5"
            >
              <Lightbulb className="w-4 h-4 text-emerald-500" />
              <span>LED Light Emitting</span>
            </button>
            <button
              onClick={() => handleAddComponent('pushbutton', 'Pushbutton Switch')}
              className="w-full flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 hover:border-primary text-xs font-medium text-navy-900 shadow-2xs transition-all hover:translate-x-0.5"
            >
              <Sliders className="w-4 h-4 text-blue-500" />
              <span>Tactile Push Button</span>
            </button>
            <button
              onClick={() => handleAddComponent('resistor', '1kΩ Resistor')}
              className="w-full flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 hover:border-primary text-xs font-medium text-navy-900 shadow-2xs transition-all hover:translate-x-0.5"
            >
              <Activity className="w-4 h-4 text-amber-500" />
              <span>Resistor (220Ω / 1kΩ)</span>
            </button>
            <button
              onClick={() => handleAddComponent('battery', '9V DC Battery')}
              className="w-full flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 hover:border-primary text-xs font-medium text-navy-900 shadow-2xs transition-all hover:translate-x-0.5"
            >
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>9V DC Battery Pack</span>
            </button>
            <button
              onClick={() => handleAddComponent('buzzer', 'Piezo Buzzer')}
              className="w-full flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 hover:border-primary text-xs font-medium text-navy-900 shadow-2xs transition-all hover:translate-x-0.5"
            >
              <Volume2 className="w-4 h-4 text-purple-500" />
              <span>Piezo Buzzer</span>
            </button>
            <button
              onClick={() => handleAddComponent('irsensor', 'IR Proximity Sensor')}
              className="w-full flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 hover:border-primary text-xs font-medium text-navy-900 shadow-2xs transition-all hover:translate-x-0.5"
            >
              <Eye className="w-4 h-4 text-red-500" />
              <span>IR Proximity Sensor</span>
            </button>
          </div>
        </div>

        {/* Center Interactive Circuit Canvas */}
        <div className="flex-1 bg-slate-900 relative overflow-hidden flex flex-col">
          {/* Breadboard Grid Background */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#38BDF8 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Canvas Floating Overlay Controls */}
          <div className="absolute top-3 left-3 z-10 bg-navy-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-[11px] text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-aqua animate-ping" />
            <span>Interactive Breadboard Canvas • Click Push Button to Complete Circuit</span>
          </div>

          {/* Interactive Components Visual Stage */}
          <div className="flex-1 relative p-8 flex items-center justify-center">
            <div className="relative w-full max-w-3xl h-[420px] bg-slate-950/70 border border-slate-800 rounded-2xl p-6 shadow-2xl flex items-center justify-around flex-wrap gap-4">
              {/* Render Components */}
              {components.map((comp) => {
                const isLedOn = simulationState?.activeLeds[comp.id];
                const isBtnPressed = buttonPressed[comp.id];

                return (
                  <div
                    key={comp.id}
                    onClick={() => setSelectedComponentId(comp.id)}
                    className={`relative p-4 rounded-xl border transition-all cursor-pointer select-none ${
                      selectedComponentId === comp.id
                        ? 'border-brand-aqua ring-2 ring-brand-aqua/30'
                        : 'border-slate-700 bg-navy-900/90 hover:border-slate-500'
                    }`}
                  >
                    {/* Component Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {comp.type}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-white mb-2">{comp.label}</h5>

                    {/* Interactive Widget per Type */}
                    {comp.type === 'esp32' && (
                      <div className="w-36 h-28 bg-emerald-950/80 border border-emerald-600/50 rounded-lg p-2.5 flex flex-col justify-between text-[10px] text-emerald-300 font-mono">
                        <div className="flex justify-between items-center">
                          <span className="font-bold">ESP32-WROOM</span>
                          <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                        </div>
                        <div className="text-[9px] text-slate-400">
                          GPIO: D2(OUT) | D14(IN)
                        </div>
                        <div className="flex justify-between text-[8px] text-emerald-400">
                          <span>3V3</span>
                          <span>GND</span>
                        </div>
                      </div>
                    )}

                    {comp.type === 'pushbutton' && (
                      <div className="flex flex-col items-center gap-2 py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleButton(comp.id);
                          }}
                          className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-bold text-xs shadow-lg transition-transform active:scale-95 ${
                            isBtnPressed
                              ? 'bg-rose-500 border-rose-300 text-white shadow-rose-500/50 scale-95'
                              : 'bg-slate-700 border-slate-500 text-slate-200 hover:bg-slate-600'
                          }`}
                        >
                          {isBtnPressed ? 'ON' : 'PRESS'}
                        </button>
                        <span className="text-[10px] text-slate-400">
                          {isBtnPressed ? 'Circuit Closed' : 'Circuit Open'}
                        </span>
                      </div>
                    )}

                    {comp.type === 'led' && (
                      <div className="flex flex-col items-center gap-2 py-1">
                        <div
                          className={`w-12 h-12 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                            isLedOn
                              ? 'bg-cyan-400 border-white shadow-[0_0_25px_8px_rgba(103,232,249,0.85)] scale-110'
                              : 'bg-slate-800 border-slate-600 opacity-60'
                          }`}
                        >
                          <Lightbulb
                            className={`w-6 h-6 ${isLedOn ? 'text-white' : 'text-slate-600'}`}
                          />
                        </div>
                        <span className={`text-[10px] font-bold ${isLedOn ? 'text-cyan-300' : 'text-slate-500'}`}>
                          {isLedOn ? '⚡ ILLUMINATED (3.3V)' : 'OFF (0V)'}
                        </span>
                      </div>
                    )}

                    {comp.type === 'resistor' && (
                      <div className="w-28 h-10 bg-amber-950/60 border border-amber-600/40 rounded flex items-center justify-center gap-1">
                        <span className="w-1.5 h-6 bg-red-600 rounded-xs" />
                        <span className="w-1.5 h-6 bg-red-600 rounded-xs" />
                        <span className="w-1.5 h-6 bg-amber-500 rounded-xs" />
                        <span className="w-1.5 h-6 bg-yellow-400 rounded-xs" />
                        <span className="text-[10px] font-mono text-amber-200 ml-2">220Ω</span>
                      </div>
                    )}

                    {/* Pin indicators */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-[9px] text-slate-400">
                      {comp.pins.map((p) => (
                        <span key={p.id} className="bg-slate-800 px-1 py-0.5 rounded">
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Virtual Wires Status Bar */}
          <div className="p-3 bg-navy-950 border-t border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Active Wires:</span>
              <span className="font-mono text-brand-aqua">{wires.length} Virtual Jumpers</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Loop Status:</span>
              <span className={simulationState?.isPowered ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                {simulationState?.isPowered ? 'Conductive Loop Closed' : 'Open Circuit'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Interactive Hardware Emulation Engine v1.0
            </span>
          </div>
        </div>

        {/* Right Virtual Serial Monitor */}
        <div className="w-80 bg-navy-950 border-l border-slate-800 flex flex-col shrink-0 font-mono text-xs">
          <div className="p-3 bg-navy-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-brand-aqua font-bold text-xs">
              <Terminal className="w-3.5 h-3.5" />
              <span>Virtual Serial Monitor</span>
            </div>
            <select
              value={baudRate}
              onChange={(e) => setBaudRate(e.target.value)}
              className="bg-navy-950 border border-slate-700 text-slate-300 text-[10px] rounded px-2 py-0.5"
            >
              <option value="9600">9600 baud</option>
              <option value="115200">115200 baud</option>
            </select>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-1 text-[11px] text-emerald-400 leading-relaxed">
            {serialLogs.length === 0 ? (
              <p className="text-slate-600 italic">
                Start simulation to open COM port and stream UART serial frames...
              </p>
            ) : (
              serialLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-slate-500 shrink-0 select-none">[{log.timestamp}]</span>
                  <span className="text-slate-200 whitespace-pre-wrap">{log.message}</span>
                </div>
              ))
            )}
          </div>

          <div className="p-2 border-t border-slate-800 bg-navy-900 flex items-center gap-2">
            <input
              type="text"
              placeholder="Send AT / Serial command..."
              className="flex-1 bg-navy-950 border border-slate-700 rounded px-2 py-1 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-primary"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const target = e.currentTarget;
                  if (target.value.trim()) {
                    setSerialLogs((prev) => [
                      ...prev,
                      {
                        timestamp: new Date().toLocaleTimeString(),
                        message: `> [TX] ${target.value}`,
                      },
                    ]);
                    target.value = '';
                  }
                }
              }}
            />
            <Button size="sm" variant="accent" className="text-xs px-2.5">
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
