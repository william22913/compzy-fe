import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertIcon } from '../../components/Icons';
import { Notice } from '../../components/Notice';
import { formatRupiah } from '../../helpers/money';
import { safeReturn, signUpHref } from '../../helpers/returnTo';
import { validateSignIn } from '../../helpers/validation';
import { fmt, lookup } from '../../locales';
import { useAuth } from '../../store/AuthContext';
import { useBuild } from '../../store/BuildContext';
import { useCatalogue } from '../../store/CatalogueContext';
import { useT } from '../../store/LanguageContext';
import { AuthLayout } from './AuthLayout';

export function SignInPage() {
  const { status, signIn } = useAuth();
  const { status: catalogueStatus } = useCatalogue();
  const build = useBuild();
  const t = useT();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('return');
  const expired = searchParams.get('expired') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'member') navigate(safeReturn(returnTo), { replace: true });
  }, [status, returnTo, navigate]);

  const showBuild = catalogueStatus === 'ready' && build.selectedCount > 0;

  // Every message is the dictionary's own, keyed by the API's stable code —
  // never the server's English sentence (REQ-049).
  function fieldText(key) {
    return t.auth.fieldErrors[key] || t.auth.genericFieldError;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateSignIn({ email, password });
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await signIn({ email: email.trim(), password });
    } catch (error) {
      if (error.code === 'INVALID_CREDENTIALS') {
        setFormError({
          tone: 'error',
          titleKey: 'auth.signIn.invalidTitle',
          bodyKey: 'auth.signIn.invalidBody',
        });
        // Keep the address, ask for the password again, as the contract says.
        setPassword('');
      } else if (
        error.code === 'VALIDATION_FAILED' &&
        Array.isArray(error.fields) &&
        error.fields.length > 0
      ) {
        const mapped = {};
        for (const item of error.fields) {
          if (item.field === 'email' || item.field === 'password') {
            mapped[item.field] = item.code;
          }
        }
        if (Object.keys(mapped).length > 0) setErrors(mapped);
        else {
          setFormError({
            tone: 'error',
            titleKey: 'auth.genericTitle',
            bodyKey: 'auth.genericBody',
            requestId: error.requestId,
          });
        }
      } else if (error.code === 'RATE_LIMITED') {
        setFormError({
          tone: 'error',
          titleKey: 'auth.rateLimitedTitle',
          bodyKey: 'auth.rateLimitedBody',
        });
      } else {
        setFormError({
          tone: 'error',
          titleKey: 'auth.genericTitle',
          bodyKey: 'auth.genericBody',
          requestId: error.requestId,
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow={t.auth.signIn.eyebrow}
      title={t.auth.signIn.title}
      lede={t.auth.signIn.lede}
      caption={t.auth.signIn.caption}
      notice={
        <>
          {showBuild && (
            <Notice tone="info" title={t.auth.buildSavedTitle}>
              <p>
                {fmt(t.auth.signIn.buildSavedBody, {
                  count: build.selectedCount,
                  total: formatRupiah(build.total),
                })}
              </p>
            </Notice>
          )}
          {expired && (
            <Notice tone="info" title={t.auth.signIn.sessionTitle}>
              <p>{t.auth.signIn.sessionBody}</p>
            </Notice>
          )}
          {formError && (
            <Notice tone={formError.tone} title={lookup(t, formError.titleKey)}>
              <p>{lookup(t, formError.bodyKey)}</p>
              {formError.requestId && (
                <p>{fmt(t.auth.reference, { requestId: formError.requestId })}</p>
              )}
            </Notice>
          )}
        </>
      }
      foot={
        <>
          {t.auth.signIn.foot}{' '}
          <Link className="textlink" to={signUpHref(returnTo)}>
            {t.auth.signIn.footAction}
          </Link>
        </>
      }
    >
      <form
        className="form"
        noValidate
        aria-busy={submitting ? 'true' : undefined}
        onSubmit={handleSubmit}
      >
        <div className={`field${errors.email ? ' is-invalid' : ''}`}>
          <label className="field__label" htmlFor="signin-email">
            {t.auth.email}
          </label>
          <input
            id="signin-email"
            name="email"
            type="email"
            value={email}
            required
            autoComplete="email"
            readOnly={submitting}
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={errors.email ? 'signin-email-err' : undefined}
            onChange={(event) => setEmail(event.target.value)}
          />
          {errors.email && (
            <span className="error" id="signin-email-err">
              <AlertIcon />
              <span>{fieldText(errors.email)}</span>
            </span>
          )}
        </div>

        <div className={`field${errors.password ? ' is-invalid' : ''}`}>
          <label className="field__label" htmlFor="signin-password">
            {t.auth.password}
          </label>
          <input
            id="signin-password"
            name="password"
            type="password"
            value={password}
            required
            autoComplete="current-password"
            readOnly={submitting}
            aria-invalid={errors.password ? 'true' : undefined}
            aria-describedby={errors.password ? 'signin-password-err' : undefined}
            onChange={(event) => setPassword(event.target.value)}
          />
          {errors.password && (
            <span className="error" id="signin-password-err">
              <AlertIcon />
              <span>{fieldText(errors.password)}</span>
            </span>
          )}
        </div>

        <div className="form__actions">
          <button className="btn btn--block" type="submit" disabled={submitting}>
            {submitting ? t.auth.signIn.submitting : t.auth.signIn.submit}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
