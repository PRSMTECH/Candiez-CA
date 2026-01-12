import { useState } from 'react';
import { Link } from 'react-router-dom';
import AnimatedLogo from '../components/AnimatedLogo';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import styles from './ForgotPassword.module.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() })
      });

      const data = await response.json();

      // Always show success for security (don't reveal if email exists)
      setSubmitted(true);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {!submitted ? (
            <>
              <h2 className={styles.title}>Forgot Password?</h2>
              <p className={styles.subtitle}>
                No worries! Enter your email and we'll send you a reset link.
              </p>

              {error && (
                <div className={styles.errorAlert}>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email Address
                  </label>
                  <div className={styles.inputWrapper}>
                    <Mail size={18} className={styles.inputIcon} />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={styles.input}
                      placeholder="you@example.com"
                      autoComplete="email"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={20} className={styles.spinnerIcon} />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </form>

              <Link to="/login" className={styles.backLink}>
                <ArrowLeft size={18} />
                <span>Back to Sign In</span>
              </Link>
            </>
          ) : (
            <div className={styles.successContent}>
              <div className={styles.successIcon}>
                <CheckCircle size={64} />
              </div>
              <h2 className={styles.title}>Check Your Email</h2>
              <p className={styles.successMessage}>
                If an account exists with <strong>{email}</strong>, we've sent a password reset link. The link expires in 1 hour.
              </p>
              <p className={styles.hintText}>
                Didn't receive the email? Check your spam folder or try again with a different email.
              </p>
              <div className={styles.actionButtons}>
                <button
                  onClick={() => setSubmitted(false)}
                  className={styles.secondaryButton}
                >
                  Try Different Email
                </button>
                <Link to="/login" className={styles.primaryButton}>
                  Back to Sign In
                </Link>
              </div>
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

export default ForgotPassword;
