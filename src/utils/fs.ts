import fs from '../node-builtin-modules/fs.js';

const ENABLE_PRETTY_PRINT = true;

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
