/* eslint-disable @typescript-eslint/naming-convention */

declare namespace LocalizeMe {
  type Resource<T> = T | (() => MaybePromise<T>);
  interface TranslationResult {
    orig: string;
    text: string;
  }
  type TranslationPack = Record<string, TranslationResult>;

  type MapFileFunction = (
    url_to_patch: string,
  ) =>
    | string
    | (() => MaybePromise<TranslationPack | TranslationPackFunction>)
    | null;
  type TranslationPackFunction = (dict_path: string) => TranslationResult;

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
  interface LangOptions {
    localizeme_global_index?: number;

    from_locale?: string;
    map_file?: string | (() => MaybePromise<LocalizeMe.MapFileFunction>);
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
  add_locale(
    this: this,
    name: string,
    options: NullablePartial<ig.LangOptions>,
  ): void;

  register_locale_chosen(this: this, func: () => void): void;
}

declare let localizeMe: LocalizeMe;
