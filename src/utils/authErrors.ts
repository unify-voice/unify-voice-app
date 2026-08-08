/**
 * Shared Firebase Auth error messages for consistent UX.
 */
export const mapAuthError = (code?: string, fallback = 'Something went wrong. Try again.') => {
  if (!code) return fallback
  const map: Record<string, string> = {
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/email-already-in-use': 'An account already exists with this email.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/network-request-failed': 'Network error, please try again.',
    'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/requires-recent-login': 'Please re-authenticate and try again.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled.',
  }
  return map[code] ?? fallback
}
