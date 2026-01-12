import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useTutorial } from '../contexts/TutorialContext';
import { Eye, EyeOff, Loader2, Check, X, PlayCircle } from 'lucide-react';
import axios from 'axios';
import styles from './Settings.module.css';

// Password complexity rules
const PASSWORD_RULES = {
  minLength: { test: (p) => p.length >= 8, label: 'At least 8 characters' },
  hasLetter: { test: (p) => /[a-zA-Z]/.test(p), label: 'Contains at least one letter' },
  hasNumber: { test: (p) => /[0-9]/.test(p), label: 'Contains at least one number' },
};

function validatePassword(password) {
  const results = {};
  let allPassed = true;

  for (const [key, rule] of Object.entries(PASSWORD_RULES)) {
    const passed = rule.test(password);
    results[key] = passed;
    if (!passed) allPassed = false;
  }

  return { results, isValid: allPassed };
}

function Settings() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const { resetTutorial } = useTutorial();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Calculate password validation state
  const validation = validatePassword(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== '';

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validate current password is provided
    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }

    // Validate new password meets complexity requirements
    if (!validation.isValid) {
      setPasswordError('New password does not meet complexity requirements');
      return;
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setPasswordSuccess('Password changed successfully!');
      success('Password changed successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to change password';
      setPasswordError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = currentPassword && validation.isValid && passwordsMatch && !isSubmitting;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>System configuration and preferences</p>
      </div>

      <div className={styles.settingsGrid}>
        {/* Password Change Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>🔐 Change Password</h2>
          </div>
          <div className={styles.cardContent}>
            {passwordSuccess && (
              <div className={styles.successMessage}>{passwordSuccess}</div>
            )}
            {passwordError && (
              <div className={styles.errorMessage}>{passwordError}</div>
            )}

            <form onSubmit={handlePasswordChange}>
              {/* Current Password */}
              <div className={styles.formGroup}>
                <label htmlFor="currentPassword" className={styles.label}>
                  Current Password <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={styles.input}
                    placeholder="Enter current password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className={styles.passwordToggle}
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className={styles.formGroup}>
                <label htmlFor="newPassword" className={styles.label}>
                  New Password <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`${styles.input} ${newPassword && (validation.isValid ? styles.inputSuccess : styles.inputError)}`}
                    placeholder="Enter new password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className={styles.passwordToggle}
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Password Complexity Indicators */}
                <ul className={styles.complexityList}>
                  {Object.entries(PASSWORD_RULES).map(([key, rule]) => (
                    <li
                      key={key}
                      className={`${styles.complexityItem} ${newPassword ? (validation.results[key] ? styles.valid : styles.invalid) : ''}`}
                    >
                      <span className={styles.complexityIcon}>
                        {newPassword ? (validation.results[key] ? <Check size={14} /> : <X size={14} />) : '○'}
                      </span>
                      {rule.label}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Confirm Password */}
              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>
                  Confirm New Password <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`${styles.input} ${confirmPassword && (passwordsMatch ? styles.inputSuccess : styles.inputError)}`}
                    placeholder="Confirm new password"
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
                {confirmPassword && !passwordsMatch && (
                  <p className={styles.errorText}>Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                className={styles.button}
                disabled={!canSubmit}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className={styles.spinner} />
                    Changing Password...
                  </>
                ) : (
                  'Change Password'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Account Info Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>👤 Account Information</h2>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.infoCard}>
              <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> {user?.role}</p>
            </div>
            <p className={styles.userNote}>
              Contact your system administrator to update account details.
            </p>
          </div>
        </div>

        {/* Help & Tutorial Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>📚 Help & Tutorial</h2>
          </div>
          <div className={styles.cardContent}>
            <p className={styles.tutorialDescription}>
              Need a refresher on how to use Candiez? Replay the interactive tutorial to learn about all the features.
            </p>
            <button
              type="button"
              className={styles.tutorialButton}
              onClick={() => {
                resetTutorial();
                success('Tutorial restarted! Starting from the beginning.');
              }}
            >
              <PlayCircle size={18} />
              Replay Tutorial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
