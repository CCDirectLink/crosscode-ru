// TypeScript definitions for CrossCode v1.2.0-5

declare interface Vec2 {
  x: number;
  y: number;
}

declare type ImpactClassGetInitArgs<Instance> = Instance extends {
  init(...args: infer Args): void;
}
  ? Args
  : unknown[];

type ReplaceThisParameter<T, This2> = T extends (
  this: infer This,
  ...args: infer Args
) => infer Return
  ? unknown extends This
    ? T
    : (this: This2, ...args: Args) => Return
  : T;

type ImpactClassMember<
  K extends keyof Instance,
  Instance,
  ParentInstance
> = ReplaceThisParameter<
  Instance[K],
  Instance & {
    // definition ends up becoming too complicated when I try to implement
    // inference of argument and return types of `this.parent`, and as I'm
    // concerned about compiler performance, I defined a much simpler version
    // instead.
    parent(this: ParentInstance, ...args: unknown[]): unknown;
  }
>;

type ImpactClassPrototype<Instance, ParentInstance> = {
  [K in keyof Instance]?: ImpactClassMember<K, Instance, ParentInstance> | null;
};

declare interface ImpactClass<Instance> {
  new (...args: ImpactClassGetInitArgs<Instance>): Instance;
  extend<ChildConstructor extends { prototype: unknown }>(
    this: this,
    obj: ImpactClassPrototype<ChildConstructor['prototype'], Instance>,
  ): ChildConstructor;
  inject(this: this, obj: ImpactClassPrototype<Instance, Instance>): void;
  readonly classId: number;
  readonly prototype: Instance;
}

declare namespace ig {
  // eslint-disable-next-line no-shadow
  function module(this: typeof ig, name: string): typeof ig;
  function requires(this: typeof ig, ...names: string[]): typeof ig;
  function defines(this: typeof ig, body: () => void): void;

  interface Module {
    requires: string[];
    loaded: boolean;
    body: (() => void) | null;
  }

  let modules: Record<string, Module>;
  let _waitForOnload: number;
  function _execModules(this: typeof ig): void;

  interface Class {
    readonly classId: number;
  }
  interface ClassConstructor extends ImpactClass<Class> {}
  let Class: ClassConstructor;

  let currentLang: string;
}

declare namespace sc {}

declare interface Number {
  limit(min: number, max: number): number;
}

/* module impact.base.loader */

declare namespace ig {
  interface Loadable extends Class {}
  interface LoadableConstructor extends ImpactClass<Loadable> {}
  let Loadable: LoadableConstructor;
}

/* module impact.base.image */

declare namespace ig {
  interface Image extends Loadable {}
  interface ImageConstructor extends ImpactClass<Image> {}
  // eslint-disable-next-line no-shadow
  let Image: ImageConstructor;
}

/* module impact.base.font */

declare namespace ig {
  interface TextCommand {
    index: number;
    command: { brake: number } | { color: number } | { speed: number };
  }

  enum FontALIGN_ {
    LEFT,
    RIGHT,
    CENTER,
  }

  namespace Font {
    type ALIGN = FontALIGN_;
  }

  interface Font extends Image {}
  interface FontConstructor extends ImpactClass<Font> {
    ALIGN: typeof FontALIGN_;
  }
  let Font: FontConstructor;

  interface MultiFont extends Font {
    iconSets: ig.Font[];

    getTextDimensions(
      this: this,
      text: string,
      linePadding: number,
    ): TextBlock.Size;
    wrapText(
      this: this,
      text: string,
      maxWidth: number,
      linePadding: number,
      bestRatio: number | null | undefined,
      commands: ig.TextCommand[],
    ): string;
    getCharWidth(this: this, code: number): number;
  }
  interface MultiFontConstructor extends ImpactClass<MultiFont> {
    ICON_START: number;
    ICON_END: number;
  }
  let MultiFont: MultiFontConstructor;

  enum TextBlockSPEED_ {
    SLOWEST,
    SLOWER,
    SLOW,
    NORMAL,
    FAST,
    FASTER,
    FASTEST,
    IMMEDIATE,
  }

  namespace TextBlock {
    interface Settings {
      speed?: ig.TextBlock.SPEED;
      textAlign?: ig.Font.ALIGN;
      maxWidth?: number;
      bestRatio?: number;
      linePadding?: number;
    }

    type SPEED = TextBlockSPEED_;

    type DrawCallback = (width: number, height: number) => void;

    interface Size {
      x: number;
      y: number;
      lines: number[];
      lineIdx: number[];
    }
  }

  interface TextBlock extends Class {
    font: MultiFont;
    maxWidth?: number;
    parsedText: string;
    commands: ig.TextCommand[];
    speed: TextBlock.SPEED;
    align: Font.ALIGN;
    size: TextBlock.Size;
    bestRatio?: number;
    linePadding: number;

