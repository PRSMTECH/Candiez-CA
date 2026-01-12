/**
 * Utility functions for formatting data in the Candiez-CA application
 */

/**
 * Format a number as currency (USD)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0.00'
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

/**
 * Format a date string for display
 * @param {string|Date} date - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  if (!date) return ''

  const dateObj = date instanceof Date ? date : new Date(date)

  if (isNaN(dateObj.getTime())) {
    return ''
  }

  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }

  return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj)
}

/**
 * Format a phone number for display
 * @param {string} phone - The phone number to format
 * @returns {string} Formatted phone number
 */
export function formatPhone(phone) {
  if (!phone) return ''

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')

  // Format as (XXX) XXX-XXXX for 10 digit numbers
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  // Return original if not 10 digits
  return phone
}

/**
 * Calculate loyalty tier based on total points
 * @param {number} totalPoints - Total lifetime points earned
 * @returns {string} Loyalty tier name
 */
export function calculateLoyaltyTier(totalPoints) {
  if (typeof totalPoints !== 'number' || totalPoints < 0) {
    return 'Bronze'
  }

  if (totalPoints >= 10000) return 'Platinum'
  if (totalPoints >= 5000) return 'Gold'
  if (totalPoints >= 1000) return 'Silver'
  return 'Bronze'
}

/**
 * Get tier multiplier for loyalty points
 * @param {string} tier - Loyalty tier name
 * @returns {number} Points multiplier
 */
export function getTierMultiplier(tier) {
  const multipliers = {
    Bronze: 1,
    Silver: 1.25,
    Gold: 1.5,
    Platinum: 2,
  }
  return multipliers[tier] || 1
}
