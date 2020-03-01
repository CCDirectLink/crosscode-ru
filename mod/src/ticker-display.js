// TODO: replace default parameter syntax with `== null` checks

ig.module('crosscode-ru.ticker-display')
  .requires(
    'impact.base.system',
    'impact.feature.gui.gui',
    'game.feature.gui.base.text',
    'impact.base.font',
    'game.feature.font.font-system',
  )
  .defines(() => {
    // TODO: move these constants into the sc.ru.* namespace
    const DELAY_AT_BORDERS = { x: 1, y: 1 };
    const TICKER_SPEED = { x: 50, y: 50 };
    const ALLOWED_OVERFLOW = { x: 1, y: 1 };

    function triangleWave(x, a) {
      return Math.abs(Math.abs((x - a) % (2 * a)) - a);
    }

    function updateDrawablesTicker(renderer, hook, timer, config, renderText) {
      function tryRenderTicker() {
        if (config == null) return false;

        let { size, align, parentHook } = hook;
        if (parentHook == null) return false;
        let prtSize = parentHook.size;
        // Check if the parent size has been set. Sometimes developers forget
        // to set it correctly, (1, 1) is the default value. I doubt that any
        // GUI elements actually have size (1, 1) by design, so this check is
        // good enough.
        if (prtSize.x === 1 || prtSize.y === 1) return false;

        let { maxSize } = config;
        if (maxSize == null) maxSize = {};
        if (maxSize.x == null) maxSize.x = prtSize.x;
        if (maxSize.y == null) maxSize.y = prtSize.y;

        let prtPos = { x: 0, y: 0 };
        if (align.x === ig.GUI_ALIGN.X_CENTER) {
          prtPos.x -= (maxSize.x - size.x) / 2;
        } else if (align.x === ig.GUI_ALIGN.X_RIGHT) {
          prtPos.x -= maxSize.x - size.x;
        }
        if (align.y === ig.GUI_ALIGN.Y_CENTER) {
          prtPos.y -= (maxSize.y - size.y) / 2;
        } else if (align.y === ig.GUI_ALIGN.Y_RIGHT) {
          prtPos.y -= maxSize.y - size.y;
        }

        // renderer.addColor('red', 0, 0, size.x, size.y).setAlpha(0.25);
        // renderer
        //   .addColor('green', prtPos.x, prtPos.y, maxSize.x, maxSize.y)
        //   .setAlpha(0.25);

        let overflow = {
          x: size.x - maxSize.x > ALLOWED_OVERFLOW.x,
          y: size.y - maxSize.y > ALLOWED_OVERFLOW.y,
        };
        if (!overflow.x && !overflow.y) return false;

        renderer
          .addTransform()
          .setTranslate(prtPos.x, prtPos.y)
          .setClip(maxSize.x, maxSize.y);
        renderer.addTransform().setTranslate(-prtPos.x, -prtPos.y);

        // TODO: display shadows at the overflowing side
        function calculateOffset(axis) {
          if (!overflow[axis]) return 0;
          let length = size[axis] - maxSize[axis];
          let speed = TICKER_SPEED[axis];
          let delay = DELAY_AT_BORDERS[axis];
          // multiply the delay by speed so that delay isn't affected by speed
          // and always means the same time in seconds
          let scaledDelay = delay * speed;
          return (
            prtPos[axis] -
            (
              triangleWave(timer * speed - delay / 2, length + scaledDelay) -
              scaledDelay / 2
            ).limit(0, length)
          );
        }

        let offsetX = calculateOffset('x');
        let offsetY = calculateOffset('y');

        renderText(offsetX, offsetY);

        renderer.undoTransform();
        renderer.undoTransform();

        return true;
      }

      let tickerDrawn = tryRenderTicker();
      if (!tickerDrawn) renderText(0, 0);
    }

    sc.TextGui.inject({
      tickerTimer: 0,
      tickerConfig: null,

      setTickerConfig(config) {
        this.tickerConfig = config;
        this.tickerTimer = 0;
      },

      setText(...args) {
        this.parent(...args);
        this.tickerTimer = 0;
      },

      onVisibilityChange(...args) {
        this.parent(...args);
        this.tickerTimer = 0;
      },

      update() {
        this.parent();
        if (
          this.text != null &&
          this.text.length > 0 &&
          this.tickerConfig != null &&
          this.isVisible() &&
          this.textBlock.isFinished()
        ) {
          this.tickerTimer += ig.system.actualTick;
        }
      },

      updateDrawables(renderer) {
        updateDrawablesTicker(
          renderer,
          this.hook,
          this.tickerTimer,
          this.tickerConfig,
          (x, y) => {
            renderer.addText(this.textBlock, x, y);
          },
        );
      },
    });

    sc.ru.RawTextBlock = ig.TextBlock.extend({
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

    sc.ru.LongHorizontalTextGui = ig.GuiElementBase.extend({
      config: {},
      text: '',
      parsedText: '',
      commands: [],
      textBlocks: [],
      tickerTimer: 0,
      tickerConfig: null,

      init(text, { font = sc.fontsystem.font, linePadding } = {}) {
        this.parent();
        this.font = font;
        this.linePadding = linePadding;
        this.setText(text);
      },

      setText(text) {
        this.clear();
        this.textBlocks = [];
        this.tickerTimer = 0;

        let textBlockConfig = {
          speed: ig.TextBlock.SPEED.IMMEDIATE,
          linePadding: this.linePadding,
        };

        if (text == null) text = '';
        if (typeof text === 'object') text = text.toString();
        this.text = text.trim();
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

          let textBlock = new sc.ru.RawTextBlock(
            this.font,
            blockParsedText,
            blockCommands,
            textBlockConfig,
          );
          this.textBlocks.push({ offset: this.hook.size.x, textBlock });
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
            textWidth + charWidth > sc.ru.LongHorizontalTextGui.SPLIT_WIDTH;
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

      onVisibilityChange(visible) {
        this.tickerTimer = 0;
        this.textBlocks.forEach(({ textBlock: tb }) => {
          if (visible) tb.prerender();
          else tb.clearPrerendered();
        });
      },

      clear() {
        this.textBlocks.forEach(({ textBlock: tb }) => tb.clearPrerendered());
      },

      setTickerConfig(config) {
        this.tickerConfig = config;
        this.tickerTimer = 0;
      },

      update() {
        this.textBlocks.forEach(({ textBlock: tb }) => tb.update());
        if (
          this.text != null &&
          this.text.length > 0 &&
          this.tickerConfig != null &&
          this.isVisible()
        ) {
          this.tickerTimer += ig.system.actualTick;
        }
      },

      updateDrawables(renderer) {
        // const COLORS = [
        //   'rgba(255, 0, 0, 0.3)',
        //   'rgba(0, 255, 0, 0.3)',
        //   'rgba(0, 0, 255, 0.3)',
        // ];

        updateDrawablesTicker(
          renderer,
          this.hook,
          this.tickerTimer,
          this.tickerConfig,
          (x, y) => {
            this.textBlocks.forEach(({ textBlock, offset }) => {
              // let color = COLORS[blockIndex % COLORS.length];
              // renderer.addColor(
              //   color,
              //   x + offset,
              //   y,
              //   textBlock.size.x,
              //   textBlock.size.y,
              // );
              renderer.addText(textBlock, x + offset, y);
            });
          },
        );
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
    sc.ru.LongHorizontalTextGui.SPLIT_WIDTH = 500;
  });
