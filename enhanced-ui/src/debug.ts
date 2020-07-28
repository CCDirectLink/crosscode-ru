if (sc.ui2.debug == null) sc.ui2.debug = {} as typeof sc.ui2.debug;

sc.ui2.debug.showTickerBoundaryBoxes = false;
sc.ui2.debug.hideTickerShadows = true;
sc.ui2.debug.showLongHorizontalTextBlocks = false;

// this function is meant to be injected in place of updateDrawables
sc.ui2.debug.highlightUpdateDrawables = function (renderer) {
  this.parent(renderer);
  let { size } = this.hook;
  renderer.addColor('red', 0, 0, size.x, size.y).setAlpha(0.25);
};

ig.module('enhanced-ui.debug.gui')
  .requires('impact.feature.gui.gui')
  .defines(() => {
    sc.ui2.debug.highlightGuiInstances = (clazz) => {
      let { updateDrawables } = clazz.prototype;
      setTimeout(() => {
        clazz.prototype.updateDrawables = updateDrawables;
      }, 3000);
      clazz.prototype.updateDrawables = function (renderer) {
        updateDrawables.call(this, renderer);
        renderer
          .addColor('red', 0, 0, this.hook.size.x, this.hook.size.y)
          .setAlpha(0.25);
      };
    };
  });
