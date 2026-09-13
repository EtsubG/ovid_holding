import { Suspense, lazy } from 'react';
import { AppProvider, useApp } from '@/lib/app-context';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/sonner';
import { CandidateDrawer } from '@/components/CandidateDrawer';

const Home = lazy(() => import('@/pages/Home').then((module) => ({ default: module.Home })));
const Vacancies = lazy(() => import('@/pages/Vacancies').then((module) => ({ default: module.Vacancies })));
const VacancyDetail = lazy(() => import('@/pages/VacancyDetail').then((module) => ({ default: module.VacancyDetail })));
const Companies = lazy(() => import('@/pages/Companies').then((module) => ({ default: module.Companies })));
const TalentPool = lazy(() => import('@/pages/TalentPool').then((module) => ({ default: module.TalentPool })));
const About = lazy(() => import('@/pages/About').then((module) => ({ default: module.About })));
const Internships = lazy(() => import('@/pages/Internships').then((module) => ({ default: module.Internships })));
const FAQs = lazy(() => import('@/pages/FAQs').then((module) => ({ default: module.FAQs })));
const Contact = lazy(() => import('@/pages/Contact').then((module) => ({ default: module.Contact })));
const Privacy = lazy(() => import('@/pages/Privacy').then((module) => ({ default: module.Privacy })));
const HRDashboard = lazy(() => import('@/pages/hr/HRDashboard').then((module) => ({ default: module.HRDashboard })));
const HRPipeline = lazy(() => import('@/pages/hr/HRPipeline').then((module) => ({ default: module.HRPipeline })));
const HRTalent = lazy(() => import('@/pages/hr/HRTalent').then((module) => ({ default: module.HRTalent })));

function Router() {
  const { page, hrMode } = useApp();

  const renderPage = () => {
    switch (page) {
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
      case 'hr-dashboard': return <HRDashboard />;
      case 'hr-pipeline': return <HRPipeline />;
      case 'hr-talent': return <HRTalent />;
      default: return <Home />;
    }
  };

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
      <Router />
      <Toaster position="top-right" richColors />
    </AppProvider>
  );
}

export default App;
