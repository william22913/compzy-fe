import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Footer, Header } from '../components/Chrome';
import { BuilderPage } from '../features/builder/BuilderPage';
import { SignInPage } from '../features/auth/SignInPage';
import { SignUpPage } from '../features/auth/SignUpPage';
import { ReviewPage } from '../features/checkout/ReviewPage';
import { ConfirmationPage } from '../features/checkout/ConfirmationPage';
import { NotFoundPage } from '../features/errors/NotFoundPage';
import { AuthProvider } from '../store/AuthContext';
import { CatalogueProvider } from '../store/CatalogueContext';
import { BuildProvider } from '../store/BuildContext';
import { LanguageProvider, useLanguage, useT } from '../store/LanguageContext';
import { APP_BASE_PATH } from '../core/base';

function titleFor(t, pathname) {
  if (pathname === '/') return t.meta.title;
  if (pathname === '/sign-in') return t.meta.signInTitle;
  if (pathname === '/sign-up') return t.meta.signUpTitle;
  if (pathname === '/order-review') return t.meta.reviewTitle;
  if (pathname.startsWith('/order-confirmation')) return t.meta.confirmationTitle;
  return t.meta.notFoundTitle;
}

function Shell() {
  const { pathname, state } = useLocation();
  const { lang } = useLanguage();
  const t = useT();
  const night = pathname.startsWith('/order-confirmation');
  const noBar = pathname !== '/';

  useEffect(() => {
    document.title = titleFor(t, pathname);
    document.documentElement.lang = lang;
    if (!state || !state.focus) window.scrollTo(0, 0);
  }, [pathname, state, t, lang]);

  return (
    <div className={`page${night ? ' night' : ''}${noBar ? ' page--no-bar' : ''}`}>
      <Header />
      <Routes>
        <Route path="/" element={<BuilderPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/order-review" element={<ReviewPage />} />
        <Route path="/order-confirmation/:orderId" element={<ConfirmationPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={APP_BASE_PATH}>
      <AuthProvider>
        <LanguageProvider>
          <CatalogueProvider>
            <BuildProvider>
              <Shell />
            </BuildProvider>
          </CatalogueProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
