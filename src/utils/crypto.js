/**
 * Cryptographic Password Utility using the Web Crypto API
 * Implements PBKDF2 with SHA-256 and unique per-user salts.
 */

// Helper: convert ArrayBuffer to hex string
function bufferToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Helper: convert hex string to Uint8Array
function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

const ITERATIONS = 100000;
const HASH_ALGO = 'SHA-256';
const KEY_LENGTH_BITS = 256;

/**
 * Hash a password using PBKDF2-SHA256
 * @param {string} password 
 * @param {string|null} saltHex (optional existing salt hex)
 * @returns {Promise<string>} Formatted hash: pbkdf2$iterations$saltHex$hashHex
 */
export async function hashPassword(password, saltHex = null) {
  if (!password || typeof password !== 'string') {
    throw new Error('Valid password string required for hashing.');
  }

  // Generate 16 bytes (128 bits) salt if none provided
  let saltBytes;
  if (saltHex) {
    saltBytes = hexToBuffer(saltHex);
  } else {
    saltBytes = window.crypto.getRandomValues(new Uint8Array(16));
  }

  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: ITERATIONS,
      hash: HASH_ALGO
    },
    baseKey,
    KEY_LENGTH_BITS
  );

  const finalSaltHex = bufferToHex(saltBytes);
  const derivedHex = bufferToHex(derivedBits);

  return `pbkdf2$${ITERATIONS}$${finalSaltHex}$${derivedHex}`;
}

/**
 * Verify a password against a stored password representation
 * Supports transparent upgrade for legacy plain-text passwords.
 * @param {string} inputPassword 
 * @param {string} storedPassword 
 * @returns {Promise<{ valid: boolean, needsUpgrade: boolean }>}
 */
export async function verifyPassword(inputPassword, storedPassword) {
  if (!inputPassword || !storedPassword) {
    return { valid: false, needsUpgrade: false };
  }

  // Check if storedPassword is in PBKDF2 format
  if (storedPassword.startsWith('pbkdf2$')) {
    const parts = storedPassword.split('$');
    if (parts.length !== 4) {
      return { valid: false, needsUpgrade: false };
    }

    const saltHex = parts[2];
    const targetHashHex = parts[3];

    try {
      const computedHashStr = await hashPassword(inputPassword, saltHex);
      const computedHashHex = computedHashStr.split('$')[3];

      // Constant-time-like comparison
      let diff = targetHashHex.length ^ computedHashHex.length;
      for (let i = 0; i < targetHashHex.length && i < computedHashHex.length; i++) {
        diff |= targetHashHex.charCodeAt(i) ^ computedHashHex.charCodeAt(i);
      }

      return { valid: diff === 0, needsUpgrade: false };
    } catch (e) {
      console.error('[crypto] Error verifying password:', e);
      return { valid: false, needsUpgrade: false };
    }
  }

  // Legacy plain-text fallback: match directly and signal an upgrade is required
  const isMatch = inputPassword === storedPassword;
  return {
    valid: isMatch,
    needsUpgrade: isMatch
  };
}
