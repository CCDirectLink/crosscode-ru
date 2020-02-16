ig.module('crosscode-ru-translation-tool-ng')
  .requires(
    'game.feature.menu.gui.menu-misc',
    'impact.base.system',
    'impact.feature.gui.gui',
    'game.feature.gui.screen.title-screen',
    'game.feature.gui.base.text',
    'impact.base.font',
    'game.feature.font.font-system',
  )
  .defines(() => {
    sc.InfoBar.inject({
      init(width = ig.system.width, height = 21, skipRender = false) {
        ig.GuiElementBase.prototype.init.call(this);
        this.hook.size.x = width;
        this.hook.size.y = height;
        this.setStateValue('HIDDEN', 'offsetY', -this.hook.size.y);
        this.skipRender = skipRender;
        this.text = new sc.SplittableTextGui('');
        this.text.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_CENTER);
        this.text.setPos(8, 0);
        this.text.hook.transitions = {
          DEFAULT: { state: {}, time: 0.2, timeFunction: KEY_SPLINES.EASE },
          FADE_OUT: {
            state: { alpha: 0 },
            time: 0.2,
            timeFunction: KEY_SPLINES.LINEAR,
          },
          HIDDEN: { state: {}, time: 0.2, timeFunction: KEY_SPLINES.LINEAR },
        };
        this.text.doStateTransition('HIDDEN', true);
        this.addChildGui(this.text);
        this.doStateTransition('HIDDEN', true);
      },
    });

    sc.TitleScreenButtonGui.inject({
      init() {
        this.parent();
        const DEFAULT_TEXT =
          'abcdefghi\\c[2]jklmnopqrstuv\\c[3]wxyz\\c[1]abcdefghij\\c[0]klmnopqrstuvwxyz';
        this._infoBar1 = new sc.SplittableTextGui(DEFAULT_TEXT);
        this._infoBar1.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER);
        this._infoBar1.setPos(0, -8);
        this.addChildGui(this._infoBar1);
        this._infoBar2 = new sc.TextGui(DEFAULT_TEXT);
        this._infoBar2.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER);
        this._infoBar2.setPos(0, 8);
        this.addChildGui(this._infoBar2);
        window._setText = text => {
          this._infoBar1.setText(text);
          this._infoBar2.setText(text);
        };
        // setInterval(() => {
        //   let letters = 'abcdefghijklmnopqrstuvwxyz';
        //   let letter = letters[Math.floor(Math.random() * letters.length)];
        //   this._infoBar.setText(this._infoBar.text + letter);
        // }, 200);
      },
    });

    const REPEATED_TEXT_MARGIN = { x: 10, y: 5 };
    const TICKER_SPEED = { x: 50, y: 50 };

    function triangleWave(x, a) {
      return Math.abs(Math.abs((x - a) % (2 * a)) - a);
    }

    function clamp(x, min, max) {
      return Math.max(min, Math.min(x, max));
    }

    function tryUpdateDrawablesTicker(renderer, hook, timer, renderText) {
      let { pos, size, align, parentHook } = hook;

      if (parentHook == null) return false;
      let prtSize = parentHook.size;
      if (prtSize.x === 1 || prtSize.y === 1) return false;

      let overflow = {
        x: size.x - prtSize.x > 1,
        y: size.y - prtSize.y > 1,
      };
      if (!overflow.x && !overflow.y) return false;

      let prtPos = { x: -pos.x, y: -pos.y };
      if (align.x === ig.GUI_ALIGN.X_CENTER) {
        prtPos.x -= (prtSize.x - size.x) / 2;
      } else if (align.x === ig.GUI_ALIGN.X_RIGHT) {
        prtPos.x -= prtSize.x - size.x;
      }
      if (align.y === ig.GUI_ALIGN.Y_CENTER) {
        prtPos.y -= (prtSize.y - size.y) / 2;
      } else if (align.y === ig.GUI_ALIGN.Y_RIGHT) {
        prtPos.y -= prtSize.y - size.y;
      }

      // renderer.addColor('rgba(255, 0, 0, 0.25)', 0, 0, size.x, size.y);
      // renderer.addColor( 'rgba(0, 255, 0, 0.25)',
      //   prtPos.x,
      //   prtPos.y,
      //   prtSize.x,
      //   prtSize.y,
      // );

      renderer
        .addTransform()
        .setTranslate(prtPos.x, prtPos.y)
        .setClip(prtSize.x, prtSize.y);
      renderer.addTransform().setTranslate(-prtPos.x, -prtPos.y);

      function calculateOffset(axis) {
        if (!overflow[axis]) return 0;
        // let length = size[axis] + REPEATED_TEXT_MARGIN[axis];
        let length =
          size[axis] - prtSize[axis] + 2 * REPEATED_TEXT_MARGIN[axis];
        return (
          prtPos[axis] +
          2 * REPEATED_TEXT_MARGIN[axis] -
          clamp(
            triangleWave(
              timer * TICKER_SPEED[axis],
              length + 2 * REPEATED_TEXT_MARGIN[axis],
            ),
            REPEATED_TEXT_MARGIN[axis],
            length + REPEATED_TEXT_MARGIN[axis],
          )
        );
      }

      let offsetX = calculateOffset('x');
      let offsetY = calculateOffset('y');

      renderText(offsetX, offsetY);
      // if (overflow.x && !overflow.y) {
      //   renderText(size.x + offsetX + REPEATED_TEXT_MARGIN.x, 0);
      // }
      // if (overflow.y && !overflow.x) {
      //   renderText(0, size.y - offsetY + REPEATED_TEXT_MARGIN.y);
      // }

      renderer.undoTransform();
      renderer.undoTransform();

      return true;
    }

    function updateDrawablesTicker(renderer, hook, timer, renderText) {
      let tickerDrawn = tryUpdateDrawablesTicker(
        renderer,
        hook,
        timer,
        renderText,
      );
      if (!tickerDrawn) renderText(0, 0);
    }

    sc.TextGui.inject({
      tickerTimer: 0,

      update() {
        this.parent();
        if (this.textBlock.isFinished()) {
          this.tickerTimer += ig.system.actualTick;
        }
      },

      updateDrawables(renderer) {
        updateDrawablesTicker(renderer, this.hook, this.tickerTimer, (x, y) => {
          renderer.addText(this.textBlock, x, y);
        });
      },
    });

    ig.RawTextBlock = ig.TextBlock.extend({
      init(
        font,
        parsedText,
        commands,
        {
          speed = ig.TextBlock.SPEED.IMMEDIATE,
          textAlign = ig.Font.ALIGN.LEFT,
          maxWidth,
          bestRatio,
          linePadding = 1,
        },
      ) {
        this.font = font;
        this.speed = speed;
        this.align = textAlign;
        this.maxWidth = maxWidth;
        this.bestRatio =
          ig.LANG_DETAILS[ig.currentLang] &&
          ig.LANG_DETAILS[ig.currentLang].fixedMsgWidth
            ? 0
            : bestRatio;
        this.linePadding = linePadding;
        this.setText(parsedText, commands);
        this.reset();
      },

      setText(parsedText, commands) {
        this.clearPrerendered();
        this.parsedText = parsedText;
        this.commands = commands;
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

    sc.SplittableTextGui = ig.GuiElementBase.extend({
      font: null,
      text: '',
      textBlock: null,
      textBlocks: [],
      tickerTimer: 0,

      init(text, config = {}) {
        this.parent();
        this.config = config;
        this.setText(text);
      },

      setText(text = '') {
        this.clear();
        this.textBlocks = [];

        let { font = sc.fontsystem.font, linePadding } = this.config;
        let textBlockConfig = {
          speed: ig.TextBlock.SPEED.IMMEDIATE,
          linePadding,
        };

        if (typeof text === 'object') text = text.toString();
        this.text = text.trim();
        this.commands = [];
        this.parsedText = ig.TextParser.parse(this.text, this.commands, font);

        this.hook.size.x = 0;
        this.hook.size.y = 0;
        let textWidth = 0;
        let blockStart = 0;
        let lastColor = 0;

        const flushBlock = blockEnd => {
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

          let textBlock = new ig.RawTextBlock(
            font,
            blockParsedText,
            blockCommands,
            textBlockConfig,
          );
          this.textBlocks.push({ offset: this.hook.size.x, textBlock });
          this.hook.size.x += textBlock.size.x;
          this.hook.size.y = Math.max(this.hook.size.y, textBlock.size.y);

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
          let charWidth = font.getCharWidth(this.parsedText.charCodeAt(i));
          let willOverflow =
            textWidth + charWidth > sc.SplittableTextGui.SPLIT_WIDTH;
          let isFirst = i <= 0;
          let isLast = i >= this.parsedText.length - 1;

          if (willOverflow && !isFirst) flushBlock(i - 1);
          textWidth += charWidth;
          if (isLast) flushBlock(i);
        }

        this.hook.pivot.x = Math.floor(this.hook.size.x / 2);
        this.hook.pivot.y = Math.floor(this.hook.size.y / 2);
      },

      onVisibilityChange(visible) {
        this.textBlocks.forEach(({ textBlock: tb }) => {
          if (visible) tb.prerender();
          else tb.clearPrerendered();
        });
      },

      clear() {
        this.textBlocks.forEach(({ textBlock: tb }) => tb.clearPrerendered());
      },

      update() {
        this.textBlocks.forEach(({ textBlock: tb }) => tb.update());
        this.tickerTimer += ig.system.actualTick;
      },

      updateDrawables(renderer) {
        const COLORS = [
          'rgba(255, 0, 0, 0.3)',
          'rgba(0, 255, 0, 0.3)',
          'rgba(0, 0, 255, 0.3)',
        ];

        updateDrawablesTicker(renderer, this.hook, this.tickerTimer, (x, y) => {
          this.textBlocks.forEach(({ textBlock, offset }, blockIndex) => {
            let color = COLORS[blockIndex % COLORS.length];
            renderer.addColor(
              color,
              x + offset,
              y,
              textBlock.size.x,
              textBlock.size.y,
            );
            renderer.addText(textBlock, x + offset, y);
          });
        });
      },

      onAttach() {
        if (this.isVisible()) {
          this.textBlocks.forEach(({ textBlock: tb }) => tb.prerender());
        }
      },

      onDetach() {
        this.clear();
      },
    });
    // the splitting width is a smaller than ig.system.width, just to be safe
    sc.SplittableTextGui.SPLIT_WIDTH = 500;
  });
