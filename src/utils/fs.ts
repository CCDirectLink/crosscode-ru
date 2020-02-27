import fs from '../node-builtin-modules/fs.js';

const ENABLE_PRETTY_PRINT = true;

export async function readJsonFile(
  path: fs.PathLike | fs.promises.FileHandle,
  options:
    | { encoding: BufferEncoding; flag?: string | number }
    | BufferEncoding,
): Promise<any> {
  let data = await fs.promises.readFile(path, options);
  return JSON.parse(data);
}

export async function readJsonFileOptional(
  path: fs.PathLike | fs.promises.FileHandle,
  options:
    | { encoding: BufferEncoding; flag?: string | number }
    | BufferEncoding,
): Promise<any | null> {
  try {
    return await readJsonFile(path, options);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    else throw err;
  }
}

export function writeJsonFile(
  path: fs.PathLike | fs.promises.FileHandle,
  data: any,
  options?:
    | {
        encoding?: string | null;
        mode?: string | number;
        flag?: string | number;
      }
    | string
    | null,
): Promise<void> {
  return fs.promises.writeFile(
    path,
    JSON.stringify(data, undefined, ENABLE_PRETTY_PRINT ? 2 : undefined),
    options,
  );
}
