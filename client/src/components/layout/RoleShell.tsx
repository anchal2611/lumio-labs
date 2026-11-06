import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const RoleShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-brand-canvas text-brand-text">
      <Navbar />
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
