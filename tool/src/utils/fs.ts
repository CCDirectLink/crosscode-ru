import fs from '../node-builtin-modules/fs.js';

const ENABLE_PRETTY_PRINT = true;

export async function readJsonFile(
  path: fs.PathLike | fs.promises.FileHandle,
): Promise<any> {
  let data = await fs.promises.readFile(path, 'utf8');
  return JSON.parse(data);
}

export async function readJsonFileOptional(
  path: fs.PathLike | fs.promises.FileHandle,
): Promise<any | null> {
  try {
    return await readJsonFile(path);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    else throw err;
  }
}

export function writeJsonFile(
  path: fs.PathLike | fs.promises.FileHandle,
  data: any,
): Promise<void> {
  return fs.promises.writeFile(
    path,
    // eslint-disable-next-line no-undefined
    JSON.stringify(data, undefined, ENABLE_PRETTY_PRINT ? 2 : undefined),
  );
}
