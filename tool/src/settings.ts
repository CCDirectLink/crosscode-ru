import * as fsUtils from './utils/fs.js';
import * as paths from './paths.js';

export interface Settings {
  autoOpen: boolean;
  useNotabridge: boolean;
}

export async function readSettings(): Promise<Settings> {
  let settings: Settings | null = await fsUtils.readJsonFileOptional(paths.SETTINGS_FILE);
  if (settings == null) {
    settings = {
      autoOpen: true,
      useNotabridge: false,
    };
  }
  // TODO: remove this
  console.log('settings:', settings);
  return settings;
}

export function writeSettings(settings: Settings): Promise<void> {
  console.log('writing settings:', settings);
  return fsUtils.writeJsonFile(paths.SETTINGS_FILE, settings);
}
