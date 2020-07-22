ig.module('crosscode-ru.version-display')
  .requires(
    'game.feature.gui.base.text',
    'game.feature.gui.screen.title-screen',
    'game.feature.gui.screen.pause-screen',
    'ccloader-runtime.ui.version-display',
  )
  .defines(() => {
    // At this point I'm just copying code from `ccloader-version-display`. You
    // know, I might as well propose a standardized way of displaying versions
    // of the "big" mods.
    function attachVersionText(prevVersionGui: sc.TextGui): sc.TextGui {
      let newVersionGui = new sc.TextGui(`ru v${sc.ru.version}`, {
        font: sc.fontsystem.tinyFont,
      });
      newVersionGui.setAlign(
        prevVersionGui.hook.align.x,
        prevVersionGui.hook.align.y,
      );
      newVersionGui.setPos(0, prevVersionGui.hook.size.y);
      prevVersionGui.addChildGui(newVersionGui);
      return newVersionGui;
    }

    sc.TitleScreenGui.inject({
      crosscodeRuVersionGui: null,
      init(...args) {
        this.parent(...args);
        this.crosscodeRuVersionGui = attachVersionText(this.ccloaderVersionGui);
      },
    });

    sc.PauseScreenGui.inject({
      crosscodeRuVersionGui: null,
      init(...args) {
        this.parent(...args);
        this.crosscodeRuVersionGui = attachVersionText(this.ccloaderVersionGui);
      },
    });
  });
