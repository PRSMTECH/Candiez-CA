const fs = require('fs');

const newContent = `import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import styles from './CustomerNew.module.css';

// Default form values
const defaultFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  address: '',
  status: 'new',
  notes: '',
  ageVerified: false
};

// Phone validation regex - accepts formats like:
// (555) 123-4567, 555-123-4567, 5551234567, +1-555-123-4567
const PHONE_REGEX = /^[\\+]?[(]?[0-9]{1,4}[)]?[-\\s\\.]?[0-9]{1,4}[-\\s\\.]?[0-9]{1,9}$/;

function CustomerNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({ ...defaultFormData });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validate that a string is not empty or whitespace-only
  const isNotWhitespaceOnly = (value) => {
    return value && value.trim().length > 0;
  };

  const handleFieldBlur = (fieldName, errorMessage) => {
    if (formData[fieldName] && !isNotWhitespaceOnly(formData[fieldName])) {
      setFieldErrors(prev => ({
        ...prev,
        [fieldName]: errorMessage
      }));
    }
  };

  const handlePhoneBlur = () => {
    // Validate phone on blur
    if (formData.phone && !validatePhone(formData.phone)) {
      setFieldErrors(prev => ({
        ...prev,
        phone: 'Please enter a valid phone number format (e.g., (555) 123-4567)'
      }));
    }
  };

  const validatePhone = (phone) => {
    // Remove all non-digit characters for length check
    const digitsOnly = phone.replace(/\\D/g, '');
    // Must have at least 10 digits and match the regex pattern
    return digitsOnly.length >= 10 && PHONE_REGEX.test(phone);
  };

  const handleReset = () => {
    setFormData({ ...defaultFormData });
    setError(null);
    setSuccess(false);
    setFieldErrors({});
  };

  const validateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 21;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    // Validate required fields are not whitespace-only
    const newFieldErrors = {};

    if (!isNotWhitespaceOnly(formData.firstName)) {
      newFieldErrors.firstName = 'First name cannot be empty or contain only spaces';
    }

    if (!isNotWhitespaceOnly(formData.lastName)) {
      newFieldErrors.lastName = 'Last name cannot be empty or contain only spaces';
    }

    if (!isNotWhitespaceOnly(formData.email)) {
      newFieldErrors.email = 'Email cannot be empty or contain only spaces';
    }

    // Validate phone format
    if (!validatePhone(formData.phone)) {
      newFieldErrors.phone = 'Please enter a valid phone number format (e.g., (555) 123-4567)';
    }

    // If any field errors, show them and stop
    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setError('Please fix the highlighted fields before submitting.');
      setSaving(false);
      return;
    }

    // Validate age
    if (!validateAge(formData.dateOfBirth)) {
      setError('Customer must be at least 21 years old.');
      setSaving(false);
      return;
    }

    // Validate age verification checkbox
    if (!formData.ageVerified) {
      setError('You must verify that you have checked the customer\\'s ID.');
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');

      // Map camelCase form fields to snake_case for API
      // Trim whitespace from text fields
      const apiData = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        date_of_birth: formData.dateOfBirth,
        address: formData.address.trim(),
        notes: formData.notes.trim(),
        status: formData.status
      };

      const response = await axios.post('/api/customers', apiData, {
        headers: { Authorization: \`Bearer \${token}\` }
      });

      console.log('Customer created successfully:', response.data);
      setSuccess(true);
      // Navigate to customer list after success
      setTimeout(() => {
        navigate('/customers');
      }, 1500);

      return response;
    } catch (err) {
      console.error('Customer creation error:', err);
      setError(err.response?.data?.error || 'Failed to create customer. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/customers');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Add New Customer</h1>
        <p className={styles.subtitle}>
          Register a new customer in the system
        </p>
      </div>

      {success && (
        <div className={styles.successMessage}>
          Customer created successfully! Redirecting...
        </div>
      )}

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Personal Information</h2>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName" className={styles.label}>
                First Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={() => handleFieldBlur('firstName', 'First name cannot be empty or contain only spaces')}
                className={\`\${styles.input} \${fieldErrors.firstName ? styles.inputError : ''}\`}
                required
                placeholder="Enter first name"
              />
              {fieldErrors.firstName && (
                <span className={styles.fieldError}>{fieldErrors.firstName}</span>
              )}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="lastName" className={styles.label}>
                Last Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={() => handleFieldBlur('lastName', 'Last name cannot be empty or contain only spaces')}
                className={\`\${styles.input} \${fieldErrors.lastName ? styles.inputError : ''}\`}
                required
                placeholder="Enter last name"
              />
              {fieldErrors.lastName && (
                <span className={styles.fieldError}>{fieldErrors.lastName}</span>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email <span className={styles.required}>*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleFieldBlur('email', 'Email cannot be empty or contain only spaces')}
                className={\`\${styles.input} \${fieldErrors.email ? styles.inputError : ''}\`}
                required
                placeholder="email@example.com"
              />
              {fieldErrors.email && (
                <span className={styles.fieldError}>{fieldErrors.email}</span>
              )}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.label}>
                Phone <span className={styles.required}>*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handlePhoneBlur}
                className={\`\${styles.input} \${fieldErrors.phone ? styles.inputError : ''}\`}
                required
                placeholder="(555) 123-4567"
              />
              {fieldErrors.phone && (
                <span className={styles.fieldError}>{fieldErrors.phone}</span>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="dateOfBirth" className={styles.label}>
                Date of Birth <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={styles.input}
                required
              />
              <span className={styles.hint}>Must be 21 years or older</span>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="status" className={styles.label}>Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="new">New</option>
                <option value="active">Active</option>
                <option value="vip">VIP</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Address & Notes</h2>

          <div className={styles.formGroup}>
            <label htmlFor="address" className={styles.label}>Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={styles.input}
              placeholder="Street address, city, state, ZIP"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="notes" className={styles.label}>Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className={styles.textarea}
              rows={4}
              placeholder="Add any notes about this customer..."
            />
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Age Verification</h2>

          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="ageVerified"
              name="ageVerified"
              checked={formData.ageVerified}
              onChange={handleChange}
              className={styles.checkbox}
            />
            <label htmlFor="ageVerified" className={styles.checkboxLabel}>
              I verify that I have checked this customer&apos;s ID and they are 21 years of age or older.
              <span className={styles.required}>*</span>
            </label>
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={handleReset}
            className={styles.resetButton}
            disabled={saving}
          >
            Reset Form
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className={styles.cancelButton}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.saveButton}
            disabled={saving || success}
          >
            {saving ? 'Saving...' : 'Create Customer'}
          </button>
        </div>
      </form>

      <div className={styles.userNote}>
        Logged in as: {user?.firstName || 'User'} ({user?.role || 'staff'})
      </div>
    </div>
  );
}

export default CustomerNew;
`;

fs.writeFileSync('J:/PRSMTECH/LOGIC/autocoder/generations/Candiez-CA/client/src/pages/CustomerNew.jsx', newContent);
console.log('CustomerNew.jsx updated with whitespace-only validation');
