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
    // eslint-disable-next-line @typescript-eslint/prefer-function-type
    new (
      font: ig.MultiFont,
      text: sc.ui2.ParsedTextData,
      settings: ig.TextBlock.Settings,
    ): TextBlock;
  }
}

declare namespace sc {
  interface TextGui {
    tickerHook: sc.ui2.TickerDisplayHook;
  }
}

declare namespace sc.ui2 {
  namespace TickerDisplayHook {
    type RenderTextCallback = (renderer: ig.GuiRenderer, x: number, y: number) => void;

    interface FocusTarget {
      focus?: boolean;
      keepPressed?: boolean;
      pressed?: boolean;
    }
  }
  interface TickerDisplayHook {
    hook: ig.GuiHook;
    renderText: TickerDisplayHook.RenderTextCallback;
    enable: boolean;
    timer: number;
    speed: number;
    delayAtBorders: number;
    constantTextOffset: Vec2;
    shadowGfx: ig.Image;
    maxWidth: number | null | undefined;
    focusTarget: TickerDisplayHook.FocusTarget | null | undefined;
    focusTargetKeepPressed: boolean;

    update(this: this): void;
    updateDrawables(this: this, renderer: ig.GuiRenderer): void;
    _tryRenderTicker(this: this, renderer: ig.GuiRenderer): boolean;
  }
  interface TickerDisplayHookConstructor extends ImpactClass<TickerDisplayHook> {
    new (
      hook: ig.GuiHook,
      renderText: sc.ui2.TickerDisplayHook.RenderTextCallback,
    ): TickerDisplayHook;

    PATTERN_SHADOW_LEFT: ig.ImagePattern;
    PATTERN_SHADOW_RIGHT: ig.ImagePattern;
  }
  let TickerDisplayHook: TickerDisplayHookConstructor;

  interface ParsedTextData extends ig.Class {
    parsedText: string;
    commands: ig.TextCommand[];
  }
  interface ParsedTextDataConstructor extends ImpactClass<ParsedTextData> {
    new (parsedText: string, commands: ig.TextCommand[]): ParsedTextData;
  }
  let ParsedTextData: ParsedTextDataConstructor;

  namespace LongHorizontalTextGui {
    interface Settings {
      font?: ig.MultiFont;
      linePadding?: number;
    }
  }
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
  interface LongHorizontalTextGuiConstructor extends ImpactClass<LongHorizontalTextGui> {
    new (
      text: sc.TextLike,
      settings?: sc.ui2.LongHorizontalTextGui.Settings,
    ): LongHorizontalTextGui;

    SPLIT_WIDTH: number;
  }
  let LongHorizontalTextGui: LongHorizontalTextGuiConstructor;

  namespace IconTextGui {
    interface Settings {
      font?: ig.MultiFont;
      linePadding?: number;
    }
  }
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
    new (text: sc.TextLike, settings?: sc.ui2.IconTextGui.Settings): IconTextGui;
  }
  let IconTextGui: IconTextGuiConstructor;
}
