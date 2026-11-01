import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { DemoRoleSwitcher } from './DemoRoleSwitcher';

export const RoleShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-brand-canvas text-brand-text">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
      <DemoRoleSwitcher />
    </div>
  );
};
