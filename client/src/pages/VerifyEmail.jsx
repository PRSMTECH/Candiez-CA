import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, RefreshCw, ArrowLeft, Mail } from 'lucide-react';
import styles from './VerifyEmail.module.css';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('verifying'); // verifying, success, error, expired
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided. Please check your email for the correct link.');
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await fetch(`/api/auth/verify-email/${token}`);
      const data = await response.json();

      if (response.ok && data.verified) {
        setStatus('success');
        setMessage(data.message);
      } else if (response.status === 410) {
        // Token expired
        setStatus('expired');
        setMessage(data.message);
        if (data.email) setEmail(data.email);
      } else {
        setStatus('error');
        setMessage(data.message || 'Verification failed. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred during verification. Please try again.');
    }
  };

  const handleResendVerification = async (e) => {
    e.preventDefault();
    const emailToUse = email || resendEmail;

    if (!emailToUse) {
      setMessage('Please enter your email address.');
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse.toLowerCase() })
      });

      const data = await response.json();
      setResendSuccess(true);
      setMessage('If an unverified account exists with this email, a new verification link has been sent.');
    } catch (error) {
      setMessage('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={styles.verifyContainer}>
      <div className={styles.verifyCard}>
        {/* Logo and Branding */}
        <div className={styles.brandSection}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🍬</span>
            <h1 className={styles.logoText}>Candiez</h1>
          </div>
          <p className={styles.tagline}>Dispensary CRM & Inventory</p>
        </div>

        {/* Content Section */}
        <div className={styles.contentSection}>
          {/* Verifying State */}
          {status === 'verifying' && (
            <div className={styles.statusContent}>
              <div className={styles.iconWrapper}>
                <Loader2 size={64} className={styles.spinnerIcon} />
              </div>
              <h2 className={styles.statusTitle}>Verifying Your Email</h2>
              <p className={styles.statusMessage}>
                Please wait while we verify your email address...
              </p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className={styles.statusContent}>
              <div className={`${styles.iconWrapper} ${styles.successIcon}`}>
                <CheckCircle size={64} />
              </div>
              <h2 className={styles.statusTitle}>Email Verified!</h2>
              <p className={styles.statusMessage}>{message}</p>
              <Link to="/login" className={styles.primaryButton}>
                Sign In to Your Account
              </Link>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className={styles.statusContent}>
              <div className={`${styles.iconWrapper} ${styles.errorIcon}`}>
                <XCircle size={64} />
              </div>
              <h2 className={styles.statusTitle}>Verification Failed</h2>
              <p className={styles.statusMessage}>{message}</p>

              {/* Resend form for errors */}
              {!resendSuccess && (
                <form onSubmit={handleResendVerification} className={styles.resendForm}>
                  <p className={styles.resendLabel}>Enter your email to receive a new verification link:</p>
                  <div className={styles.resendInputGroup}>
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="your@email.com"
                      className={styles.resendInput}
                      disabled={isResending}
                    />
                    <button
                      type="submit"
                      className={styles.resendButton}
                      disabled={isResending}
                    >
                      {isResending ? (
                        <Loader2 size={20} className={styles.spinnerIcon} />
                      ) : (
                        <Mail size={20} />
                      )}
                    </button>
                  </div>
                </form>
              )}

              {resendSuccess && (
                <div className={styles.resendSuccess}>
                  <CheckCircle size={20} />
                  <span>Verification email sent!</span>
                </div>
              )}

              <Link to="/login" className={styles.secondaryButton}>
                <ArrowLeft size={18} />
                <span>Back to Sign In</span>
              </Link>
            </div>
          )}

          {/* Expired State */}
          {status === 'expired' && (
            <div className={styles.statusContent}>
              <div className={`${styles.iconWrapper} ${styles.warningIcon}`}>
                <RefreshCw size={64} />
              </div>
              <h2 className={styles.statusTitle}>Link Expired</h2>
              <p className={styles.statusMessage}>{message}</p>

              {!resendSuccess ? (
                <>
                  {email ? (
                    <button
                      onClick={handleResendVerification}
                      className={styles.primaryButton}
                      disabled={isResending}
                    >
                      {isResending ? (
                        <>
                          <Loader2 size={20} className={styles.spinnerIcon} />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Mail size={20} />
                          <span>Send New Verification Link</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <form onSubmit={handleResendVerification} className={styles.resendForm}>
                      <p className={styles.resendLabel}>Enter your email to receive a new verification link:</p>
                      <div className={styles.resendInputGroup}>
                        <input
                          type="email"
                          value={resendEmail}
                          onChange={(e) => setResendEmail(e.target.value)}
                          placeholder="your@email.com"
                          className={styles.resendInput}
                          disabled={isResending}
                        />
                        <button
                          type="submit"
                          className={styles.resendButton}
                          disabled={isResending}
                        >
                          {isResending ? (
                            <Loader2 size={20} className={styles.spinnerIcon} />
                          ) : (
                            <Mail size={20} />
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              ) : (
                <div className={styles.resendSuccess}>
                  <CheckCircle size={20} />
                  <span>New verification email sent! Check your inbox.</span>
                </div>
              )}

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

export default VerifyEmail;
