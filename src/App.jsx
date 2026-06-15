import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { profileIsComplete, useAuth } from './context/AuthProvider.jsx';
import { AppLayout } from './components/AppLayout.jsx';
import { Spinner } from './components/Spinner.jsx';
import { AuthPage } from './pages/AuthPage.jsx';
import { OnboardingPage } from './pages/OnboardingPage.jsx';
import { AlbumPage } from './pages/AlbumPage.jsx';
import { SectionPage } from './pages/SectionPage.jsx';
import { GroupPage } from './pages/GroupPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { QuickRegisterPage } from './pages/QuickRegisterPage.jsx';

function FullScreenLoader() {
  return (
    <div className="flex h-full items-center justify-center text-brand-accent">
      <Spinner size={36} />
    </div>
  );
}

export default function App() {
  const { session, profile, loading } = useAuth();
  if (loading) return <FullScreenLoader />;

  const authed = !!session;
  const complete = profileIsComplete(profile);
  const home = authed ? (complete ? '/album' : '/onboarding') : '/login';

  // guarda das rotas autenticadas
  const RequireApp = () => {
    if (!authed) return <Navigate to="/login" replace />;
    if (!complete) return <Navigate to="/onboarding" replace />;
    return <Outlet />;
  };

  return (
    <Routes>
      <Route path="/login" element={authed ? <Navigate to={home} replace /> : <AuthPage />} />
      <Route
        path="/onboarding"
        element={
          !authed ? (
            <Navigate to="/login" replace />
          ) : complete ? (
            <Navigate to="/album" replace />
          ) : (
            <OnboardingPage />
          )
        }
      />
      <Route element={<RequireApp />}>
        <Route element={<AppLayout />}>
          <Route path="/album" element={<AlbumPage />} />
          <Route path="/album/:sectionCode" element={<SectionPage />} />
          <Route path="/grupo" element={<GroupPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/cadastro" element={<QuickRegisterPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={home} replace />} />
    </Routes>
  );
}
