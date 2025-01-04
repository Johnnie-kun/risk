import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const passwordUtils = {
  /**
   * Hash a password using bcrypt.
   * @param password - The password to hash.
   * @returns The hashed password.
   * @throws {Error} If hashing fails.
   */
  async hash(password: string): Promise<string> {
    if (!password) {
      throw new Error("Password is required.");
    }

    try {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      return hashedPassword;
    } catch (error) {
      console.error("Error hashing password:", error);
      throw new Error("Failed to hash password.");
    }
  },

  /**
   * Compare a plain password with a hashed password.
   * @param password - The plain password.
   * @param hash - The hashed password.
   * @returns {Promise<boolean>} True if passwords match, false otherwise.
   * @throws {Error} If comparison fails.
   */
  async compare(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) {
      throw new Error("Password and hash are required.");
    }

    try {
      const isMatch = await bcrypt.compare(password, hash);
      return isMatch;
    } catch (error) {
      console.error("Error comparing passwords:", error);
      throw new Error("Failed to compare passwords.");
    }
  },
};