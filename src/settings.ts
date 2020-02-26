import * as fsUtils from './utils/fs.js';
import * as paths from './paths.js';

export interface Settings {
  autoOpen: boolean;
}

export async function readSettings(): Promise<Settings> {
  let settings: Settings = {
    autoOpen: true,
  };
  try {
    settings = await fsUtils.readJsonFile(paths.SETTINGS_FILE, 'utf8');
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  console.log('settings:', settings);
  return settings;
}

export function writeSettings(settings: Settings): Promise<void> {
  console.log('writing settings:', settings);
  return fsUtils.writeJsonFile(paths.SETTINGS_FILE, settings, 'utf8');
}
