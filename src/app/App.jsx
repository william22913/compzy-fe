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
import en from '../locales';

function titleFor(pathname) {
  if (pathname === '/') return en.meta.title;
  if (pathname === '/sign-in') return en.meta.signInTitle;
  if (pathname === '/sign-up') return en.meta.signUpTitle;
  if (pathname === '/order-review') return en.meta.reviewTitle;
  if (pathname.startsWith('/order-confirmation')) return en.meta.confirmationTitle;
  return en.meta.notFoundTitle;
}

function Shell() {
  const { pathname, state } = useLocation();
  const night = pathname.startsWith('/order-confirmation');
  const noBar = pathname !== '/';

  useEffect(() => {
    document.title = titleFor(pathname);
    if (!state || !state.focus) window.scrollTo(0, 0);
  }, [pathname, state]);

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
    <BrowserRouter>
      <AuthProvider>
        <CatalogueProvider>
          <BuildProvider>
            <Shell />
          </BuildProvider>
        </CatalogueProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
