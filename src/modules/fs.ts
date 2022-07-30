import { fs } from 'memfs';

export default fs;

export const {
  mkdirSync,
  unlinkSync,
  writeFileSync,
} = fs;