    init(
      this: this,
      font: ig.MultiFont,
      text: string,
      settings: TextBlock.Settings,
    ): void;
    setText(this: this, text: string): void;
    setDrawCallback(this: this, drawCallback: TextBlock.DrawCallback): void;
    prerender(this: this): void;
    clearPrerendered(this: this): void;
    reset(this: this): void;
    isFinished(this: this): boolean;
    update(this: this): void;
  }
  interface TextBlockConstructor extends ImpactClass<TextBlock> {
    SPEED: typeof TextBlockSPEED_;
  }
  let TextBlock: TextBlockConstructor;

  interface TextParser {
    parse(
      this: this,
      text: string,
      commands: ig.TextCommand[],
      font: MultiFont,
    ): string;
  }
  let TextParser: TextParser;
}

/* module impact.base.system */

declare namespace ig {
  interface System extends Class {
    tick: number;
  }
  interface SystemConstructor extends ImpactClass<System> {}
  let System: SystemConstructor;
  let system: System;
}

/* module game.config */

declare namespace ig {
  let LANG_DETAILS: {
    [locale: string]: {
      systemFont?: string;
      useFor?: string;
      commaDigits?: boolean;
      fixedMsgWidth?: boolean;
      newlineAnywhere?: boolean;
      newlineException?: string[];
      newlineAfter?: string[];
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      metrics?: typeof SYSTEM_FONT_METRICS;
    };
  };

  let SYSTEM_FONT_METRICS: { size: number[]; baseLine: number[] };
}

/* module impact.base.game */

declare namespace ig {
  interface GameAddon extends Class {}
  interface GameAddonConstructor extends ImpactClass<GameAddon> {}
  let GameAddon: GameAddonConstructor;
}

/* module impact.feature.gui.gui */

declare namespace ig {
  interface GuiRenderer extends Class {
    addColor(
      this: this,
      color: string,
      x: number,
      y: number,
      w: number,
      h: number,
    ): GuiDrawable;
    addText(
      this: this,
      textBlock: TextBlock,
      x: number,
      y: number,
    ): GuiDrawable;

    addTransform(this: this): GuiTransform;
    undoTransform(this: this): void;
  }

  enum GUI_ALIGN {
    Y_TOP,
    Y_CENTER,
    Y_BOTTOM,
    X_LEFT,
    X_CENTER,
    X_RIGHT,
  }

  interface GuiHook extends Class {
    pos: Vec2;
    size: Vec2;
    align: { x: ig.GUI_ALIGN; y: ig.GUI_ALIGN };
    children: GuiHook[];
  }
  interface GuiHookConstructor extends ImpactClass<GuiHook> {}
  let GuiHook: GuiHookConstructor;

  interface GuiDrawable extends Class {
    setAlpha(this: this, alpha: number): this;
  }
  interface GuiDrawableConstructor extends ImpactClass<GuiDrawable> {}
  let GuiDrawable: GuiDrawableConstructor;

  interface GuiTransform extends Class {
    setTranslate(this: this, x: number, y: number): this;
    setClip(this: this, x: number, y: number): this;
  }
  interface GuiTransformConstructor extends ImpactClass<GuiTransform> {}
  let GuiTransform: GuiTransformConstructor;

  interface GuiElementBase extends Class {
    hook: GuiHook;

    setSize(this: this, w: number, h: number): void;
    setPivot(this: this, x: number, y: number): void;
    isVisible(this: this): boolean;
    update(this: this): void;
    updateDrawables(this: this, renderer: GuiRenderer): void;
    onAttach(this: this, parentHook: ig.GuiHook): void;
    onDetach(this: this): void;

    onVisibilityChange(this: this, visible: boolean): void;
  }
  interface GuiElementBaseConstructor extends ImpactClass<GuiElementBase> {}
  let GuiElementBase: GuiElementBaseConstructor;
}

/* module impact.feature.interact.gui.focus-gui */

declare namespace ig {
  interface FocusGui extends ig.GuiElementBase {
    focus: boolean;
    keepPressed: boolean;
    pressed: boolean;
  }
  interface FocusGuiConstructor extends ImpactClass<FocusGui> {}
  let FocusGui: FocusGuiConstructor;
}

/* module game.feature.font.font-system */

declare namespace sc {
  interface FontSystem extends ig.GameAddon {
    font: ig.MultiFont;
  }
  interface FontSystemConstructor extends ImpactClass<FontSystem> {}
  let FontSystem: FontSystemConstructor;
  let fontsystem: FontSystem;
}

/* module game.feature.gui.base.text */

declare namespace sc {
  type TextLike = string | { toString(): string } | null;

  namespace TextGui {
    interface Settings extends ig.TextBlock.Settings {
      font?: ig.MultiFont;
      drawCallback?: ig.TextBlock.DrawCallback;
    }
  }

  interface TextGui extends ig.GuiElementBase {
    text: string;
    textBlock: ig.TextBlock;

    init(this: this, text: string, settings?: TextGui.Settings): void;

    setText(this: this, text: TextLike): void;
  }
  interface TextGuiConstructor extends ImpactClass<TextGui> {}
  let TextGui: TextGuiConstructor;
}
