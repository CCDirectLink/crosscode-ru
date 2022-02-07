import registerLocalePatches from './locale-json-patches.js';

sc.ui2.runtimeLocaleJsonPatchesLib = {
  isRuntime: true,

  patchFile(path, callback) {
    return ccmod.resources.jsonPatches.add(path, callback);
  },

  getCurrentLang() {
    return ig.currentLang;
  },

  getLangLabelText(data, forLang, allowEmpty) {
    if (forLang == null) {
      return ig.LangLabel.getText(data, allowEmpty);
    } else {
      let realCurrentLang = ig.currentLang;
      try {
        ig.currentLang = forLang;
        return ig.LangLabel.getText(data, allowEmpty);
      } finally {
        ig.currentLang = realCurrentLang;
      }
    }
  },

  mergeObjects(original, extended) {
    return ig.merge(original, extended, /* noArrayMerge */ true);
  },
};

registerLocalePatches(sc.ui2.runtimeLocaleJsonPatchesLib);
