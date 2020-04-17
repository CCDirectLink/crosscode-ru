/* eslint-disable @typescript-eslint/camelcase */

interface GameLocaleConfiguration {
  added_locales: { [locale: string]: ig.LangOptions };

  get_final_locale(this: this): Promise<string> | string;
}

declare namespace LocalizeMe {
  type Resource<T> = T | (() => MaybePromise<T>);
  type TranslationResult =
    | string
    | { orig: string; text: string }
    | { ciphertext: string; hmac?: string };

  interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  interface FontPatchingContextCommon {
    char_height: number;
    size_index: number;
    base_image: ig.Image.Data;
  }

  interface PrePatchFontContext extends FontPatchingContextCommon {
    set_base_image(img: ig.Image.Data): void;
  }

  interface PatchFontContext extends FontPatchingContextCommon {
    patched_base_image: ig.Image.Data;
    color: string;
    get_char_pos(c: string): Rectangle;
    set_char_pos(c: string, pos: Rectangle): void;
    recolor_from_base_image(canvas: HTMLCanvasElement): HTMLCanvasElement;
  }

  interface PatchBaseFontContext extends PatchFontContext {
    reserve_char(canvas: HTMLCanvasElement, width: number): Rectangle;
    import_from_font(
      canvas: HTMLCanvasElement,
      ig_font: ig.Font,
      start_char: string,
    ): HTMLCanvasElement;
  }
}

declare namespace ig {
  // Yes. right now every property passed via `add_locale` is visible in
  // `ig.LANG_DETAILS`. Don't know if this is a good thing or not, I'll write
  // type declarations regardless.
  interface LangOptions {
    localizeme_global_index?: number;

    from_locale?: string;
    map_file?: string; // TODO: define this correctly
    url_prefix?: string;
    missing_cb?: (
      lang_label_or_string: ig.LangLabel.Data | string,
      dict_path: string,
    ) => string;
    language?: ig.LangLabel.Data;
    text_filter?: (
      text: string,
      translation_result: LocalizeMe.TranslationResult,
    ) => string;
    patch_base_font: (
      canvas: HTMLCanvasElement,
      context: LocalizeMe.PatchBaseFontContext,
    ) => ig.Image.Data;
    pre_patch_font: (
      context: LocalizeMe.PrePatchFontContext,
    ) => MaybePromise<void>;
    number_locale?: string;
    format_number?: (
      number: number,
      precision: number,
      suffix: string,
      template: string,
    ) => string;
    misc_time_function?: () => string;
    flag?: LocalizeMe.Resource<ig.Image.Data | string>;
  }
}

interface LocalizeMe {
  game_locale_config: GameLocaleConfiguration;

  add_locale(
    this: this,
    name: string,
    options: NullablePartial<ig.LangOptions>,
  ): void;
}

declare let localizeMe: LocalizeMe;
