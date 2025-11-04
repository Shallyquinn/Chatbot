/**
 * Error Handler Utility
 *
 * Provides consistent error handling for API validation errors and other exceptions.
 * Displays user-friendly messages when backend validation fails.
 */

interface ValidationError {
  statusCode: number;
  message: string | string[];
  error: string;
}

interface ApiError extends Error {
  response?: {
    status?: number;
    data?: ValidationError;
  };
}

/**
 * Check if an error is an API validation error (400 Bad Request)
 */
export function isValidationError(error: unknown): error is ApiError {
  const apiError = error as ApiError;
  return apiError?.response?.status === 400;
}

/**
 * Extract validation messages from an API error
 */
export function getValidationMessages(error: ApiError): string[] {
  const data = error.response?.data;
  if (!data || !data.message) {
    return ["An unknown validation error occurred"];
  }

  // Backend returns either a string or array of strings
  if (Array.isArray(data.message)) {
    return data.message;
  }

  return [data.message];
}

/**
 * Display validation errors to the user via console
 * In a real app, you'd integrate with your notification/toast system
 */
export function displayValidationErrors(error: ApiError): void {
  if (!isValidationError(error)) {
    console.error("❌ API Error:", error.message);
    return;
  }

  const messages = getValidationMessages(error);
  console.error("❌ Validation Errors:");
  messages.forEach((msg) => {
    console.error(`  • ${msg}`);
  });
}

/**
 * Format validation errors as a single user-friendly message
 */
export function formatValidationError(error: ApiError): string {
  if (!isValidationError(error)) {
    return "An unexpected error occurred. Please try again.";
  }

  const messages = getValidationMessages(error);

  if (messages.length === 1) {
    return messages[0];
  }

  return `Please fix the following issues:\n${messages
    .map((m) => `• ${m}`)
    .join("\n")}`;
}

/**
 * Handle API errors with proper logging and user feedback
 *
 * Usage:
 * ```typescript
 * try {
 *   await api.createConversation(data);
 * } catch (error) {
 *   handleApiError(error, 'creating conversation');
 * }
 * ```
 */
export function handleApiError(
  error: unknown,
  context: string = "API operation"
): void {
  const apiError = error as ApiError;

  if (isValidationError(apiError)) {
    console.error(`❌ Validation error while ${context}:`);
    displayValidationErrors(apiError);

    // In a real app, show a toast notification:
    // toast.error(formatValidationError(apiError));
  } else {
    console.error(`❌ Error while ${context}:`, apiError.message || error);

    // In a real app, show a generic error notification:
    // toast.error('Something went wrong. Please try again.');
  }
}

/**
 * Wrap an API call with automatic error handling
 *
 * Usage:
 * ```typescript
 * await withErrorHandling(
 *   () => api.createConversation(data),
 *   'creating conversation'
 * );
 * ```
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    handleApiError(error, context);
    return null;
  }
}

/**
 * Check if all required fields are present before making an API call
 * Throws a clear error if fields are missing
 */
export function validateRequiredFields(
  data: Record<string, unknown>,
  requiredFields: string[],
  context: string = "operation"
): void {
  const missingFields = requiredFields.filter((field) => !data[field]);

  if (missingFields.length > 0) {
    const error = new Error(
      `Missing required fields for ${context}: ${missingFields.join(", ")}`
    );
    console.error("❌ Validation Error:", error.message);
    throw error;
  }
}

export default {
  isValidationError,
  getValidationMessages,
  displayValidationErrors,
  formatValidationError,
  handleApiError,
  withErrorHandling,
  validateRequiredFields,
};
