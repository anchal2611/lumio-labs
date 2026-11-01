import React, { useState } from 'react';
import { Settings, Moon, Sun, Monitor, Bell, Shield, Sliders } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../contexts/ToastContext';

export const StudentSettings: React.FC = () => {
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState('13');
  const [autoComplete, setAutoComplete] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const toast = useToast();

  const handleSave = () => {
    toast.success('Preferences Saved', 'IDE and laboratory settings updated.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
            Laboratory Settings
          </h1>
        </div>
        <p className="text-xs text-brand-muted">
          Configure editor preferences, default simulation themes, and notification channels
        </p>
      </div>

      <Card className="border border-slate-200/80">
        <CardHeader>
          <CardTitle>Monaco IDE Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">Default Editor Theme</label>
              <select
                value={editorTheme}
                onChange={(e) => setEditorTheme(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs text-brand-text focus:outline-none focus:border-primary"
              >
                <option value="vs-dark">Dark Navy (Default)</option>
                <option value="light">Crisp Light</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">Editor Font Size</label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs text-brand-text focus:outline-none focus:border-primary"
              >
                <option value="12">12 px</option>
                <option value="13">13 px (Recommended)</option>
                <option value="14">14 px</option>
                <option value="16">16 px</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoComplete}
                onChange={(e) => setAutoComplete(e.target.checked)}
                className="rounded border-slate-300 text-primary focus:ring-primary/20"
              />
              <span className="font-medium text-navy-900">
                Enable Monaco IntelliSense and autocompletion
              </span>
            </label>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="rounded border-slate-300 text-primary focus:ring-primary/20"
              />
              <span className="font-medium text-navy-900">
                Receive instant notifications on teacher evaluations and peer room invites
              </span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button size="sm" variant="primary" onClick={handleSave}>
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
