
/**
 * Password security utilities: k-anonymity check against HaveIBeenPwned Pwned Passwords API.
 * No API key required. Uses SHA-1 hash and range query.
 *
 * Note: If the API call fails, we fail open (allow sign-up) but log a warning.
 */

const toHexUpper = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();

const sha1 = async (text: string) => {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-1', data);
  return toHexUpper(digest);
};

export interface PasswordLeakResult {
  leaked: boolean;
  count: number;
}

/**
 * Checks whether a password appears in known breaches using the HIBP range API.
 * Returns { leaked, count }.
 * If network fails or API is unavailable, returns { leaked: false, count: 0 } and logs a warning.
 */
export const isPasswordLeaked = async (password: string): Promise<PasswordLeakResult> => {
  try {
    if (!password) return { leaked: false, count: 0 };

    const hash = await sha1(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      // Add-Padding helps protect anonymity
      headers: { 'Add-Padding': 'true' },
    });

    if (!res.ok) {
      console.warn('[password-utils] HIBP API responded with non-OK status:', res.status);
      return { leaked: false, count: 0 };
    }

    const text = await res.text();
    // Each line: HASH_SUFFIX:COUNT
    const lines = text.split('\n');
    for (const line of lines) {
      const [hashSuffix, countStr] = line.trim().split(':');
      if (hashSuffix?.toUpperCase() === suffix) {
        const count = parseInt(countStr || '0', 10) || 0;
        return { leaked: count > 0, count };
      }
    }

    return { leaked: false, count: 0 };
  } catch (err) {
    console.warn('[password-utils] Failed to check password against HIBP. Allowing sign-up.', err);
    return { leaked: false, count: 0 };
  }
};

/**
 * Throws an Error if the provided password is found in known breaches.
 */
export const ensurePasswordNotLeaked = async (password: string) => {
  const { leaked, count } = await isPasswordLeaked(password);
  if (leaked) {
    const message =
      count > 1000
        ? 'This password has been exposed in numerous data breaches. Please choose a different, stronger password.'
        : 'This password appears in known data breaches. Please choose a different password.';
    const error = new Error(message);
    (error as any).code = 'PASSWORD_LEAKED';
    throw error;
  }
};

