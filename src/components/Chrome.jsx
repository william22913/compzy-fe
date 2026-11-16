import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { StarIcon } from './Icons';
import en from '../locales';

export function Header() {
  const { status, user, signOut } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const signed = status === 'member';
  const onConfirmation = pathname.startsWith('/order-confirmation');

  async function handleSignOut() {
    try {
      await signOut();
      // The builder says the customer is signed out; REQ-028 keeps the build.
      navigate('/', { state: { signedOut: true } });
    } catch {
      // The session is still live on the server: show it, do not claim a
      // sign-out the app did not perform.
      window.location.reload();
    }
  }

  return (
    <header className="hdr">
      <div className="hdr__in">
        <Link className="brand" to="/" aria-label={en.chrome.brandAria}>
          <span className="brand__disc">
            <StarIcon />
          </span>
          <span className="brand__word">{en.chrome.brand}</span>
        </Link>

        <nav className="nav" aria-label={en.chrome.navLabel}>
          <Link to="/" aria-current={pathname === '/' ? 'page' : undefined}>
            {en.chrome.build}
          </Link>
          {signed && !onConfirmation && (
            <Link
              to="/order-review"
              aria-current={pathname === '/order-review' ? 'page' : undefined}
            >
              {en.chrome.review}
            </Link>
          )}
          {signed ? (
            <button type="button" onClick={handleSignOut}>
              {en.chrome.signOut}
            </button>
          ) : (
            <Link
              to="/sign-in"
              aria-current={pathname === '/sign-in' ? 'page' : undefined}
            >
              {en.chrome.signIn}
            </Link>
          )}
        </nav>

        {signed && (
          <span className="who">
            <span className="name">{user.fullName}</span>
          </span>
        )}
      </div>
    </header>
  );
}

export function Footer() {
  const { status } = useAuth();
  const { pathname } = useLocation();
  // The confirmation page is a closed chapter: the footer offers the way back
  // in, not the member links, as the design has it.
  const signed = status === 'member' && !pathname.startsWith('/order-confirmation');

  return (
    <footer className="ftr">
      <div className="ftr__in">
        <div className="ftr__col">
          <p className="ftr__mark">
            <span className="brand__disc">
              <StarIcon />
            </span>
            <span className="brand__word">{en.chrome.brand}</span>
          </p>
          <p className="ftr__note">{en.chrome.footerNote}</p>
          <span className="label">{en.chrome.footerQuickLinks}</span>
          <nav className="ftr__links" aria-label={en.chrome.footerLinksLabel}>
            <Link to="/">{en.chrome.footerBuild}</Link>
            {signed ? (
              <Link to="/order-review">{en.chrome.footerReview}</Link>
            ) : (
              <>
                <Link to="/sign-in">{en.chrome.footerSignIn}</Link>
                <Link to="/sign-up">{en.chrome.footerCreate}</Link>
              </>
            )}
          </nav>
        </div>
        <div className="ftr__col">
          <span className="ftr__star">
            <StarIcon />
          </span>
          <h2>{en.chrome.footerHeading}</h2>
          <p className="ftr__note">{en.chrome.footerBody}</p>
        </div>
        <div className="ftr__photo">
          <img src="/assets/img/footer.webp" alt={en.chrome.footerPhotoAlt} />
        </div>
      </div>
      <div className="ftr__bar">
        <span>{en.chrome.footerBottom}</span>
        <nav aria-label={en.chrome.footerBarLabel}>
          <Link to="/">{en.chrome.footerBarBuild}</Link>
          {signed ? (
            <Link to="/order-review">{en.chrome.footerBarReview}</Link>
          ) : (
            <Link to="/sign-in">{en.chrome.footerBarSignIn}</Link>
          )}
        </nav>
      </div>
    </footer>
  );
}
