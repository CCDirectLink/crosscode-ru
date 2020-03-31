declare namespace ig {
  interface TextParser {
    parse(
      this: this,
      text: sc.ru.ParsedTextData,
      commands: ig.TextCommand[],
      font: ig.MultiFont,
    ): string;
  }

  interface TextBlock {
    init(
      this: this,
      text: sc.ru.ParsedTextData,
      commands: ig.TextCommand[],
      font: ig.MultiFont,
    ): void;
    setText(this: this, text: sc.ru.ParsedTextData): void;
  }
  interface TextBlockConstructor {
    new (
      font: ig.MultiFont,
      text: sc.ru.ParsedTextData,
      settings: ig.TextBlock.Settings,
    ): ig.TextBlock;
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

    init(
      this: this,
      hook: ig.GuiHook,
      renderText: sc.ru.TickerDisplayHook.RenderTextCallback,
    ): void;

    setMaxSize(this: this, maxSize: Partial<Vec2> | null): void;
    update(this: this): void;
    updateDrawables(this: this, renderer: ig.GuiRenderer): void;
    _tryRenderTicker(this: this, renderer: ig.GuiRenderer): boolean;
    _computeMaxSize(this: this): Vec2 | null;
  }
  interface TickerDisplayHookConstructor
    extends ImpactClass<TickerDisplayHook> {}
  let TickerDisplayHook: TickerDisplayHookConstructor;

  interface ParsedTextData extends ig.Class {
    parsedText: string;
    commands: ig.TextCommand[];

    init(this: this, parsedText: string, commands: ig.TextCommand[]): void;
  }
  interface ParsedTextDataConstructor extends ImpactClass<ParsedTextData> {}
  let ParsedTextData: ParsedTextDataConstructor;

  interface LongHorizontalTextGui extends ig.GuiElementBase {
    text: string;
    parsedText: string;
    commands: ig.TextCommand[];
    textBlocks: ig.TextBlock[];
    font: ig.MultiFont;
    linePadding: number;
    tickerHook: sc.ru.TickerDisplayHook;

    init(this: this, text: sc.TextLike, settings?: sc.TextGui.Settings): void;

    setText(this: this, text: sc.TextLike): void;
    prerender(this: this): void;
    clear(this: this): void;
  }
  interface LongHorizontalTextGuiConstructor
    extends ImpactClass<LongHorizontalTextGui> {
    SPLIT_WIDTH: number;
  }
  let LongHorizontalTextGui: LongHorizontalTextGuiConstructor;

  interface IconTextGui extends ig.GuiElementBase {
    font: ig.MultiFont;
    text: string;
    iconTextBlock: ig.TextBlock;
    textBlock: ig.TextBlock;
    tickerHook: sc.ru.TickerDisplayHook;

    init(this: this, text: sc.TextLike, settings?: sc.TextGui.Settings): void;

    setText(this: this, text: sc.TextLike): void;
    _updateDimensions(this: this): void;
    setDrawCallback(this: this, callback: ig.TextBlock.DrawCallback): void;
    prerender(this: this): void;
    clear(this: this): void;
  }
  interface IconTextGuiConstructor extends ImpactClass<IconTextGui> {}
  let IconTextGui: IconTextGuiConstructor;
}
