/* eslint-disable @typescript-eslint/camelcase */

interface GameLocaleConfiguration {
  get_final_locale(this: this): Promise<string> | string;
}

interface LocalizeMe {
  game_locale_config: GameLocaleConfiguration;
}

declare let localizeMe: LocalizeMe;
