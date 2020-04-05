/* eslint-disable @typescript-eslint/camelcase */

interface GameLocaleConfiguration {
  added_locales: { [locale: string]: LocalizeMe.LangOptions };

  get_final_locale(this: this): Promise<string> | string;
  // get_index_of_locale(this: this, locale: string): number | null;
}

declare namespace LocalizeMe {
  interface LangOptions extends ig.LangOptions {
    localizeme_global_index: number;
  }
}

interface LocalizeMe {
  game_locale_config: GameLocaleConfiguration;
}

declare let localizeMe: LocalizeMe;
