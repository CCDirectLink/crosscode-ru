interface SimplifyOptions {
  reload(this: this): void;
}

// prettier-ignore
interface SimplifyOptions {
  addEntry(this: this, name: string, type:  sc.OptionDefinition.BUTTON_GROUP['type'], init:  sc.OptionDefinition.BUTTON_GROUP['init'], cat: sc.OPTION_CATEGORY, data?:  sc.OptionDefinition.BUTTON_GROUP['data'], restart?: boolean, header?: string): void;
  addEntry(this: this, name: string, type:  sc.OptionDefinition.ARRAY_SLIDER['type'], init:  sc.OptionDefinition.ARRAY_SLIDER['init'], cat: sc.OPTION_CATEGORY, data?:  sc.OptionDefinition.ARRAY_SLIDER['data'], restart?: boolean, header?: string): void;
  addEntry(this: this, name: string, type: sc.OptionDefinition.OBJECT_SLIDER['type'], init: sc.OptionDefinition.OBJECT_SLIDER['init'], cat: sc.OPTION_CATEGORY, data?: sc.OptionDefinition.OBJECT_SLIDER['data'], restart?: boolean, header?: string): void;
  addEntry(this: this, name: string, type:      sc.OptionDefinition.CHECKBOX['type'], init:      sc.OptionDefinition.CHECKBOX['init'], cat: sc.OPTION_CATEGORY, data?:      sc.OptionDefinition.CHECKBOX['data'], restart?: boolean, header?: string): void;
  addEntry(this: this, name: string, type:      sc.OptionDefinition.CONTROLS['type'], init:      sc.OptionDefinition.CONTROLS['init'], cat: sc.OPTION_CATEGORY, data?:      sc.OptionDefinition.CONTROLS['data'], restart?: boolean, header?: string): void;
  addEntry(this: this, name: string, type:      sc.OptionDefinition.LANGUAGE['type'], init:      sc.OptionDefinition.LANGUAGE['init'], cat: sc.OPTION_CATEGORY, data?:      sc.OptionDefinition.LANGUAGE['data'], restart?: boolean, header?: string): void;
  addEntry(this: this, name: string, type:          sc.OptionDefinition.INFO['type'], init:          sc.OptionDefinition.INFO['init'], cat: sc.OPTION_CATEGORY, data?:          sc.OptionDefinition.INFO['data'], restart?: boolean, header?: string): void;
}

interface SimplifyResources {
  registerHandler(
    this: this,
    handler: (settings: JQueryAjaxSettings, url: string) => void,
    filter?: string | RegExp,
    beforeCall?: boolean,
  ): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loadJSONPatched(this: this, path: string): Promise<any>;
}
declare let simplifyResources: SimplifyResources;

interface Simplify {
  options: SimplifyOptions;
  resources: SimplifyResources;
}
declare let simplify: Simplify;

declare namespace sc {
  enum OPTION_CATEGORY {
    mods = 8,
  }

  namespace OPTIONS_DEFINITION {
    interface KnownTypesMap {
      'logLevel-log': sc.OptionDefinition.CHECKBOX;
      'logLevel-warn': sc.OptionDefinition.CHECKBOX;
      'logLevel-error': sc.OptionDefinition.CHECKBOX;
      'mods-description': sc.OptionDefinition.INFO;
    }
  }

  namespace OptionDefinition {
    interface CHECKBOX {
      checkboxRightAlign?: boolean;
    }

    // eslint-disable-next-line @typescript-eslint/interface-name-prefix
    interface INFO {
      marginBottom: number;
    }
  }
}
