import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AnimatedLogo from '../components/AnimatedLogo';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle, ArrowLeft, Gift } from 'lucide-react';
import styles from './Signup.module.css';

function Signup() {
  const [searchParams] = useSearchParams();
  const initialReferralCode = searchParams.get('ref') || '';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: initialReferralCode
  });
  const [referredBy, setReferredBy] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);
  const [canResend, setCanResend] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError('');
    setCanResend(false);
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setFormError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setFormError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setFormError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return false;
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)/;
    if (!passwordRegex.test(formData.password)) {
      setFormError('Password must contain at least one letter and one number');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setCanResend(false);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const result = await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        password: formData.password,
        referralCode: formData.referralCode.trim() || undefined
      });

      if (result.success) {
        if (result.referredBy) {
          setReferredBy(result.referredBy);
        }
        setSuccess(true);
      } else {
        setFormError(result.error);
        if (result.canResend) {
          setCanResend(true);
        }
      }
    } catch (err) {
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase() })
      });
      const data = await response.json();
      setFormError('');
      setSuccess(true);
    } catch (err) {
      setFormError('Failed to resend verification email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state - show verification message
  if (success) {
    return (
      <div className={styles.signupContainer}>
        <div className={styles.signupCard}>
          <div className={styles.brandSection}>
            <AnimatedLogo
              size="large"
              showText={false}
              animationInterval={4000}
              className={styles.logo}
            />
            <p className={styles.tagline}>Dispensary CRM & Inventory</p>
          </div>

          <div className={styles.successSection}>
            <div className={styles.successIcon}>
              <CheckCircle size={64} />
            </div>
            <h2 className={styles.successTitle}>Check Your Email!</h2>
            <p className={styles.successMessage}>
              We've sent a verification link to <strong>{formData.email}</strong>
            </p>
            <p className={styles.successSubtext}>
              Click the link in the email to activate your account. The link expires in 24 hours.
            </p>

            {referredBy && (
              <div className={styles.referralSuccess}>
                <Gift size={20} />
                <span>Referred by <strong>{referredBy}</strong> - You both earn rewards!</span>
              </div>
            )}

            <div className={styles.successActions}>
              <Link to="/login" className={styles.backToLoginButton}>
                <ArrowLeft size={18} />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </div>

          <div className={styles.footer}>
            <p>California Licensed Dispensary Management System</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.signupContainer}>
      <div className={styles.signupCard}>
        {/* Logo and Branding */}
        <div className={styles.brandSection}>
          <AnimatedLogo
            size="large"
            showText={false}
            animationInterval={4000}
            className={styles.logo}
          />
          <p className={styles.tagline}>Dispensary CRM & Inventory</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <h2 className={styles.formTitle}>Create Account</h2>
          <p className={styles.formSubtitle}>Join Candiez to manage your dispensary</p>

          {/* Error Display */}
          {formError && (
            <div className={styles.errorAlert}>
              <AlertCircle size={18} />
              <span>{formError}</span>
            </div>
          )}

          {/* Resend verification button */}
          {canResend && (
            <button
              type="button"
              onClick={handleResendVerification}
              className={styles.resendButton}
              disabled={isSubmitting}
            >
              Resend verification email
            </button>
          )}

          {/* Name Fields */}
          <div className={styles.nameRow}>
            <div className={styles.inputGroup}>
              <label htmlFor="firstName" className={styles.label}>
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className={styles.input}
                placeholder="John"
                autoComplete="given-name"
                disabled={isSubmitting}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="lastName" className={styles.label}>
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className={styles.input}
                placeholder="Doe"
                autoComplete="family-name"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Email Field */}
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isSubmitting}
            />
          </div>

          {/* Phone Field (Optional) */}
          <div className={styles.inputGroup}>
            <label htmlFor="phone" className={styles.label}>
              Phone Number <span className={styles.optional}>(Optional)</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className={styles.input}
              placeholder="(555) 123-4567"
              autoComplete="tel"
              disabled={isSubmitting}
            />
          </div>

          {/* Referral Code Field (Optional) */}
          <div className={styles.inputGroup}>
            <label htmlFor="referralCode" className={styles.label}>
              <Gift size={16} className={styles.referralIcon} />
              Referral Code <span className={styles.optional}>(Optional)</span>
            </label>
            <input
              id="referralCode"
              name="referralCode"
              type="text"
              value={formData.referralCode}
              onChange={handleChange}
              className={`${styles.input} ${styles.referralInput}`}
              placeholder="Enter referral code if you have one"
              autoComplete="off"
              disabled={isSubmitting}
            />
            <p className={styles.referralHint}>
              Got referred? Enter your friend's code to earn bonus rewards!
            </p>
          </div>

          {/* Password Field */}
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
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
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password
            </label>
            <div className={styles.passwordWrapper}>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                className={styles.input}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={styles.passwordToggle}
                tabIndex={-1}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className={styles.spinnerIcon} />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>

          {/* Sign In Link */}
          <div className={styles.signInLink}>
            <span>Already have an account?</span>
            <Link to="/login">Sign In</Link>
          </div>
        </form>

        {/* Footer */}
        <div className={styles.footer}>
          <p>California Licensed Dispensary Management System</p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
