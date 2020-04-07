declare namespace ig {
  interface TextParser {
    parse(
      this: this,
      text: sc.ru.ParsedTextData,
      commands: ig.TextCommand[] | null,
      font: ig.MultiFont,
      ignoreCommands?: boolean,
    ): string;
  }

  interface TextBlock {
    setText(this: this, text: sc.ru.ParsedTextData): void;
  }
  interface TextBlockConstructor {
    new (
      font: ig.MultiFont,
      text: sc.ru.ParsedTextData,
      settings: ig.TextBlock.Settings,
    ): this['__instance'];
  }
}

declare namespace sc {
  interface TextGui {
    tickerHook: sc.ru.TickerDisplayHook;
  }
}

declare namespace sc.ru {
  namespace TickerDisplayHook {
    type RenderTextCallback = (
      renderer: ig.GuiRenderer,
      x: number,
      y: number,
    ) => void;
  }

  interface TickerDisplayHook {
    hook: ig.GuiHook;
    renderText: sc.ru.TickerDisplayHook.RenderTextCallback;
    timer: number;
    speed: Vec2;
    delayAtBorders: Vec2;
    constantTextOffset: Vec2;
    maxSize: Partial<Vec2> | null;
    focusTarget: ig.FocusGui | null;

    setMaxSize(this: this, maxSize: Partial<Vec2> | null): void;
    update(this: this): void;
    updateDrawables(this: this, renderer: ig.GuiRenderer): void;
    _tryRenderTicker(this: this, renderer: ig.GuiRenderer): boolean;
    _computeMaxSize(this: this): Vec2 | null;
  }
  interface TickerDisplayHookConstructor
    extends ImpactClass<TickerDisplayHook> {
    new (
      hook: ig.GuiHook,
      renderText: sc.ru.TickerDisplayHook.RenderTextCallback,
    ): this['__instance'];
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
    tickerHook: sc.ru.TickerDisplayHook;

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
    tickerHook: sc.ru.TickerDisplayHook;

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
