import fs from '../node-builtin-modules/fs.js';
import paths from '../node-builtin-modules/path.js';

const ENABLE_PRETTY_PRINT = true;

export async function readJsonFile<T>(path: fs.PathLike | fs.promises.FileHandle): Promise<T> {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  replacer?: (this: any, key: string, value: any) => any,
): Promise<void> {
  return fs.promises.writeFile(
    path,
    // eslint-disable-next-line no-undefined
    `${JSON.stringify(data, replacer, ENABLE_PRETTY_PRINT ? 2 : undefined)}\n`,
  );
}

export async function* findFilesRecursively(
  dir: string,
  relativePrefix = '',
): AsyncGenerator<string> {
  let contents: string[] = await fs.promises.readdir(dir);

  for (let name of contents) {
    let fullPath = paths.join(dir, name);
    let stat = await fs.promises.stat(fullPath);
    if (stat.isDirectory()) {
      yield* findFilesRecursively(fullPath, paths.join(relativePrefix, name));
    } else {
      yield paths.join(relativePrefix, name);
    }
  }
}
