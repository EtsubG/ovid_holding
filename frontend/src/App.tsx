// frontend/src/App.tsx
import { Suspense, lazy } from 'react';
import { AppProvider, useApp } from '@/lib/app-context';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/sonner';
import { CandidateDrawer } from '@/components/CandidateDrawer';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const Home = lazy(() => import('@/pages/Home').then((m) => ({ default: m.Home })));
const Vacancies = lazy(() => import('@/pages/Vacancies').then((m) => ({ default: m.Vacancies })));
const VacancyDetail = lazy(() => import('@/pages/VacancyDetail').then((m) => ({ default: m.VacancyDetail })));
const Companies = lazy(() => import('@/pages/Companies').then((m) => ({ default: m.Companies })));
const TalentPool = lazy(() => import('@/pages/TalentPool').then((m) => ({ default: m.TalentPool })));
const About = lazy(() => import('@/pages/About').then((m) => ({ default: m.About })));
const Internships = lazy(() => import('@/pages/Internships').then((m) => ({ default: m.Internships })));
const FAQs = lazy(() => import('@/pages/FAQs').then((m) => ({ default: m.FAQs })));
const Contact = lazy(() => import('@/pages/Contact').then((m) => ({ default: m.Contact })));
const Privacy = lazy(() => import('@/pages/Privacy').then((m) => ({ default: m.Privacy })));
const Login = lazy(() => import('@/pages/Login').then((m) => ({ default: m.Login })));

const HRDashboard = lazy(() => import('@/pages/hr/HRDashboard').then((m) => ({ default: m.HRDashboard })));
const HRPipeline = lazy(() => import('@/pages/hr/HRPipeline').then((m) => ({ default: m.HRPipeline })));
const HRTalent = lazy(() => import('@/pages/hr/HRTalent').then((m) => ({ default: m.HRTalent })));
const HRVacancies = lazy(() => import('@/pages/hr/HRVacancies').then((m) => ({ default: m.HRVacancies })));



function Router() {
  const { page, hrMode } = useApp();
  const { isAuthenticated } = useAuth();

  const renderPage = () => {
    switch (page) {
      // Public
      case 'home': return <Home />;
      case 'vacancies': return <Vacancies />;
      case 'vacancy-detail': return <VacancyDetail />;
      case 'companies': return <Companies />;
      case 'talent-pool': return <TalentPool />;
      case 'about': return <About />;
      case 'internships': return <Internships />;
      case 'faqs': return <FAQs />;
      case 'contact': return <Contact />;
      case 'privacy': return <Privacy />;
      case 'login': return <Login />;

      // Protected HR pages
      case 'hr-dashboard':
        return (
          <ProtectedRoute allow={['admin', 'holding_hr', 'company_hr', 'management']}>
            <HRDashboard />
          </ProtectedRoute>
        );
      case 'hr-pipeline':
        return (
          <ProtectedRoute allow={['admin', 'holding_hr', 'company_hr']}>
            <HRPipeline />
          </ProtectedRoute>
        );
      case 'hr-talent':
        return (
          <ProtectedRoute allow={['admin', 'holding_hr', 'company_hr', 'management']}>
            <HRTalent />
          </ProtectedRoute>
        );

      case 'hr-vacancies':
  return (
    <ProtectedRoute allow={['admin', 'holding_hr', 'company_hr']}>
      <HRVacancies />
    </ProtectedRoute>
  );  

      default:
        return <Home />;
    }
  };

  // Hide Footer/Navbar on login page
  const isLoginPage = page === 'login';

  if (isLoginPage) {
    return (
      <Suspense fallback={null}>
        <Login />
        <Toaster position="top-right" richColors />
      </Suspense>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background bg-grain">
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
              Loading page...
            </div>
          }
        >
          <div key={page} className="animate-fade-in">
            {renderPage()}
          </div>
        </Suspense>
      </main>
      {!hrMode && <Footer />}
      <CandidateDrawer />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <Router />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </AppProvider>
  );
}

export default App;