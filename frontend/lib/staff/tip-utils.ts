/**
 * Utility functions for digital tips system
 */

/**
 * Interface defining the structure of a tip
 */
export interface Tip {
  /** Amount of the tip in cents/centavos */
  amount: number;
  /** Rating given by customer (1-5 stars) */
  rating?: number;
  /** ID of the staff member receiving the tip */
  staff_id: string;
  /** Optional message from the customer */
  message?: string;
  /** Timestamp when the tip was given */
  created_at?: string;
}

/**
 * Extended validation rules for tip data
 */
interface TipValidationRules {
  minAmount: number;
  maxAmount: number;
  minRating: number;
  maxRating: number;
  maxMessageLength: number;
}

const defaultValidationRules: TipValidationRules = {
  minAmount: 1, // Minimum 1 cent/centavo
  maxAmount: 100000, // Maximum $1000
  minRating: 1,
  maxRating: 5,
  maxMessageLength: 500
};

/**
 * Interface for validation error details
 */
export interface ValidationError {
  field: keyof Tip;
  code: string;
  message: string;
}

/**
 * Interface for validation result
 */
export interface TipValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates tip data against business rules
 * @param tip - The tip object to validate
 * @param rules - Optional validation rules to override defaults
 * @returns Validation result with detailed error information
 */
export function validateTipData(tip: Tip, rules: Partial<TipValidationRules> = {}): TipValidationResult {
  const validation = { ...defaultValidationRules, ...rules };
  const errors: ValidationError[] = [];

  // Check if tip object exists and has required properties
  if (!tip || typeof tip !== 'object') {
    return {
      isValid: false,
      errors: [{ field: 'amount', code: 'INVALID_TIP', message: 'Invalid tip object' }]
    };
  }

  // Amount validation
  if (typeof tip.amount !== 'number' || !Number.isFinite(tip.amount)) {
    errors.push({ 
      field: 'amount', 
      code: 'INVALID_AMOUNT_TYPE', 
      message: 'Amount must be a valid number' 
    });
  } else if (tip.amount < validation.minAmount) {
    errors.push({ 
      field: 'amount', 
      code: 'AMOUNT_TOO_LOW', 
      message: `Amount must be at least ${validation.minAmount}` 
    });
  } else if (tip.amount > validation.maxAmount) {
    errors.push({ 
      field: 'amount', 
      code: 'AMOUNT_TOO_HIGH', 
      message: `Amount cannot exceed ${validation.maxAmount}` 
    });
  }

  // Staff ID validation
  if (typeof tip.staff_id !== 'string') {
    errors.push({ 
      field: 'staff_id', 
      code: 'INVALID_STAFF_ID_TYPE', 
      message: 'Staff ID must be a string' 
    });
  } else if (tip.staff_id.trim().length === 0) {
    errors.push({ 
      field: 'staff_id', 
      code: 'EMPTY_STAFF_ID', 
      message: 'Staff ID cannot be empty' 
    });
  }

  // Rating validation (optional)
  if (tip.rating !== undefined) {
    if (typeof tip.rating !== 'number' || !Number.isInteger(tip.rating)) {
      errors.push({ 
        field: 'rating', 
        code: 'INVALID_RATING_TYPE', 
        message: 'Rating must be a whole number' 
      });
    } else if (tip.rating < validation.minRating) {
      errors.push({ 
        field: 'rating', 
        code: 'RATING_TOO_LOW', 
        message: `Rating must be at least ${validation.minRating}` 
      });
    } else if (tip.rating > validation.maxRating) {
      errors.push({ 
        field: 'rating', 
        code: 'RATING_TOO_HIGH', 
        message: `Rating cannot exceed ${validation.maxRating}` 
      });
    }
  }

  // Message validation (optional)
  if (tip.message !== undefined) {
    if (typeof tip.message !== 'string') {
      errors.push({ 
        field: 'message', 
        code: 'INVALID_MESSAGE_TYPE', 
        message: 'Message must be a string' 
      });
    } else if (tip.message.length > validation.maxMessageLength) {
      errors.push({ 
        field: 'message', 
        code: 'MESSAGE_TOO_LONG', 
        message: `Message cannot exceed ${validation.maxMessageLength} characters` 
      });
    }
  }

  // Created at validation (optional)
  if (tip.created_at !== undefined) {
    if (typeof tip.created_at !== 'string') {
      errors.push({ 
        field: 'created_at', 
        code: 'INVALID_DATE_TYPE', 
        message: 'Created at must be a valid date string' 
      });
    } else if (isNaN(Date.parse(tip.created_at))) {
      errors.push({ 
        field: 'created_at', 
        code: 'INVALID_DATE_FORMAT', 
        message: 'Invalid date format' 
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export interface StaffTipStats {
  total: number;
  count: number;
  average_rating: number;
  sumRatings: number; // Used internally for incremental average calculation
}

export interface GroupedTips {
  [staff_id: string]: StaffTipStats;
}

/**
 * Calculate total tips amount
 */
export function calculateTotalTips(tips: Tip[]): number {
  return tips.reduce((sum, tip) => sum + tip.amount, 0);
}

/**
 * Calculate average rating from tips
 */
export function calculateAverageRating(tips: Tip[]): number {
  const validRatings = tips.filter(tip => tip.rating !== undefined);
  if (validRatings.length === 0) return 0;
  return validRatings.reduce((sum, tip) => sum + (tip.rating || 0), 0) / validRatings.length;
}

/**
 * Group tips by staff member with optimized incremental average calculation
 */
export function groupTipsByStaff(tips: Tip[]): GroupedTips {
  return tips.reduce((grouped, tip) => {
    if (!grouped[tip.staff_id]) {
      grouped[tip.staff_id] = {
        total: 0,
        count: 0,
        average_rating: 0,
        sumRatings: 0
      };
    }

    const stats = grouped[tip.staff_id];
    stats.total += tip.amount;
    stats.count += 1;
    
    if (tip.rating !== undefined) {
      stats.sumRatings += tip.rating;
      stats.average_rating = stats.sumRatings / stats.count;
    }

    return grouped;
  }, {} as GroupedTips);
}

/**
 * Format tip date for display
 */
export function formatTipDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}
