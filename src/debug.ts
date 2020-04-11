if (sc.ru.debug == null) sc.ru.debug = {} as typeof sc.ru.debug;

sc.ru.debug.showUntranslatedStrings = true;

// this function is meant to be injected in place of updateDrawables
sc.ru.debug.highlightUpdateDrawables = function(renderer): void {
  this.parent(renderer);
  let { size } = this.hook;
  renderer.addColor('red', 0, 0, size.x, size.y).setAlpha(0.25);
};

ig.module('crosscode-ru.debug.gui')
  .requires('impact.feature.gui.gui')
  .defines(() => {
    sc.ru.debug.highlightGuiInstances = (clazz): void => {
      let { updateDrawables } = clazz.prototype;
      clazz.prototype.updateDrawables = function(renderer): void {
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
