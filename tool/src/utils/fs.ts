import fs from '../node-builtin-modules/fs.js';

const ENABLE_PRETTY_PRINT = true;

export async function readJsonFile<T>(
  path: fs.PathLike | fs.promises.FileHandle,
): Promise<T> {
  let data = await fs.promises.readFile(path, 'utf8');
  return JSON.parse(data) as T;
}

export async function readJsonFileOptional<T>(
  path: fs.PathLike | fs.promises.FileHandle,
): Promise<T | null> {
  try {
    return await readJsonFile(path);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
    else throw err;
  }
}

export function writeJsonFile<T>(
  path: fs.PathLike | fs.promises.FileHandle,
  data: T,
): Promise<void> {
  return fs.promises.writeFile(
    path,
    // eslint-disable-next-line no-undefined
    JSON.stringify(data, undefined, ENABLE_PRETTY_PRINT ? 2 : undefined),
  );
}
