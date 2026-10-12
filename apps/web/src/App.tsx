import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { AppShell } from './components/layout/AppShell.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { RegisterOrgPage } from './pages/RegisterOrgPage.js';
import { OrgStatusPage } from './pages/OrgStatusPage.js';
import { OnboardingWizardPage } from './pages/OnboardingWizardPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { JourneyPage } from './pages/JourneyPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { GoalsPage } from './pages/GoalsPage.js';
import { SkillsPage } from './pages/SkillsPage.js';
import { LearningPage } from './pages/LearningPage.js';
import { CareerPage } from './pages/CareerPage.js';
import { TeamOverviewPage } from './pages/TeamOverviewPage.js';
import { TeamMemberDetailPage } from './pages/TeamMemberDetailPage.js';
import { TeamPerformancePage } from './pages/TeamPerformancePage.js';
import { ProjectsPage } from './pages/ProjectsPage.js';
import { PeoplePage } from './pages/PeoplePage.js';
import { AnalyticsPage } from './pages/AnalyticsPage.js';
import { DocumentsPage } from './pages/DocumentsPage.js';
import { AuditPage } from './pages/AuditPage.js';

// Route guard component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, isOnboardingCompleted } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08090A] flex items-center justify-center text-neutral-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-xs">Authenticating session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isOnboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

const OnboardingRoute: React.FC = () => {
  const { user, isLoading, isOnboardingCompleted } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08090A] flex items-center justify-center text-neutral-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isOnboardingCompleted) {
    return <Navigate to="/" replace />;
  }

  return <OnboardingWizardPage />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register-org" element={<RegisterOrgPage />} />
          <Route path="/org-status" element={<OrgStatusPage />} />

          {/* Onboarding Wizard Route */}
          <Route path="/onboarding" element={<OnboardingRoute />} />

          {/* Authenticated Application Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppShell pageTitle="Executive Dashboard">
                  <DashboardPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/journey"
            element={
              <ProtectedRoute>
                <AppShell pageTitle="My Journey Timeline">
                  <JourneyPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppShell pageTitle="Employee 360 Dossier">
                  <ProfilePage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <ProtectedRoute>
                <AppShell pageTitle="Goals & Key Results (OKRs)">
                  <GoalsPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/skills"
            element={
              <ProtectedRoute>
                <AppShell pageTitle="Skill Matrix & Gap Detection">
                  <SkillsPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning"
            element={
              <ProtectedRoute>
                <AppShell pageTitle="Learning Academy & Pathways">
                  <LearningPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/career"
            element={
              <ProtectedRoute>
                <AppShell pageTitle="Career Architecture & Promotion">
                  <CareerPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team"
            element={
              <ProtectedRoute>
                <AppShell pageTitle="Team Overview & Roster">
                  <TeamOverviewPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/:id"
            element={
              <ProtectedRoute>
                <AppShell pageTitle="Team Member Dossier">
                  <TeamMemberDetailPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team-performance"
            element={
              <ProtectedRoute>
                <AppShell pageTitle="Team Performance & Reviews">
                  <TeamPerformancePage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <AppShell pageTitle="Initiatives & Projects">
                  <ProjectsPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/people"
            element={
              <ProtectedRoute>
                <AppShell pageTitle="People Directory">
                  <PeoplePage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AppShell pageTitle="Workforce Analytics">
                  <AnalyticsPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <AppShell pageTitle="Policies & RAG Knowledge Base">
                  <DocumentsPage />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit"
            element={
              <ProtectedRoute>
                <AppShell pageTitle="System Audit Log">
                  <AuditPage />
                </AppShell>
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
