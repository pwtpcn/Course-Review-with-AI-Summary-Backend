export const hashPassword = async (password: string) => {
  const salt = crypto.randomUUID();
  const passwordWithSalt = password + salt;
  const hashedPassword = await Bun.password.hash(passwordWithSalt, {
    algorithm: "bcrypt",
    cost: 10,
  });
  return { hashedPassword, salt };
};