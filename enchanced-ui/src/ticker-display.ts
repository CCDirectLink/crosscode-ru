// TODO: replace default parameter syntax with `== null` checks

ig.module('enchanced-ui.ticker-display')
  .requires(
    'impact.base.system',
    'impact.feature.gui.gui',
    'game.feature.gui.base.text',
    'impact.base.font',
    'game.feature.font.font-system',
  )
  .defines(() => {
    function triangleWave(x: number, a: number): number {
      return Math.abs(Math.abs((x - a) % (2 * a)) - a);
    }

    function textLikeToString(text: sc.TextLike): string {
      if (text == null) return '';
      if (typeof text === 'object') return text.toString();
      return text;
    }

    sc.ui2.TickerDisplayHook = ig.Class.extend({
      hook: null,
      renderText: null,
      timer: 0, // seconds
      speed: { x: 50, y: 50 }, // pixels per second
      delayAtBorders: { x: 1, y: 1 }, // seconds
      constantTextOffset: { x: 0, y: 0 }, // pixels
      shadowGfx: new ig.Image('media/gui/ticker-display-shadow.png'),
      maxSize: null,
      focusTarget: null,
      focusTargetKeepPressed: false,

      init(hook, renderText) {
        this.hook = hook;
        this.renderText = renderText;

        if (this.constructor.PATTERN_SHADOW_LEFT == null) {
          this.constructor.PATTERN_SHADOW_LEFT = this.shadowGfx.createPattern(
            0,
            0,
            8,
            1,
            ig.ImagePattern.OPT.REPEAT_Y,
          );
        }
        if (this.constructor.PATTERN_SHADOW_RIGHT == null) {
          this.constructor.PATTERN_SHADOW_RIGHT = this.shadowGfx.createPattern(
            0,
            1,
            8,
            1,
            ig.ImagePattern.OPT.REPEAT_Y,
          );
        }
      },

      update() {
        if (
          this.focusTarget != null &&
          !(
            this.focusTarget.focus ||
            (this.focusTargetKeepPressed &&
              this.focusTarget.keepPressed &&
              this.focusTarget.pressed)
          )
        ) {
          this.timer = 0;
          return;
        }

        this.timer += ig.system.tick;
      },

      updateDrawables(renderer) {
        let tickerDrawn = this._tryRenderTicker(renderer);
        if (tickerDrawn) return;
        this.renderText(
          renderer,
          this.constantTextOffset.x,
          this.constantTextOffset.y,
        );
      },

      _tryRenderTicker(renderer) {
        let maxSize = this._computeMaxSize();
        if (maxSize == null) return false;

        let { size, align } = this.hook;

        let prtPos = { x: 0, y: 0 };
        if (align.x === ig.GUI_ALIGN.X_CENTER) {
          // dunno why, but Math.ceil does centering better than Math.floor here
          prtPos.x = Math.ceil((size.x - maxSize.x) / 2);
        } else if (align.x === ig.GUI_ALIGN.X_RIGHT) {
          prtPos.x = size.x - maxSize.x;
        }
        if (align.y === ig.GUI_ALIGN.Y_CENTER) {
          prtPos.y = Math.ceil((size.y - maxSize.y) / 2);
        } else if (align.y === ig.GUI_ALIGN.Y_BOTTOM) {
          prtPos.y = size.y - maxSize.y;
        }

        if (sc.ui2.debug.showTickerBoundaryBoxes) {
          renderer.addColor('red', 0, 0, size.x, size.y).setAlpha(0.25);
          renderer
            .addColor('green', prtPos.x, prtPos.y, maxSize.x, maxSize.y)
            .setAlpha(0.25);
        }

        let overflow = {
          x: size.x > maxSize.x,
          y: size.y > maxSize.y,
        };
        if (!overflow.x && !overflow.y) return false;

        let clippedSizeX = maxSize.x - this.constantTextOffset.x;
        let clippedSizeY = maxSize.y - this.constantTextOffset.y;

        renderer
          .addTransform()
          .setTranslate(
            prtPos.x + this.constantTextOffset.x,
            prtPos.y + this.constantTextOffset.y,
          )
          .setClip(clippedSizeX, clippedSizeY);

        let maxOffset = {
          x: size.x - maxSize.x,
          y: size.y - maxSize.y,
        };

        // TODO: display shadows at the overflowing side
        const calculateOffset = (axis: 'x' | 'y'): number => {
          if (!overflow[axis]) return 0;
          let length = maxOffset[axis];
          let spd = this.speed[axis];
          // multiply the delay by speed so that delay isn't affected by speed
          // and always means the same time in seconds
          let scaledDelay = this.delayAtBorders[axis] * spd;
          return (
            triangleWave(
              this.timer * spd - scaledDelay / 2,
              length + scaledDelay,
            ) -
            scaledDelay / 2
          ).limit(0, length);
        };

        let offsetX = calculateOffset('x');
        let offsetY = calculateOffset('y');

        this.renderText(renderer, -offsetX, -offsetY);

        // Ticker shadows definitely need more refinement if they were to be
        // added, officially but we agreed that they are unnecessary, so I
        // disabled them in production. Although I'm keeping the code if it
        // comes in handy in the future.
        if (overflow.x && !sc.ui2.debug.noTickerShadows) {
          const {
            PATTERN_SHADOW_LEFT,
            PATTERN_SHADOW_RIGHT,
          } = this.constructor;

          const COMPOSITION_MODE = 'overlay';
          // const COMPOSITION_MODE = 'soft-light';
          // const COMPOSITION_MODE = 'destination-out';
          // const COMPOSITION_MODE = 'xor';
          if (offsetX > 0) {
            renderer
              .addPattern(
                PATTERN_SHADOW_LEFT,
                0,
                0,
                0,
                0,
                PATTERN_SHADOW_LEFT.width,
                clippedSizeY,
              )
              .setCompositionMode(COMPOSITION_MODE);
          }
          if (offsetX < maxOffset.x) {
            renderer
              .addPattern(
                PATTERN_SHADOW_RIGHT,
                clippedSizeX - PATTERN_SHADOW_RIGHT.width,
                0,
                0,
                0,
                PATTERN_SHADOW_RIGHT.width,
                clippedSizeY,
              )
              .setCompositionMode(COMPOSITION_MODE);
          }
        }

        renderer.undoTransform();

        return true;
      },

      _computeMaxSize() {
        if (this.maxSize == null) return null;
        return {
          x: this.maxSize.x != null ? this.maxSize.x : this.hook.size.x,
          y: this.maxSize.y != null ? this.maxSize.y : this.hook.size.y,
        };
      },
    });

    sc.TextGui.inject({
      tickerHook: null,

      init(...args) {
        this.parent(...args);
        this.tickerHook = new sc.ui2.TickerDisplayHook(
          this.hook,
          (renderer, x, y) => {
            renderer.addText(this.textBlock, x, y);
          },
        );
      },

      setText(text) {
        if (this.text !== text) this.tickerHook.timer = 0;
        this.parent(text);
      },

      onVisibilityChange(visible) {
        this.parent(visible);
        this.tickerHook.timer = 0;
      },

      update() {
        this.parent();
        if (this.textBlock.isFinished()) this.tickerHook.update();
      },

      updateDrawables(renderer) {
        this.tickerHook.updateDrawables(renderer);
      },
    });

    sc.ui2.ParsedTextData = ig.Class.extend({
      init(parsedText, commands) {
        this.parsedText = parsedText;
        this.commands = commands;
      },
    });

    let textParserParse = ig.TextParser.parse;
    ig.TextParser.parse = function(
      text: string | sc.ui2.ParsedTextData,
      commands: ig.TextCommand[] | null,
      font: ig.MultiFont,
      ignoreCommands?: boolean,
    ): string {
      if (text instanceof sc.ui2.ParsedTextData) {
        if (!ignoreCommands) commands!.push(...text.commands);
        return text.parsedText;
      }
      return (textParserParse as (
        this: ig.TextParser,
        text: string,
        commands: ig.TextCommand[] | null,
        font: ig.MultiFont,
        ignoreCommands?: boolean,
      ) => string).call(this, text as string, commands, font, ignoreCommands);
    };

    ig.TextBlock.inject({
      setText(text: sc.TextLike | sc.ui2.ParsedTextData) {
        this.clearPrerendered();

        if (text instanceof sc.ui2.ParsedTextData) {
          this.parsedText = text.parsedText;
          this.commands = text.commands;
        } else {
          this.commands.length = 0;
          this.parsedText = ig.TextParser.parse(
            textLikeToString(text).trim(),
            this.commands,
            this.font,
          );
        }

        if (this.maxWidth) {
          this.parsedText = this.font.wrapText(
            this.parsedText,
            this.maxWidth,
            this.linePadding,
            this.bestRatio,
            this.commands,
          );
        }
        this.size = this.font.getTextDimensions(
          this.parsedText,
          this.linePadding,
        );
        this.reset();
      },
    });

    sc.ui2.LongHorizontalTextGui = ig.GuiElementBase.extend({
      text: '',
      parsedText: '',
      commands: [],
      textBlocks: [],
      font: null,
      linePadding: null,
      tickerHook: null,

      init(text, settings) {
        this.parent();

        if (settings == null) settings = {};
        this.font = settings.font != null ? settings.font : sc.fontsystem.font;
        this.linePadding =
          settings.linePadding != null ? settings.linePadding : 1;

        this.tickerHook = new sc.ui2.TickerDisplayHook(
          this.hook,
          (renderer, x, y) => {
            let offset = 0;
            this.textBlocks.forEach(tb => {
              // TODO: enable this via a debug flag
              // let color = ['red', 'green', 'blue'][blockIndex % 3];
              // renderer
              //   .addColor(color, x + offset, y, tb.size.x, tb.size.y)
              //   .setAlpha(0.3);
              renderer.addText(tb, x + offset, y);
              offset += tb.size.x;
            });
          },
        );
        this.setText(text);
      },

      setText(text) {
        this.clear();
        this.textBlocks = [];
        if (this.text !== text) this.tickerHook.timer = 0;

        let textBlockSettings = {
          speed: ig.TextBlock.SPEED.IMMEDIATE,
          linePadding: this.linePadding,
        };

        this.text = textLikeToString(text);
        this.commands = [];
        this.parsedText = ig.TextParser.parse(
          this.text,
          this.commands,
          this.font,
        );

        this.setSize(0, 0);
        let textWidth = 0;
        let blockStart = 0;
        let lastColor = 0;

        const flushBlock = (blockEnd: number): void => {
          let blockParsedText = this.parsedText.slice(blockStart, blockEnd + 1);
          let blockCommands = this.commands
            .filter(
              ({ index, command }) =>
                'color' in command && index >= blockStart && index <= blockEnd,
            )
            .map(({ index, command }) => ({
              index: index - blockStart,
              command,
            }));
          blockCommands.unshift({ index: 0, command: { color: lastColor } });

          let textBlock = new ig.TextBlock(
            this.font,
            new sc.ui2.ParsedTextData(blockParsedText, blockCommands),
            textBlockSettings,
          );
          this.textBlocks.push(textBlock);
          this.setSize(
            this.hook.size.x + textBlock.size.x,
            Math.max(this.hook.size.y, textBlock.size.y),
          );

          if (blockCommands.length > 0) {
            let maxCmdIndex = 0;
            blockCommands.forEach(({ index: cmdIndex, command }) => {
              if ('color' in command && cmdIndex >= maxCmdIndex) {
                lastColor = command.color;
                maxCmdIndex = cmdIndex;
              }
            });
          }

          blockStart = blockEnd + 1;
          textWidth = 0;
        };

        for (let i = 0; i < this.parsedText.length; i++) {
          let charWidth = this.font.getCharWidth(this.parsedText.charCodeAt(i));
          let willOverflow =
            textWidth + charWidth > sc.ui2.LongHorizontalTextGui.SPLIT_WIDTH;
          let isFirst = i <= 0;
          let isLast = i >= this.parsedText.length - 1;

          if (willOverflow && !isFirst) flushBlock(i - 1);
          textWidth += charWidth;
          if (isLast) flushBlock(i);
        }

        this.setPivot(
          Math.floor(this.hook.size.x / 2),
          Math.floor(this.hook.size.y / 2),
        );
      },

      prerender() {
        this.textBlocks.forEach(tb => tb.prerender());
      },

      clear() {
        this.textBlocks.forEach(tb => tb.clearPrerendered());
      },

      onVisibilityChange(visible) {
        if (visible) this.prerender();
        else this.clear();
        this.tickerHook.timer = 0;
      },

      onAttach() {
        if (this.isVisible()) this.prerender();
      },

      onDetach() {
        this.clear();
      },

      update() {
        this.textBlocks.forEach(tb => tb.update());
        this.tickerHook.update();
      },

      updateDrawables(renderer) {
        this.tickerHook.updateDrawables(renderer);
      },
    });
    // the splitting width is a smaller than ig.system.width, just to be safe
    sc.ui2.LongHorizontalTextGui.SPLIT_WIDTH = 500;

    function parseIconText(
      text: string,
      font: ig.MultiFont,
    ): {
      firstIcon: string;
      iconCommands: ig.TextCommand[];
      parsedText: string;
      commands: ig.TextCommand[];
    } {
      let commands: ig.TextCommand[] = [];
      let parsedText = ig.TextParser.parse(text, commands, font);
      // NOTE: setDrawCallback might not be handled correctly when the icon
      // string is empty. I should check for changes in draw callback usages in
      // future updates.
      let firstIcon = '';
      let iconCommands: ig.TextCommand[] = [];

      if (parsedText.length > 0 && font.iconSets.length > 0) {
        let firstChar = parsedText.charCodeAt(0);
        if (
          firstChar >= ig.MultiFont.ICON_START &&
          firstChar < ig.MultiFont.ICON_END
        ) {
          firstIcon = String.fromCharCode(firstChar);
          parsedText = parsedText.slice(1);
          iconCommands = [];
          commands.forEach(cmd => {
            cmd.index = Math.max(cmd.index - 1, 0);
            if (cmd.index === 0) iconCommands.push(cmd);
          });
        }
      }

      return { firstIcon, iconCommands, parsedText, commands };
    }

    sc.ui2.IconTextGui = ig.GuiElementBase.extend({
      font: null,
      text: '',
      iconTextBlock: null,
      textBlock: null,
      tickerHook: null,

      init(text, settings) {
        this.parent();

        if (settings == null) settings = {};
        this.font = settings.font != null ? settings.font : sc.fontsystem.font;

        this.text = textLikeToString(text);
        let { firstIcon, iconCommands, parsedText, commands } = parseIconText(
          this.text,
          this.font,
        );

        // TODO: limit `settings` here
        this.iconTextBlock = new ig.TextBlock(
          this.font,
          new sc.ui2.ParsedTextData(firstIcon, iconCommands),
          settings,
        );
        this.textBlock = new ig.TextBlock(
          this.font,
          new sc.ui2.ParsedTextData(parsedText, commands),
          settings,
        );

        this.tickerHook = new sc.ui2.TickerDisplayHook(
          this.hook,
          (renderer, x, y) => {
            renderer.addText(this.textBlock, x, y);
          },
        );

        this._updateDimensions();
      },

      setText(text) {
        if (this.text !== text) this.tickerHook.timer = 0;
        this.text = textLikeToString(text);

        let { firstIcon, iconCommands, parsedText, commands } = parseIconText(
          this.text,
          this.font,
        );

        this.iconTextBlock.setText(
          new sc.ui2.ParsedTextData(firstIcon, iconCommands),
        );
        this.textBlock.setText(new sc.ui2.ParsedTextData(parsedText, commands));
        if (this.isVisible()) this.prerender();

        this._updateDimensions();
      },

      _updateDimensions() {
        this.setSize(
          this.textBlock.size.x + this.iconTextBlock.size.x,
          Math.max(this.textBlock.size.y, this.iconTextBlock.size.y),
        );
        this.setPivot(
          Math.floor(this.hook.size.x / 2),
          Math.floor(this.hook.size.y / 2),
        );
        this.tickerHook.constantTextOffset.x = this.iconTextBlock.size.x;
      },

      setDrawCallback(callback) {
        this.iconTextBlock.setDrawCallback(callback);
      },

      prerender() {
        this.iconTextBlock.prerender();
        this.textBlock.prerender();
      },

      clear() {
        this.iconTextBlock.clearPrerendered();
        this.textBlock.clearPrerendered();
      },

      onVisibilityChange(visible) {
        if (visible) this.prerender();
        else this.clear();
        this.tickerHook.timer = 0;
      },

      onAttach() {
        if (this.isVisible()) this.prerender();
      },

      onDetach() {
        this.clear();
      },

      update() {
        this.iconTextBlock.update();
        this.textBlock.update();
        this.tickerHook.update();
      },

      updateDrawables(renderer) {
        this.tickerHook.updateDrawables(renderer);

        // icon is drawn after the text so that debug boundary boxes don't get
        // in the way

        let iconX = 0;
        let iconY = 0;

        let maxSize = this.tickerHook._computeMaxSize();
        if (maxSize != null) {
          // TODO: merge these calculations with the ones in
          // sc.ui2.TickerDisplayHook#_tryRenderTicker
          let { size, align } = this.hook;

          if (align.x === ig.GUI_ALIGN.X_CENTER) {
            iconX = Math.max(0, Math.ceil((size.x - maxSize.x) / 2));
          } else if (align.x === ig.GUI_ALIGN.X_RIGHT) {
            iconX = Math.max(0, size.x - maxSize.x);
          }
          if (align.y === ig.GUI_ALIGN.X_CENTER) {
            iconY = Math.max(0, Math.ceil((size.y - maxSize.y) / 2));
          } else if (align.y === ig.GUI_ALIGN.X_RIGHT) {
            iconY = Math.max(0, size.y - maxSize.y);
          }
        }

        renderer.addText(this.iconTextBlock, iconX, iconY);
      },
    });
  });
