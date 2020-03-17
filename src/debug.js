export default function initDebug() {
  sc.ru.debug = {
    showTickerBoundaryBoxes: false,
    showUntranslatedStrings: false,
  };

  ig.module('crosscode-ru.debug.gui')
    .requires('impact.feature.gui.gui')
    .defines(() => {
      sc.ru.debug.highlightGuiInstances = function(clazz) {
        let updateDrawables = clazz.prototype.updateDrawables;
        clazz.prototype.updateDrawables = function(renderer) {
          updateDrawables.call(this, renderer);
          renderer
            .addColor('red', 0, 0, this.hook.size.x, this.hook.size.y)
            .setAlpha(0.25);
        };
        setTimeout(() => {
          clazz.prototype.updateDrawables = updateDrawables;
        }, 3000);
      };
    });
}
