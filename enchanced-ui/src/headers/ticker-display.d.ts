declare namespace ig {
  interface TextParser {
    parse(
      this: this,
      text: sc.ui2.ParsedTextData,
      commands: ig.TextCommand[] | null,
      font: ig.MultiFont,
      ignoreCommands?: boolean,
    ): string;
  }

  interface TextBlock {
    setText(this: this, text: sc.ui2.ParsedTextData): void;
  }
  interface TextBlockConstructor {
    new (
      font: ig.MultiFont,
      text: sc.ui2.ParsedTextData,
      settings: ig.TextBlock.Settings,
    ): this['__instance'];
  }
}

declare namespace sc {
  interface TextGui {
    tickerHook: sc.ui2.TickerDisplayHook;
  }
}

declare namespace sc.ui2 {
  namespace TickerDisplayHook {
    type RenderTextCallback = (
      renderer: ig.GuiRenderer,
      x: number,
      y: number,
    ) => void;
  }
  interface TickerDisplayHook {
    hook: ig.GuiHook;
    renderText: sc.ui2.TickerDisplayHook.RenderTextCallback;
    timer: number;
    speed: Vec2;
    delayAtBorders: Vec2;
    constantTextOffset: Vec2;
    shadowSize: Vec2;
    shadowGfx: ig.Image;
    maxSize: Partial<Vec2> | null;
    focusTarget: ig.FocusGui | null;
    focusTargetKeepPressed: boolean;

    update(this: this): void;
    updateDrawables(this: this, renderer: ig.GuiRenderer): void;
    _tryRenderTicker(this: this, renderer: ig.GuiRenderer): boolean;
    _computeMaxSize(this: this): Vec2 | null;
  }
  interface TickerDisplayHookConstructor
    extends ImpactClass<TickerDisplayHook> {
    new (
      hook: ig.GuiHook,
      renderText: sc.ui2.TickerDisplayHook.RenderTextCallback,
    ): this['__instance'];

    PATTERN_SHADOW_LEFT: ig.ImagePattern;
    PATTERN_SHADOW_RIGHT: ig.ImagePattern;
  }
  let TickerDisplayHook: TickerDisplayHookConstructor;

  interface ParsedTextData extends ig.Class {
    parsedText: string;
    commands: ig.TextCommand[];
  }
  interface ParsedTextDataConstructor extends ImpactClass<ParsedTextData> {
    new (parsedText: string, commands: ig.TextCommand[]): this['__instance'];
  }
  let ParsedTextData: ParsedTextDataConstructor;

  interface LongHorizontalTextGui extends ig.GuiElementBase {
    text: string;
    parsedText: string;
    commands: ig.TextCommand[];
    textBlocks: ig.TextBlock[];
    font: ig.MultiFont;
    linePadding: number;
    tickerHook: sc.ui2.TickerDisplayHook;

    setText(this: this, text: sc.TextLike): void;
    prerender(this: this): void;
    clear(this: this): void;
  }
  interface LongHorizontalTextGuiConstructor
    extends ImpactClass<LongHorizontalTextGui> {
    new (text: sc.TextLike, settings?: sc.TextGui.Settings): this['__instance'];

    SPLIT_WIDTH: number;
  }
  let LongHorizontalTextGui: LongHorizontalTextGuiConstructor;

  interface IconTextGui extends ig.GuiElementBase {
    font: ig.MultiFont;
    text: string;
    iconTextBlock: ig.TextBlock;
    textBlock: ig.TextBlock;
    tickerHook: sc.ui2.TickerDisplayHook;

    setText(this: this, text: sc.TextLike): void;
    _updateDimensions(this: this): void;
    setDrawCallback(this: this, callback: ig.TextBlock.DrawCallback): void;
    prerender(this: this): void;
    clear(this: this): void;
  }
  interface IconTextGuiConstructor extends ImpactClass<IconTextGui> {
    new (text: sc.TextLike, settings?: sc.TextGui.Settings): this['__instance'];
  }
  let IconTextGui: IconTextGuiConstructor;
}
