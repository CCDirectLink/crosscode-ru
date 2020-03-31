/* eslint-disable @typescript-eslint/camelcase */

interface GameLocaleConfiguration {
  get_final_locale(this: this): Promise<string> | string;
}

interface LocalizeMe {
  game_locale_config: GameLocaleConfiguration;
}

// mark this file as a module to enable global scope augmentation
export {};

declare global {
  let localizeMe: LocalizeMe;
}
