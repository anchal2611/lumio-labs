import React, { useState } from 'react';
import { Settings, Server, Shield, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { config } from '../../config/env';
import { useToast } from '../../contexts/ToastContext';

export const AdminSettings: React.FC = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [demoMode, setDemoMode] = useState(config.isDemoMode);
  const toast = useToast();

  const handleSave = () => {
    toast.success('Settings Saved', 'Platform administrative configuration updated.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-amber-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
            Platform Infrastructure Configuration
          </h1>
        </div>
        <p className="text-xs text-brand-muted">
          Inspect execution cluster adapters, database providers, and university-wide operational flags
        </p>
      </div>

      {/* Services Health */}
      <Card className="border border-slate-200/80">
        <CardHeader>
          <CardTitle>Connected Integration Adapters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-navy-900">Code Execution Engine (Judge0 / Sandbox)</span>
                <Badge variant="aqua" size="sm">
                  Active Adapter
                </Badge>
              </div>
              <p className="text-[11px] text-brand-muted mt-0.5">
                Pluggable sandbox adapter supporting local WASM &amp; Judge0 cluster dispatch
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Operational
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-navy-900">Relational Database Engine (SQLite WASM)</span>
                <Badge variant="success" size="sm">
                  In-Browser
                </Badge>
              </div>
              <p className="text-[11px] text-brand-muted mt-0.5">
                Local WebAssembly binary runtime with zero network latency
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Ready
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-navy-900">Real-Time Collaboration Service</span>
                <Badge variant="aqua" size="sm">
                  WebSocket / P2P
                </Badge>
              </div>
              <p className="text-[11px] text-brand-muted mt-0.5">
                Multi-participant presence, cursor syncing, and chat broadcasting
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Connected
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Operational Flags */}
      <Card className="border border-slate-200/80">
        <CardHeader>
          <CardTitle>System Feature Flags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="rounded border-slate-300 text-amber-600 focus:ring-amber-500/20"
            />
            <div>
              <span className="font-semibold text-navy-900 block">
                University Examination Lockdown Mode
              </span>
              <span className="text-brand-muted text-[11px]">
                Restricts peer collaboration rooms during scheduled invigilated exam windows
              </span>
            </div>
          </label>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button size="sm" variant="accent" onClick={handleSave}>
              Apply System Flags
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
