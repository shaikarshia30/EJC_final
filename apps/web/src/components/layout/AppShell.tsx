import React from 'react';
import { Sidebar } from './Sidebar.js';
import { TopBar } from './TopBar.js';
import { AIAssistantDrawer } from '../ai/AIAssistantDrawer.js';

export interface AppShellProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export const AppShell: React.FC<AppShellProps> = ({ children, pageTitle }) => {
  return (
    <div className="flex min-h-screen bg-canvas text-fg">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title={pageTitle} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Slide-over Native AI Assistant Drawer */}
      <AIAssistantDrawer />
    </div>
  );
};
