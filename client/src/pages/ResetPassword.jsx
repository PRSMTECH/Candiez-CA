import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import AnimatedLogo from '../components/AnimatedLogo';
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import styles from './ResetPassword.module.css';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('validating'); // validating, valid, invalid, expired, success
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }

    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch(`/api/auth/reset-password/${token}`);
      const data = await response.json();

      if (response.ok && data.valid) {
        setStatus('valid');
        setEmail(data.email);
        setFirstName(data.firstName);
      } else if (response.status === 410) {
        setStatus('expired');
        setEmail(data.email);
      } else {
        setStatus('invalid');
      }
    } catch (err) {
      setStatus('invalid');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!password) {
      setError('Password is required');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      setError('Password must contain at least one letter and one number');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
      } else if (response.status === 410) {
        setStatus('expired');
      } else {
        setError(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return null;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { label: 'Weak', color: '#EF4444' };
    if (strength <= 4) return { label: 'Good', color: '#F59E0B' };
    return { label: 'Strong', color: '#10B981' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Logo and Branding */}
        <div className={styles.brandSection}>
          <AnimatedLogo
            size="xlarge"
            showText={false}
            animationInterval={4000}
            className={styles.logo}
          />
          <p className={styles.tagline}>Dispensary CRM & Inventory</p>
        </div>

        {/* Content Section */}
        <div className={styles.contentSection}>
          {/* Validating State */}
          {status === 'validating' && (
            <div className={styles.statusContent}>
              <div className={styles.iconWrapper}>
                <Loader2 size={64} className={styles.spinnerIcon} />
              </div>
              <h2 className={styles.title}>Validating Link</h2>
              <p className={styles.statusMessage}>
                Please wait while we verify your reset link...
              </p>
            </div>
          )}

          {/* Valid Token - Show Reset Form */}
          {status === 'valid' && (
            <>
              <h2 className={styles.title}>Reset Your Password</h2>
              <p className={styles.subtitle}>
                {firstName ? `Hi ${firstName}! ` : ''}Create a new password for your account.
              </p>

              {error && (
                <div className={styles.errorAlert}>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.form}>
                {/* New Password */}
                <div className={styles.inputGroup}>
                  <label htmlFor="password" className={styles.label}>
                    New Password
                  </label>
                  <div className={styles.passwordWrapper}>
                    <Lock size={18} className={styles.inputIcon} />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={styles.input}
                      placeholder="Min 8 characters, 1 letter, 1 number"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles.passwordToggle}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordStrength && (
                    <div className={styles.strengthIndicator}>
                      <div className={styles.strengthBar}>
                        <div
                          className={styles.strengthFill}
                          style={{
                            width: passwordStrength.label === 'Weak' ? '33%' : passwordStrength.label === 'Good' ? '66%' : '100%',
                            backgroundColor: passwordStrength.color
                          }}
                        />
                      </div>
                      <span style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className={styles.inputGroup}>
                  <label htmlFor="confirmPassword" className={styles.label}>
                    Confirm Password
                  </label>
                  <div className={styles.passwordWrapper}>
                    <Lock size={18} className={styles.inputIcon} />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={styles.input}
                      placeholder="Re-enter your new password"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={styles.passwordToggle}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className={styles.mismatchText}>Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting || password !== confirmPassword}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={20} className={styles.spinnerIcon} />
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <span>Reset Password</span>
                  )}
                </button>
              </form>

              <Link to="/login" className={styles.backLink}>
                <ArrowLeft size={18} />
                <span>Back to Sign In</span>
              </Link>
            </>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className={styles.statusContent}>
              <div className={`${styles.iconWrapper} ${styles.successIcon}`}>
                <CheckCircle size={64} />
              </div>
              <h2 className={styles.title}>Password Reset!</h2>
              <p className={styles.statusMessage}>
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
              <Link to="/login" className={styles.primaryButton}>
                Sign In to Your Account
              </Link>
            </div>
          )}

          {/* Invalid Token State */}
          {status === 'invalid' && (
            <div className={styles.statusContent}>
              <div className={`${styles.iconWrapper} ${styles.errorIcon}`}>
                <XCircle size={64} />
              </div>
              <h2 className={styles.title}>Invalid Link</h2>
              <p className={styles.statusMessage}>
                This password reset link is invalid or has already been used.
              </p>
              <Link to="/forgot-password" className={styles.primaryButton}>
                Request New Reset Link
              </Link>
              <Link to="/login" className={styles.secondaryButton}>
                <ArrowLeft size={18} />
                <span>Back to Sign In</span>
              </Link>
            </div>
          )}

          {/* Expired Token State */}
          {status === 'expired' && (
            <div className={styles.statusContent}>
              <div className={`${styles.iconWrapper} ${styles.warningIcon}`}>
                <RefreshCw size={64} />
              </div>
              <h2 className={styles.title}>Link Expired</h2>
              <p className={styles.statusMessage}>
                This password reset link has expired. Please request a new one.
              </p>
              <Link to="/forgot-password" className={styles.primaryButton}>
                Request New Reset Link
              </Link>
              <Link to="/login" className={styles.secondaryButton}>
                <ArrowLeft size={18} />
                <span>Back to Sign In</span>
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p>California Licensed Dispensary Management System</p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
