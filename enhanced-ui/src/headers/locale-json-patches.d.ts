declare namespace sc.ui2 {
  namespace LocaleJsonPatchesLib {
    type PatcherCallback = (data: unknown) => MaybePromise<unknown | void>;
  }

  interface LocaleJsonPatchesLib {
    readonly isRuntime: boolean;
    patchFile(path: string, callback: sc.ui2.LocaleJsonPatchesLib.PatcherCallback): void;
    getCurrentLang(): string;
    getLangLabelText(
      data: ig.LangLabel.Data,
      forLang?: string | null,
      allowEmpty?: boolean | null,
    ): string;
    mergeObjects<T, U>(original: T, extended: U): T & U;
  }

  let runtimeLocaleJsonPatchesLib: LocaleJsonPatchesLib;
}
