import * as fsUtils from './utils/fs.js';
import * as paths from './paths.js';

export interface Settings {
  autoOpen: boolean;
}

export function readSettings(): Promise<Settings> {
  return fsUtils.readJsonFile(paths.SETTINGS_FILE, 'utf8').catch(err => {
    if (err.code === 'ENOENT') {
      return {
        autoOpen: false,
      };
    } else {
      throw err;
    }
  });
}
