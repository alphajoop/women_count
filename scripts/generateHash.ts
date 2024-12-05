import bcrypt from 'bcryptjs';

const password = 'admin123';

async function generateHash(): Promise<void> {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  // eslint-disable-next-line no-console
  console.log('Hashed password:', hash);
}

generateHash();

/* pnpm ts-node scripts/generateHash.ts */
