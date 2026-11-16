import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertIcon } from '../../components/Icons';
import { Notice } from '../../components/Notice';
import { formatRupiah } from '../../helpers/money';
import { safeReturn, signUpHref } from '../../helpers/returnTo';
import { validateSignIn } from '../../helpers/validation';
import en, { fmt } from '../../locales';
import { useAuth } from '../../store/AuthContext';
import { useBuild } from '../../store/BuildContext';
import { useCatalogue } from '../../store/CatalogueContext';
import { AuthLayout } from './AuthLayout';

export function SignInPage() {
  const { status, signIn } = useAuth();
  const { status: catalogueStatus } = useCatalogue();
  const build = useBuild();
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
        setFormError({ tone: 'error', title: en.auth.signIn.invalidTitle, body: en.auth.signIn.invalidBody });
      } else if (error.code === 'RATE_LIMITED') {
        setFormError({ tone: 'error', title: en.auth.rateLimitedTitle, body: en.auth.rateLimitedBody });
      } else {
        setFormError({
          tone: 'error',
          title: en.auth.genericTitle,
          body: en.auth.genericBody,
          requestId: error.requestId,
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow={en.auth.signIn.eyebrow}
      title={en.auth.signIn.title}
      lede={en.auth.signIn.lede}
      caption={en.auth.signIn.caption}
      notice={
        <>
          {showBuild && (
            <Notice tone="info" title={en.auth.buildSavedTitle}>
              <p>
                {fmt(en.auth.signIn.buildSavedBody, {
                  count: build.selectedCount,
                  total: formatRupiah(build.total),
                })}
              </p>
            </Notice>
          )}
          {expired && (
            <Notice tone="info" title={en.auth.signIn.sessionTitle}>
              <p>{en.auth.signIn.sessionBody}</p>
            </Notice>
          )}
          {formError && (
            <Notice tone={formError.tone} title={formError.title}>
              <p>{formError.body}</p>
              {formError.requestId && (
                <p>{fmt(en.auth.reference, { requestId: formError.requestId })}</p>
              )}
            </Notice>
          )}
        </>
      }
      foot={
        <>
          {en.auth.signIn.foot}{' '}
          <Link className="textlink" to={signUpHref(returnTo)}>
            {en.auth.signIn.footAction}
          </Link>
        </>
      }
    >
      <form className="form" noValidate aria-busy={submitting ? 'true' : undefined} onSubmit={handleSubmit}>
        <div className={`field${errors.email ? ' is-invalid' : ''}`}>
          <label className="field__label" htmlFor="signin-email">
            {en.auth.email}
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
              <span>{en.auth.fieldErrors[errors.email] || errors.email}</span>
            </span>
          )}
        </div>

        <div className={`field${errors.password ? ' is-invalid' : ''}`}>
          <label className="field__label" htmlFor="signin-password">
            {en.auth.password}
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
              <span>{en.auth.fieldErrors[errors.password] || errors.password}</span>
            </span>
          )}
        </div>

        <div className="form__actions">
          <button className="btn btn--block" type="submit" disabled={submitting}>
            {submitting ? en.auth.signIn.submitting : en.auth.signIn.submit}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
