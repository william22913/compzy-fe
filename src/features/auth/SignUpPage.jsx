import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertIcon } from '../../components/Icons';
import { Notice } from '../../components/Notice';
import { formatRupiah } from '../../helpers/money';
import { safeReturn, signInHref } from '../../helpers/returnTo';
import { validateSignUp } from '../../helpers/validation';
import { fmt, lookup } from '../../locales';
import { useAuth } from '../../store/AuthContext';
import { useBuild } from '../../store/BuildContext';
import { useCatalogue } from '../../store/CatalogueContext';
import { useLanguage, useT } from '../../store/LanguageContext';
import { AuthLayout } from './AuthLayout';

const FIELD_NAMES = { full_name: 'fullName', email: 'email', password: 'password' };

export function SignUpPage() {
  const { status, register } = useAuth();
  const { status: catalogueStatus } = useCatalogue();
  const { lang } = useLanguage();
  const build = useBuild();
  const t = useT();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('return');
  const signInTo = signInHref(returnTo);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'member') navigate(safeReturn(returnTo), { replace: true });
  }, [status, returnTo, navigate]);

  const showBuild = catalogueStatus === 'ready' && build.selectedCount > 0;

  // The dictionary's own message, keyed by the API's stable `fields[].code`;
  // the server's English sentence is never shown on an Indonesian page.
  function errorText(key) {
    return t.auth.fieldErrors[key] || t.auth.genericFieldError;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateSignUp({ fullName, email, password });
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      // The language on screen at this moment is the account's language.
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        preferredLanguage: lang,
      });
    } catch (error) {
      if (error.code === 'EMAIL_TAKEN') {
        setErrors({ email: 'duplicate' });
      } else if (error.code === 'VALIDATION_FAILED' && error.fields.length > 0) {
        const mapped = {};
        for (const item of error.fields) {
          const key = FIELD_NAMES[item.field];
          if (key) mapped[key] = item.code;
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
      eyebrow={t.auth.signUp.eyebrow}
      title={t.auth.signUp.title}
      lede={t.auth.signUp.lede}
      caption={t.auth.signUp.caption}
      flip
      notice={
        <>
          {showBuild && (
            <Notice tone="info" title={t.auth.buildSavedTitle}>
              <p>
                {fmt(t.auth.signUp.buildSavedBody, {
                  count: build.selectedCount,
                  total: formatRupiah(build.total),
                })}
              </p>
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
          {t.auth.signUp.foot}{' '}
          <Link className="textlink" to={signInTo}>
            {t.auth.signUp.footAction}
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
        <div className={`field${errors.fullName ? ' is-invalid' : ''}`}>
          <label className="field__label" htmlFor="signup-name">
            {t.auth.fullName}
          </label>
          <input
            id="signup-name"
            name="full_name"
            type="text"
            value={fullName}
            required
            autoComplete="name"
            readOnly={submitting}
            aria-invalid={errors.fullName ? 'true' : undefined}
            aria-describedby={errors.fullName ? 'signup-name-err' : undefined}
            onChange={(event) => setFullName(event.target.value)}
          />
          {errors.fullName && (
            <span className="error" id="signup-name-err">
              <AlertIcon />
              <span>{errorText(errors.fullName)}</span>
            </span>
          )}
        </div>

        <div className={`field${errors.email ? ' is-invalid' : ''}`}>
          <label className="field__label" htmlFor="signup-email">
            {t.auth.email}
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            value={email}
            required
            autoComplete="email"
            readOnly={submitting}
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={errors.email ? 'signup-email-err' : undefined}
            onChange={(event) => setEmail(event.target.value)}
          />
          {errors.email && (
            <span className="error" id="signup-email-err">
              <AlertIcon />
              <span>
                {errors.email === 'duplicate' ? (
                  <>
                    {t.auth.signUp.duplicateLead}{' '}
                    <Link className="textlink" to={signInTo}>
                      {t.auth.signUp.duplicateAction}
                    </Link>
                    {t.auth.signUp.duplicateTail}
                  </>
                ) : (
                  errorText(errors.email)
                )}
              </span>
            </span>
          )}
        </div>

        <div className={`field${errors.password ? ' is-invalid' : ''}`}>
          <label className="field__label" htmlFor="signup-password">
            {t.auth.password}
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            value={password}
            required
            autoComplete="new-password"
            readOnly={submitting}
            aria-invalid={errors.password ? 'true' : undefined}
            aria-describedby={
              errors.password ? 'signup-password-err' : 'signup-password-hint'
            }
            onChange={(event) => setPassword(event.target.value)}
          />
          {errors.password ? (
            <span className="error" id="signup-password-err">
              <AlertIcon />
              <span>{errorText(errors.password)}</span>
            </span>
          ) : (
            <span className="hint" id="signup-password-hint">
              {t.auth.passwordHint}
            </span>
          )}
        </div>

        <div className="form__actions">
          <button className="btn btn--block" type="submit" disabled={submitting}>
            {submitting ? t.auth.signUp.submitting : t.auth.signUp.submit}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
