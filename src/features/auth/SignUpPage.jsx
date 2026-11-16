import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertIcon } from '../../components/Icons';
import { Notice } from '../../components/Notice';
import { formatRupiah } from '../../helpers/money';
import { safeReturn, signInHref } from '../../helpers/returnTo';
import { validateSignUp } from '../../helpers/validation';
import en, { fmt } from '../../locales';
import { useAuth } from '../../store/AuthContext';
import { useBuild } from '../../store/BuildContext';
import { useCatalogue } from '../../store/CatalogueContext';
import { AuthLayout } from './AuthLayout';

const FIELD_NAMES = { full_name: 'fullName', email: 'email', password: 'password' };

export function SignUpPage() {
  const { status, register } = useAuth();
  const { status: catalogueStatus } = useCatalogue();
  const build = useBuild();
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

  function errorText(value) {
    return en.auth.fieldErrors[value] || value;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateSignUp({ fullName, email, password });
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await register({ fullName: fullName.trim(), email: email.trim(), password });
    } catch (error) {
      if (error.code === 'EMAIL_TAKEN') {
        setErrors({ email: 'duplicate' });
      } else if (error.code === 'VALIDATION_FAILED' && error.fields.length > 0) {
        const mapped = {};
        for (const item of error.fields) {
          const key = FIELD_NAMES[item.field];
          if (key) mapped[key] = item.message;
        }
        if (Object.keys(mapped).length > 0) setErrors(mapped);
        else setFormError({ tone: 'error', title: en.auth.genericTitle, body: error.message });
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
      eyebrow={en.auth.signUp.eyebrow}
      title={en.auth.signUp.title}
      lede={en.auth.signUp.lede}
      caption={en.auth.signUp.caption}
      flip
      notice={
        <>
          {showBuild && (
            <Notice tone="info" title={en.auth.buildSavedTitle}>
              <p>
                {fmt(en.auth.signUp.buildSavedBody, {
                  count: build.selectedCount,
                  total: formatRupiah(build.total),
                })}
              </p>
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
          {en.auth.signUp.foot}{' '}
          <Link className="textlink" to={signInTo}>
            {en.auth.signUp.footAction}
          </Link>
        </>
      }
    >
      <form className="form" noValidate aria-busy={submitting ? 'true' : undefined} onSubmit={handleSubmit}>
        <div className={`field${errors.fullName ? ' is-invalid' : ''}`}>
          <label className="field__label" htmlFor="signup-name">
            {en.auth.fullName}
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
            {en.auth.email}
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
                    {en.auth.signUp.duplicateLead}{' '}
                    <Link className="textlink" to={signInTo}>
                      {en.auth.signUp.duplicateAction}
                    </Link>
                    {en.auth.signUp.duplicateTail}
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
            {en.auth.password}
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
              {en.auth.passwordHint}
            </span>
          )}
        </div>

        <div className="form__actions">
          <button className="btn btn--block" type="submit" disabled={submitting}>
            {submitting ? en.auth.signUp.submitting : en.auth.signUp.submit}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
