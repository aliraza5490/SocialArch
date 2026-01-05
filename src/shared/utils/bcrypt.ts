import * as bcrypt from "bcryptjs";

export const generatePasswordHash = async (
  password: string,
): Promise<string> => {
  const salt = await bcrypt.genSalt();
  const hashed = await bcrypt.hash(password, salt);
  return hashed;
};

export const comparePassword = async (
  hashedPassword: string,
  password: string,
): Promise<boolean> => {
  const isMatched = await bcrypt.compare(password, hashedPassword);
  return isMatched;
};
