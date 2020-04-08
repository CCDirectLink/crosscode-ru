// TypeScript definitions for CrossCode v1.2.0-5

declare interface Vec2 {
  x: number;
  y: number;
}

declare type ReplaceThisParameter<T, This2> = T extends (
  this: infer This,
  ...args: infer Args
) => infer Return
  ? unknown extends This
    ? T
    : (this: This2, ...args: Args) => Return
  : T;

declare type ImpactClassMember<
  K extends keyof Instance,
  Instance,
  ParentInstance
> = K extends keyof ParentInstance
  ? ReplaceThisParameter<Instance[K], Instance & { parent: ParentInstance[K] }>
  : Instance[K];

type ImpactClassConstructorInit<
  This,
  Constructor,
  Instance
> = Constructor extends new (...args: infer Args) => Instance
  ? (this: This, ...args: Args) => void
  : never;

declare type ImpactClassExtendObj<
  Constructor,
  Instance,
  ParentConstructor,
  ParentInstance
> = {
  [K in 'init' | keyof Instance]?: K extends keyof Instance
    ? ImpactClassMember<K, Instance, ParentInstance> | null
    : ImpactClassConstructorInit<
        Instance & {
          parent: ImpactClassConstructorInit<
            ParentInstance,
            ParentConstructor,
            ParentInstance
          >;
        },
        Constructor,
        Instance
      >;
};

declare interface ImpactClass<Instance> {
  extend<ChildConstructor extends { prototype: unknown }>(
    this: this,
    obj: ImpactClassExtendObj<
      ChildConstructor,
      ChildConstructor['prototype'],
      this,
      Instance
    >,
  ): ChildConstructor;
  inject(
    this: this,
    obj: ImpactClassExtendObj<this, Instance, this, Instance>,
  ): void;

  readonly classId: number;
  readonly prototype: Instance;
}

interface KeySpline {
  get(this: this, t: number): number;
}
interface KeySplineConstructor {
  new (x1: number, y1: number, x2: number, y2: number): KeySpline;
}
interface Window {
  KeySpline: KeySplineConstructor;
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
interface KEY_SPLINES {
  EASE_IN_OUT: KeySpline;
  EASE_OUT: KeySpline;
  EASE_IN: KeySpline;
  EASE: KeySpline;
  EASE_SOUND: KeySpline;
  LINEAR: KeySpline;
  JUMPY: KeySpline;
  EASE_OUT_STRONG: KeySpline;
  EASE_IN_STRONG: KeySpline;
}

declare namespace ig {
  // eslint-disable-next-line no-shadow
  function module(this: typeof ig, name: string): typeof ig;
  function requires(this: typeof ig, ...names: string[]): typeof ig;
  function defines(this: typeof ig, body: () => void): void;

  interface Module {
    requires: string[];
    loaded: boolean;
    body: (() => void) | null;
  }

  let modules: Record<string, Module>;
  let _waitForOnload: number;
  function _execModules(this: typeof ig): void;

  interface Class {
    readonly classId: number;
  }
  interface ClassConstructor extends ImpactClass<Class> {
    new (): this['prototype'];
  }
  let Class: ClassConstructor;

  let currentLang: string;
}

declare namespace sc {}

declare interface Number {
  limit(min: number, max: number): number;
}

/* module impact.base.worker */

/* module impact.base.loader */

declare namespace ig {
  interface Cacheable extends ig.Class {}
  interface CacheableConstructor extends ImpactClass<Cacheable> {}
  let Cacheable: CacheableConstructor;

  interface Loadable extends ig.Class {}
  interface LoadableConstructor extends ImpactClass<Loadable> {
    new (pathOrData: string): this['prototype'];
  }
  let Loadable: LoadableConstructor;

  interface SingleLoadable extends ig.Class {}
  interface SingleLoadableConstructor extends ImpactClass<SingleLoadable> {}
  let SingleLoadable: SingleLoadableConstructor;
}

/* module impact.base.image */

declare namespace ig {
  interface Image extends ig.Loadable {}
  interface ImageConstructor extends ImpactClass<Image> {
    new (pathOrData: string): this['prototype'];
  }
  // eslint-disable-next-line no-shadow
  let Image: ImageConstructor;

  interface ImageAtlasFragment extends ig.Class {}
  interface ImageAtlasFragmentConstructor
    extends ImpactClass<ImageAtlasFragment> {}
  let ImageAtlasFragment: ImageAtlasFragmentConstructor;
}

/* module impact.base.font */

declare namespace ig {
  interface TextCommand {
    index: number;
    command: { brake: number } | { color: number } | { speed: number };
  }

  enum FontALIGN_ {
    LEFT,
    RIGHT,
    CENTER,
  }

  namespace Font {
    type ALIGN = FontALIGN_;
  }
  interface Font extends ig.Image {
    charHeight: number;
  }
  interface FontConstructor extends ImpactClass<Font> {
    new (
      path: string,
      charHeight: number,
      firstChar: number,
      sizeIndex: number,
      color: string,
    ): this['prototype'];

    ALIGN: typeof FontALIGN_;
  }
  let Font: FontConstructor;

  interface MultiFont extends ig.Font {
    iconSets: ig.Font[];

    getTextDimensions(
      this: this,
      text: string,
      linePadding: number,
    ): ig.TextBlock.Size;
    wrapText(
      this: this,
      text: string,
      maxWidth: number,
      linePadding: number,
      bestRatio: number | null | undefined,
      commands: ig.TextCommand[],
    ): string;
    getCharWidth(this: this, code: number): number;
  }
  interface MultiFontConstructor extends ImpactClass<MultiFont> {
    ICON_START: number;
    ICON_END: number;
  }
  let MultiFont: MultiFontConstructor;

  enum TextBlockSPEED_ {
    SLOWEST,
    SLOWER,
    SLOW,
    NORMAL,
    FAST,
    FASTER,
    FASTEST,
    IMMEDIATE,
  }

  namespace TextBlock {
    interface Settings {
      speed?: ig.TextBlock.SPEED;
      textAlign?: ig.Font.ALIGN;
      maxWidth?: number;
      bestRatio?: number;
      linePadding?: number;
    }

    type SPEED = TextBlockSPEED_;

    type DrawCallback = (width: number, height: number) => void;

    interface Size {
      x: number;
      y: number;
      lines: number[];
      lineIdx: number[];
    }
  }

  interface TextBlock extends ig.Class {
    font: ig.MultiFont;
    maxWidth?: number;
    parsedText: string;
    commands: ig.TextCommand[];
    speed: ig.TextBlock.SPEED;
    align: ig.Font.ALIGN;
    size: ig.TextBlock.Size;
    bestRatio?: number;
    linePadding: number;

    setText(this: this, text: sc.TextLike): void;
    setDrawCallback(this: this, drawCallback: ig.TextBlock.DrawCallback): void;
    prerender(this: this): void;
    clearPrerendered(this: this): void;
    reset(this: this): void;
    isFinished(this: this): boolean;
    update(this: this): void;
  }
  interface TextBlockConstructor extends ImpactClass<TextBlock> {
    new (
      font: ig.MultiFont,
      text: sc.TextLike,
      settings: ig.TextBlock.Settings,
    ): this['prototype'];

    SPEED: typeof TextBlockSPEED_;
  }
  let TextBlock: TextBlockConstructor;

  interface TextParser {
    parse(
      this: this,
      text: string,
      commands: ig.TextCommand[] | null,
      font: ig.MultiFont,
      ignoreCommands?: boolean,
    ): string;
  }
  let TextParser: TextParser;
}

/* module impact.base.system.web-audio */

/* module impact.base.sound */

declare namespace ig {
  interface SoundDefault extends ig.Class {}
  interface SoundDefaultConstructor extends ImpactClass<SoundDefault> {}
  let SoundDefault: SoundDefaultConstructor;

  interface SoundWebAudio extends ig.Class {}
  interface SoundWebAudioConstructor extends ImpactClass<SoundWebAudio> {}
  let SoundWebAudio: SoundWebAudioConstructor;

  type Sound = SoundDefault | SoundWebAudio;
  type SoundConstructor = SoundDefaultConstructor | SoundWebAudioConstructor;
  let Sound: SoundConstructor;
}

/* module impact.base.timer */
/* module impact.base.vars */

/* module impact.base.system */

declare namespace ig {
  interface System extends ig.Class {
    width: number;
    height: number;
    tick: number;
    actualTick: number;
  }
  interface SystemConstructor extends ImpactClass<System> {}
  let System: SystemConstructor;
  let system: ig.System;
}

/* module impact.base.input */

declare namespace ig {
  enum KEY {
    MOUSE1,
    MOUSE2,
    MWHEEL_UP,
    MWHEEL_DOWN,
    BACKSPACE,
    TAB,
    ENTER,
    PAUSE,
    CAPS,
    ESC,
    SPACE,
    PAGE_UP,
    PAGE_DOWN,
    END,
    HOME,
    LEFT_ARROW,
    UP_ARROW,
    RIGHT_ARROW,
    DOWN_ARROW,
    INSERT,
    DELETE,
    _0,
    _1,
    _2,
    _3,
    _4,
    _5,
    _6,
    _7,
    _8,
    _9,
    A,
    B,
    C,
    D,
    E,
    F,
    G,
    H,
    I,
    J,
    K,
    L,
    M,
    N,
    O,
    P,
    Q,
    R,
    S,
    T,
    U,
    V,
    W,
    X,
    Y,
    Z,
    NUMPAD_0,
    NUMPAD_1,
    NUMPAD_2,
    NUMPAD_3,
    NUMPAD_4,
    NUMPAD_5,
    NUMPAD_6,
    NUMPAD_7,
    NUMPAD_8,
    NUMPAD_9,
    MULTIPLY,
    ADD,
    SUBSTRACT,
    DECIMAL,
    DIVIDE,
    F1,
    F2,
    F3,
    F4,
    F5,
    F6,
    F7,
    F8,
    F9,
    F10,
    F11,
    F12,
    SHIFT,
    CTRL,
    ALT,
    EQUAL,
    PLUS,
    COMMA,
    MINUS,
    PERIOD,
    SEMICOLON,
    UE,
    GRAVE_ACCENT,
    OE,
    SLASH,
    HASH,
    BRACKET_OPEN,
    SZ,
    BACKSLASH,
    BRACKET_CLOSE,
    SINGLE_QUOTE,
    AE,
  }
}

/* module impact.base.lang */

declare namespace ig {
  interface Lang extends ig.SingleLoadable {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    labels: any;

    get<T = string>(this: this, path: string): T;
  }
  interface LangConstructor extends ImpactClass<Lang> {}
  let Lang: LangConstructor;
  let lang: ig.Lang;

  namespace LangLabel {
    type Data = { [locale: string]: string } & { langUid?: number };
  }
  interface LangLabel extends ig.Class {
    value: string;
    data: ig.LangLabel.Data;

    toString(this: this): string;
  }
  interface LangLabelConstructor extends ImpactClass<LangLabel> {}
  let LangLabel: LangLabelConstructor;
}

/* module impact.base.impact */
/* module impact.base.sprite-fx */
/* module impact.base.animation */
/* module impact.base.coll-entry */
/* module impact.base.entity */

/* module impact.base.steps */

declare namespace ig {
  interface StepBase extends ig.Class {
    start(this: this): void;
  }
  interface StepBaseConstructor extends ImpactClass<StepBase> {}
  let StepBase: StepBaseConstructor;
}

/* module impact.base.event */

declare namespace ig {
  type EventStepBase = StepBase;
  type EventStepBaseConstructor = StepBaseConstructor;
  let EventStepBase: EventStepBaseConstructor;

  namespace EVENT_STEP {}
}

/* module impact.base.sprite */
/* module impact.base.renderer */
/* module impact.base.physics */
/* module impact.base.game-state */
/* module impact.base.map */

/* module game.config */

declare namespace ig {
  interface LangOptions {
    systemFont?: string;
    useFor?: string;
    commaDigits?: boolean;
    fixedMsgWidth?: boolean;
    newlineAnywhere?: boolean;
    newlineException?: string[];
    newlineAfter?: string[];
    metrics?: typeof ig.SYSTEM_FONT_METRICS;
  }

  let LANG_DETAILS: { [locale: string]: ig.LangOptions };

  let SYSTEM_FONT_METRICS: { size: number[]; baseLine: number[] };
}

/* module impact.base.collision-map */
/* module impact.base.tile-info */
/* module impact.base.background-map */
/* module impact.base.global-settings */
/* module impact.base.extension */
/* module impact.base.utils */
/* module impact.base.dom */

/* module impact.base.game */

declare namespace ig {
  interface Game extends ig.Class {}
  interface GameConstructor extends ImpactClass<Game> {}
  let Game: GameConstructor;

  interface GameAddon extends ig.Class {}
  interface GameAddonConstructor extends ImpactClass<GameAddon> {}
  let GameAddon: GameAddonConstructor;
}

/* module game.loader */
/* module game.constants */
/* module impact.feature.database.database */
/* module impact.feature.database.plug-in */
/* module impact.feature.gamepad.gamepad */
/* module impact.feature.gamepad.html5-gamepad */
/* module impact.feature.gamepad.nwf-gamepad */
/* module impact.feature.gamepad.plug-in */
/* module impact.base.action */
/* module impact.base.actor-entity */
/* module impact.feature.base.action-steps */
/* module impact.feature.base.event-steps */
/* module impact.feature.base.entities.marker */
/* module impact.feature.base.entities.object-layer-view */
/* module impact.feature.base.entities.touch-trigger */
/* module impact.feature.base.entities.sound-entities */
/* module impact.feature.base.plug-in */
/* module impact.feature.storage.storage */
/* module impact.feature.bgm.bgm */
/* module impact.feature.bgm.bgm-steps */
/* module impact.feature.bgm.plug-in */
/* module impact.feature.event-sheet.event-sheet */
/* module impact.feature.event-sheet.event-sheet-steps */
/* module impact.feature.event-sheet.plug-in */
/* module impact.feature.camera.camera */
/* module impact.feature.camera.camera-steps */
/* module impact.feature.camera.plug-in */
/* module impact.feature.rumble.rumble */
/* module impact.base.entity-pool */
/* module impact.feature.effect.entities.effect */
/* module impact.feature.effect.entities.effect-particle */
/* module impact.feature.effect.effect-sheet */
/* module impact.feature.rumble.rumble-steps */
/* module impact.feature.rumble.plug-in */
/* module impact.feature.slow-motion.slow-motion */
/* module impact.feature.slow-motion.slow-motion-steps */
/* module impact.feature.slow-motion.plug-in */
/* module impact.feature.effect.entities.effect-previewer */
/* module impact.feature.effect.effect-steps */
/* module impact.feature.effect.fx.fx-basic */
/* module impact.feature.effect.fx.fx-box */
/* module impact.feature.effect.fx.fx-color */
/* module impact.feature.effect.fx.fx-circle */
/* module impact.feature.effect.fx.fx-homing */
/* module impact.feature.effect.fx.fx-light */
/* module impact.feature.effect.fx.fx-line */
/* module impact.feature.effect.fx.fx-rhombus */
/* module impact.feature.effect.fx.fx-wipe */
/* module impact.feature.effect.plug-in */

/* module impact.feature.gui.gui */

declare namespace ig {
  interface GuiRenderer extends ig.Class {
    addGfx(
      this: this,
      gfx: ig.Image | ig.ImageAtlasFragment,
      posX: number,
      posY: number,
      srcX: number,
      srcY: number,
      sizeX: number,
      sizeY: number,
      flipX?: boolean,
      flipY?: boolean,
    ): void;
    addColor(
      this: this,
      color: string,
      posX: number,
      posY: number,
      sizeX: number,
      sizeY: number,
    ): ig.GuiDrawable;
    addText(
      this: this,
      textBlock: ig.TextBlock,
      posX: number,
      posY: number,
    ): ig.GuiDrawable;

    addTransform(this: this): ig.GuiTransform;
    undoTransform(this: this): void;
  }

  namespace GUI {}

  enum GUI_ALIGN {
    Y_TOP,
    Y_CENTER,
    Y_BOTTOM,
    X_LEFT,
    X_CENTER,
    X_RIGHT,
  }

  namespace GuiHook {
    interface State {
      offsetX: number;
      offsetY: number;
      alpha: number;
      scaleX: number;
      scaleY: number;
      angle: number;
    }

    interface Transition {
      state: Partial<ig.GuiHook.State>;
      time: number;
      timeFunction: KeySpline;
    }
  }
  interface GuiHook extends ig.Class {
    transitions: { [name: string]: ig.GuiHook.Transition };

    pos: Vec2;
    size: Vec2;
    align: { x: ig.GUI_ALIGN; y: ig.GUI_ALIGN };
    children: ig.GuiHook[];
    gui: ig.GuiElementBase;

    doStateTransition(
      this: this,
      name: string,
      skipTransition?: boolean,
      removeAfter?: boolean,
      callback?: (() => void) | null,
      initDelay?: number,
    ): void;
  }
  interface GuiHookConstructor extends ImpactClass<GuiHook> {}
  let GuiHook: GuiHookConstructor;

  interface GuiDrawable extends ig.Class {
    setAlpha(this: this, alpha: number): this;
  }
  interface GuiDrawableConstructor extends ImpactClass<GuiDrawable> {}
  let GuiDrawable: GuiDrawableConstructor;

  interface GuiTransform extends ig.Class {
    setTranslate(this: this, x: number, y: number): this;
    setClip(this: this, x: number, y: number): this;
  }
  interface GuiTransformConstructor extends ImpactClass<GuiTransform> {}
  let GuiTransform: GuiTransformConstructor;

  interface GuiElementBase extends ig.Class {
    hook: ig.GuiHook;

    setPos(this: this, x: number, y: number): void;
    setSize(this: this, w: number, h: number): void;
    setPivot(this: this, x: number, y: number): void;
    setAlign(this: this, x: ig.GUI_ALIGN, y: ig.GUI_ALIGN): void;
    isVisible(this: this): boolean;
    addChildGui(this: this, guiElement: ig.GuiElementBase): void;
    removeChildGui(this: this, guiElement: ig.GuiElementBase): void;
    removeAllChildren(this: this): void;
    update(this: this): void;
    updateDrawables(this: this, renderer: ig.GuiRenderer): void;
    onAttach(this: this, parentHook: ig.GuiHook): void;
    onDetach(this: this): void;
    doStateTransition(
      this: this,
      name: string,
      skipTransition?: boolean,
      removeAfter?: boolean,
      callback?: (() => void) | null,
      initDelay?: number,
    ): void;

    // For whatever reason if I change type of `onVisibilityChange` to field
    // which contains a callback this will confuse the TS compiler and I won't
    // be able to cast children of `ig.GuiElementBase` to the base class.
    // Probably because TS can't upgrade `this` type in sub-interfaces when it
    // is specified in a callback.
    onVisibilityChange?(this: this, visible: boolean): void;
  }
  interface GuiElementBaseConstructor extends ImpactClass<GuiElementBase> {
    new (): this['prototype'];
  }
  let GuiElementBase: GuiElementBaseConstructor;
}

/* module impact.feature.gui.gui-images */
/* module impact.feature.gui.gui-steps */

/* module impact.feature.gui.base.box */

declare namespace ig {
  interface BoxGui extends ig.GuiElementBase {}
  interface BoxGuiConstructor extends ImpactClass<BoxGui> {}
  let BoxGui: BoxGuiConstructor;
}

/* module impact.feature.gui.plug-in */
/* module impact.feature.light.light */
/* module impact.feature.light.light-steps */
/* module impact.feature.light.light-map */
/* module impact.feature.weather.clouds */
/* module impact.feature.weather.fog */
/* module impact.feature.weather.rain */
/* module impact.feature.weather.weather */
/* module impact.feature.light.entities.cond-light */
/* module impact.feature.light.plug-in */
/* module impact.feature.height-map.height-map */
/* module impact.feature.height-map.height-map-config */
/* module impact.feature.height-map.plug-in */
/* module impact.feature.navigation.nav-map */
/* module impact.feature.navigation.navigation */
/* module impact.feature.navigation.navigation-steps */
/* module impact.feature.navigation.plug-in */
/* module impact.feature.map-content.map-style */
/* module impact.feature.map-content.entities.hidden-block */
/* module impact.feature.map-content.entities.door */
/* module impact.feature.map-content.entities.stair-door */
/* module game.feature.npc.entities.npc-waypoint */
/* module impact.feature.map-content.entities.teleport-ground */
/* module impact.feature.map-content.entities.glowing-ground */
/* module impact.feature.map-content.entities.prop */
/* module impact.feature.map-content.entities.scalable-prop */
/* module impact.feature.map-content.entities.note */
/* module impact.feature.map-content.map-content-steps */
/* module impact.feature.map-content.plug-in */
/* module impact.feature.map-image.map-image */
/* module impact.feature.map-image.map-image-steps */
/* module impact.feature.map-image.plug-in */
/* module impact.feature.overlay.overlay */
/* module impact.feature.overlay.overlay-steps */
/* module impact.feature.overlay.plug-in */
/* module impact.feature.dream-fx.dream-fx */
/* module impact.feature.dream-fx.dream-fx-steps */
/* module impact.feature.dream-fx.plug-in */

/* module impact.feature.gui.base.basic-gui */

declare namespace ig {
  interface ImageGui extends ig.GuiElementBase {
    offsetX: number;
    offsetY: number;

    setImage(
      this: this,
      image: ig.Image,
      offsetX?: number,
      offsetY?: number,
      width?: number,
      height?: number,
    ): void;
  }
  interface ImageGuiConstructor extends ImpactClass<ImageGui> {}
  let ImageGui: ImageGuiConstructor;

  interface ColorGui extends ig.GuiElementBase {}
  interface ColorGuiConstructor extends ImpactClass<ColorGui> {}
  let ColorGui: ColorGuiConstructor;
}

/* module impact.feature.parallax.parallax */
/* module impact.feature.parallax.parallax-steps */
/* module impact.feature.parallax.plug-in */
/* module impact.feature.screen-blur.screen-blur */
/* module impact.feature.screen-blur.screen-blur-steps */
/* module impact.feature.screen-blur.plug-in */
/* module impact.feature.terrain.terrain */
/* module impact.feature.terrain.plug-in */
/* module impact.feature.interact.interact */

/* module impact.feature.interact.button-interact */

declare namespace ig {
  interface ButtonGroup extends ig.Class {
    largestIndex: Vec2;

    addFocusGui(
      this: this,
      gui: ig.FocusGui,
      x: number,
      y: number,
      asBackButton?: boolean,
    ): void;
  }
  interface ButtonGroupConstructor extends ImpactClass<ButtonGroup> {}
  let ButtonGroup: ButtonGroupConstructor;
}

/* module impact.feature.interact.press-repeater */

/* module impact.feature.interact.gui.focus-gui */

declare namespace ig {
  interface FocusGui extends ig.GuiElementBase {
    focus: boolean;
    active: boolean;
    keepPressed: boolean;
    pressed: boolean;

    onButtonPress(this: this): void;
  }
  interface FocusGuiConstructor extends ImpactClass<FocusGui> {}
  let FocusGui: FocusGuiConstructor;
}

/* module impact.feature.interact.plug-in */
/* module impact.feature.env-particles.env-particles */
/* module impact.feature.env-particles.env-particles-steps */
/* module impact.feature.env-particles.plug-in */
/* module impact.feature.storage.plug-in */
/* module impact.feature.weather.weather-steps */
/* module impact.feature.weather.plug-in */
/* module impact.feature.map-sounds.map-sounds */
/* module impact.feature.map-sounds.map-sounds-steps */
/* module impact.feature.map-sounds.plug-in */
/* module impact.feature.nwf.nwf-errors */
/* module impact.feature.nwf.plug-in */
/* module impact.feature.video.video */
/* module impact.feature.video.video-gui */
/* module impact.feature.video.plug-in */
/* module impact.feature.influencer.influencer */
/* module impact.feature.influencer.influencer-steps */
/* module impact.feature.influencer.plug-in */
/* module impact.feature.greenworks.greenworks */
/* module impact.feature.greenworks.plug-in */
/* module game.feature.version.version */
/* module game.feature.control.control */
/* module game.feature.combat.stat-change */

/* module game.feature.font.font-system */

declare namespace sc {
  enum FONT_COLORS {
    RED,
    GREEN,
    PURPLE,
    GREY,
    ORANGE,
  }

  interface FontSystem extends ig.GameAddon {
    font: ig.MultiFont;
    smallFont: ig.MultiFont;
  }
  interface FontSystemConstructor extends ImpactClass<FontSystem> {}
  let FontSystem: FontSystemConstructor;
  let fontsystem: sc.FontSystem;
}

/* module game.feature.gui.base.text */

declare namespace sc {
  type TextLike = string | { toString(): string } | null;

  namespace TextGui {
    type LevelDrawData = { level: number; numberGfx: ig.Image };

    interface Settings extends ig.TextBlock.Settings {
      font?: ig.MultiFont;
      drawCallback?: ig.TextBlock.DrawCallback;
    }
  }
  interface TextGui extends ig.GuiElementBase {
    font: ig.MultiFont;
    text: sc.TextLike;
    textBlock: ig.TextBlock;

    onVisibilityChange(this: this, visible: boolean): void;

    setText(this: this, text: sc.TextLike): void;
  }
  interface TextGuiConstructor extends ImpactClass<TextGui> {
    new (text: sc.TextLike, settings?: sc.TextGui.Settings): this['prototype'];
  }
  let TextGui: TextGuiConstructor;
}

/* module game.feature.interact.button-group */

declare namespace sc {
  interface ButtonGroup extends ig.ButtonGroup {}
  interface ButtonGroupConstructor extends ImpactClass<ButtonGroup> {}
  let ButtonGroup: ButtonGroupConstructor;

  interface RowButtonGroup extends sc.ButtonGroup {}
  interface RowButtonGroupConstructor extends ImpactClass<RowButtonGroup> {}
  let RowButtonGroup: RowButtonGroupConstructor;
}

/* module game.feature.gui.base.button */

declare namespace sc {
  let BUTTON_DEFAULT_WIDTH: number;
  let BUTTON_SOUND: { [name: string]: ig.Sound };

  namespace ButtonGui {
    interface Type {
      alignXPadding?: number;
    }
  }
  interface ButtonGui extends ig.FocusGui {
    text: sc.TextLike;
    textChild: sc.TextGui;

    setWidth(this: this, width: number): void;
    getButtonText(this: this): string;
  }
  interface ButtonGuiConstructor extends ImpactClass<ButtonGui> {
    new (
      text: sc.TextLike,
      width: number,
      active?: boolean,
      type?: sc.ButtonGui.Type,
      submitSound?: ig.Sound,
      keepPressed?: boolean,
      blockedSound?: ig.Sound,
    ): this['prototype'];
  }
  let ButtonGui: ButtonGuiConstructor;

  interface CheckboxGui extends sc.ButtonGui {}
  interface CheckboxGuiConstructor extends ImpactClass<CheckboxGui> {}
  let CheckboxGui: CheckboxGuiConstructor;

  let BUTTON_TYPE: { [type: string]: ButtonGui.Type };
}

/* module game.feature.gui.base.boxes */

declare namespace sc {
  interface BlackWhiteBox extends ig.BoxGui {}
  interface BlackWhiteBoxConstructor extends ImpactClass<BlackWhiteBox> {}
  let BlackWhiteBox: BlackWhiteBoxConstructor;
}

/* module game.feature.gui.base.numbers */

declare namespace sc {
  interface NumberGui extends ig.GuiElementBase {}
  interface NumberGuiConstructor extends ImpactClass<NumberGui> {}
  let NumberGui: NumberGuiConstructor;
}

/* module game.feature.menu.gui.menu-misc */

declare namespace sc {
  let MODIFIER_ICON_DRAW: {
    X: number;
    Y: number;
    SIZE: number;
    MAX_PER_ROW: number;
  };

  interface BuffInfo extends ig.GuiElementBase {
    _width: number;

    setText(this: this, text: sc.TextLike, initDelay: number): void;
  }
  interface BuffInfoConstructor extends ImpactClass<BuffInfo> {
    new (): this['prototype'];
  }
  let BuffInfo: BuffInfoConstructor;

  interface InfoBar extends ig.GuiElementBase {
    text: sc.TextGui;
    sizeTransition: {
      startWidth: number;
      width: number;
      startHeight: number;
      height: number;
      time: number;
      timeFunction: KeySpline;
      timer: number;
    };

    doSizeTransition(
      this: this,
      width: number,
      height: number,
      time: number,
      timeFunction: KeySpline,
      delay: number,
    ): void;
  }
  interface InfoBarConstructor extends ImpactClass<InfoBar> {
    new (width: number, height: number, skipRender: boolean): this['prototype'];
  }
  let InfoBar: InfoBarConstructor;

  interface ListBoxButtonCommon extends ig.FocusGui {
    button: sc.ButtonGui;
    data: { id: string | number; description: string };
    _width: number;

    setButtonText(this: this, text: sc.TextLike): void;
    setWidth(this: this, buttonWidth?: number, lineWidth?: number): void;
    setText(this: this, text: sc.TextLike): void;
  }
  interface ListBoxButton extends ListBoxButtonCommon {}
  interface ListBoxButtonConstructor extends ImpactClass<ListBoxButton> {
    new (
      text: sc.TextLike,
      buttonWidth: number,
      lineWidth: number,
      id?: string | number,
      description?: string,
      noLine?: boolean,
      alignCenter?: boolean,
      sound?: ig.Sound,
    ): this['prototype'];
  }
  let ListBoxButton: ListBoxButtonConstructor;

  interface ItemBoxButton extends sc.ListBoxButton {}
  interface ItemBoxButtonConstructor extends ImpactClass<ItemBoxButton> {}
  let ItemBoxButton: ItemBoxButtonConstructor;

  interface SimpleStatusDisplay extends ig.GuiElementBase {
    gfx: ig.Image;
    lineID: number;
    iconIndex: Vec2;
    currentValueGui: sc.NumberGui;
    arrowGui: ig.ImageGui;
    percentCurrentGui: sc.PercentChar;
    simpleMode: boolean;
    noPercentMode: boolean;
  }
  interface SimpleStatusDisplayConstructor
    extends ImpactClass<SimpleStatusDisplay> {
    new (
      name: string,
      lineID: number,
      iconID: number,
      usePercent: boolean,
      maxValue: number,
      simpleMode: boolean,
      width: number,
      noPercentMode: boolean,
    ): this['prototype'];
  }
  let SimpleStatusDisplay: SimpleStatusDisplayConstructor;

  interface PercentChar extends ig.GuiElementBase {}
  interface PercentCharConstructor extends ImpactClass<PercentChar> {}
  let PercentChar: PercentCharConstructor;

  interface MenuPanel extends ig.BoxGui {}
  interface MenuPanelConstructor extends ImpactClass<MenuPanel> {}
  let MenuPanel: MenuPanelConstructor;

  interface MenuScanLines extends ig.GuiElementBase {}
  interface MenuScanLinesConstructor extends ImpactClass<ItemBoxButton> {}
  let MenuScanLines: ItemBoxButtonConstructor;

  interface ScrollPane extends ig.GuiElementBase {}
  interface ScrollPaneConstructor extends ImpactClass<ScrollPane> {}
  let ScrollPane: ScrollPaneConstructor;

  interface TimeAndMoneyGUI extends sc.MenuPanel {
    gfx: ig.Image;
    timeGfx: ig.Image;
    credit: sc.NumberGui;
    timeSec: sc.NumberGui;
    timeMin: sc.NumberGui;
    timeHour: sc.NumberGui;
  }
  interface TimeAndMoneyGUIConstructor extends ImpactClass<TimeAndMoneyGUI> {
    new (): this['prototype'];
  }
  let TimeAndMoneyGUI: TimeAndMoneyGUIConstructor;
}

/* module game.feature.version.gui.changelog-gui */
/* module game.feature.version.gui.dlc-gui */
/* module game.feature.version.plug-in */
/* module game.feature.model.base-model */
/* module game.feature.gui.hud.right-hud */
/* module game.feature.timers.gui.timers-hud */
/* module game.feature.timers.timers-model */
/* module game.feature.timers.timers-steps */
/* module game.feature.timers.plug-in */
/* module game.feature.achievements.stats-model */
/* module game.feature.achievements.achievements */
/* module game.feature.achievements.stat-steps */
/* module game.feature.achievements.plug-in */
/* module game.feature.auto-control.auto-control */
/* module game.feature.auto-control.auto-control-steps */
/* module game.feature.auto-control.plug-in */

/* module game.feature.inventory.inventory */

declare namespace sc {
  namespace Inventory {
    interface Item {
      // TODO
    }
  }
}

/* module game.feature.combat.model.combat-params */

declare namespace sc {
  enum ELEMENT {
    NEUTRAL,
    HEAT,
    COLD,
    SHOCK,
    WAVE,
  }
}

/* module game.feature.combat.entities.projectile */
/* module game.feature.combat.model.ball-behavior */
/* module game.feature.combat.model.proxy */
/* module game.feature.combat.entities.ball */
/* module game.feature.player.player-config */
/* module game.feature.player.player-level */
/* module game.feature.player.player-model */

/* module game.feature.msg.message-model */

declare namespace sc {
  interface MessageModel extends ig.GameAddon {
    showMessage(
      this: this,
      personName: string,
      message: string,
      autoContinue: boolean,
    ): void;
    setExpression(
      this: this,
      personName: string,
      expression: sc.CharacterExpression,
    ): void;
  }
  interface MessageModelConstructor extends ImpactClass<MessageModel> {}
  let MessageModel: MessageModelConstructor;
  let message: sc.MessageModel;
}

/* module game.feature.menu.area-loadable */

declare namespace sc {
  namespace AreaLoadable {
    interface Map {
      path: string;
      name: ig.LangLabel.Data;
      offset: Vec2;
    }
  }
}

/* module game.feature.menu.gui.base-menu */

/* module game.feature.menu.gui.list-boxes */

declare namespace sc {
  interface ButtonListBox extends sc.ScrollPane {
    contentPane: ig.GuiElementBase;
  }
  interface ButtonListBoxConstructor extends ImpactClass<ButtonListBox> {}
  let ButtonListBox: ButtonListBoxConstructor;
}

/* module game.feature.menu.gui.main-menu */
/* module game.feature.menu.gui.start-menu */
/* module game.feature.gui.base.slick-box */
/* module game.feature.gui.base.misc */
/* module game.feature.gui.base.compact-choice-box */
/* module game.feature.gui.hud.combat-hud */

/* module game.feature.model.options-model */

declare namespace sc {
  enum OPTION_TYPES {
    BUTTON_GROUP = 0,
    ARRAY_SLIDER = 1,
    OBJECT_SLIDER = 2,
    CHECKBOX = 3,
    CONTROLS = 4,
    LANGUAGE = 5,
    INFO = 6,
  }

  enum OPTION_CATEGORY {
    GENERAL = 0,
    INTERFACE = 1,
    VIDEO = 2,
    AUDIO = 3,
    GAMEPAD = 4,
    CONTROLS = 5,
    ASSISTS = 6,
    ARENA = 7,
  }

  namespace OptionDefinition {
    /* eslint-disable @typescript-eslint/class-name-casing */
    interface BUTTON_GROUP {
      type: 'BUTTON_GROUP';
      data: Record<string, number>;
      init: number;
    }

    interface ARRAY_SLIDER {
      type: 'ARRAY_SLIDER';
      data: number[];
      init: number;
      snap: boolean;
      fill: boolean;
    }

    interface OBJECT_SLIDER {
      type: 'OBJECT_SLIDER';
      data: Record<string, number>;
      init: number;
      snap: boolean;
      fill: boolean;
      showPercentage: boolean;
    }

    interface CHECKBOX {
      type: 'CHECKBOX';
      init: boolean;
      checkboxRightAlign: boolean; // added by simplify
    }

    interface CONTROLS {
      type: 'CONTROLS';
      init: { key: ig.KEY; key2?: ig.KEY };
    }

    interface LANGUAGE {
      type: 'LANGUAGE';
      data: Record<string, number>;
      init: number;
    }

    // eslint-disable-next-line @typescript-eslint/interface-name-prefix
    interface INFO {
      type: 'INFO';
      data: string;
    }
  }

  type OptionDefinition = {
    cat: sc.OPTION_CATEGORY;
    hasDivider: boolean;
    header: string;
    restart: boolean;
  } & (
    | sc.OptionDefinition.BUTTON_GROUP
    | sc.OptionDefinition.ARRAY_SLIDER
    | sc.OptionDefinition.OBJECT_SLIDER
    | sc.OptionDefinition.CHECKBOX
    | sc.OptionDefinition.CONTROLS
    | sc.OptionDefinition.LANGUAGE
    | sc.OptionDefinition.INFO
  );

  let OPTIONS_DEFINITION: { [name: string]: OptionDefinition };
  /* eslint-enable @typescript-eslint/class-name-casing */
}

/* module game.feature.gui.hud.item-hud */
/* module game.feature.gui.hud.element-hud */
/* module game.feature.gui.hud.money-hud */
/* module game.feature.gui.hud.task-hud */
/* module game.feature.gui.hud.hp-hud */
/* module game.feature.gui.hud.sp-hud */
/* module game.feature.gui.hud.param-hud */
/* module game.feature.gui.hud.buff-hud */
/* module game.feature.gui.hud.item-timer-hud */
/* module game.feature.quick-menu.quick-menu-model */
/* module game.feature.menu.map-model */
/* module game.feature.gui.hud.key-hud */
/* module game.feature.gui.hud.status-hud */
/* module game.feature.gui.hud.exp-hud */

/* module game.feature.menu.gui.quests.quest-entries */

declare namespace sc {
  interface SubTaskEntryBase extends ig.BoxGui {
    textGui: sc.TextGui;
  }
  interface SubTaskEntryBaseConstructor extends ImpactClass<SubTaskEntryBase> {
    new (
      quest: sc.Quest,
      taskIndex: number,
      subTaskIndex: number,
      subTask?: sc.QuestSubTaskBase,
    ): this['prototype'];
  }
  let SubTaskEntryBase: SubTaskEntryBaseConstructor;

  interface TaskEntry extends ig.GuiElementBase {
    _subtasks: sc.SubTaskEntryBase[];

    setTask(
      this: this,
      taskIndex?: number,
      quest?: sc.Quest,
      hide?: boolean,
      large?: boolean,
      minimize?: boolean,
    ): void;
  }
  interface TaskEntryConstructor extends ImpactClass<TaskEntry> {}
  let TaskEntry: TaskEntryConstructor;
}

/* module game.feature.gui.hud.quest-hud */
/* module game.feature.gui.hud.landmark-hud */
/* module game.feature.menu.lore-model */
/* module game.feature.gui.hud.lore-hud */
/* module game.feature.gui.hud.drop-hud */
/* module game.feature.gui.hud.member-hud */
/* module game.feature.gui.hud.sp-change-hud */
/* module game.feature.gui.hud.sp-mini-hud */
/* module game.feature.gui.hud.top-msg-hud */
/* module game.feature.gui.hud.feat-hud */
/* module game.feature.gui.screen.loading-screen */
/* module game.feature.gui.screen.intro-screen */
/* module game.feature.gui.screen.title-logo */
/* module game.feature.gui.screen.title-preset */

/* module game.feature.gui.widget.modal-dialog */

declare namespace sc {
  enum DIALOG_INFO_ICON {
    NONE,
    INFO,
    WARNING,
    ERROR,
    QUESTION,
  }

  interface ModalButtonInteract extends ig.GuiElementBase {}
  interface ModalButtonInteractConstructor
    extends ImpactClass<ModalButtonInteract> {}
  let ModalButtonInteract: ModalButtonInteractConstructor;

  interface Dialogs {
    showYesNoDialog(
      this: this,
      text?: sc.TextLike,
      icon?: sc.DIALOG_INFO_ICON,
      callback?: (
        button: sc.ButtonGui,
        dialog?: sc.ModalButtonInteract,
      ) => void,
      noSubmitSound?: boolean,
    ): void;
  }
  let Dialogs: Dialogs;
}

/* module game.feature.menu.gui.save.save-misc */

declare namespace sc {
  interface SaveSlotButton extends ig.FocusGui {
    content: ig.GuiElementBase;
  }
  interface SaveSlotButtonConstructor extends ImpactClass<SaveSlotButton> {
    // TODO: write definitions for `save` (see https://crosscode.gamepedia.com/Savegame)
    new (save: any, slot: number): this['prototype'];
  }
  let SaveSlotButton: SaveSlotButtonConstructor;
}

/* module game.feature.menu.gui.save.save-list */
/* module game.feature.menu.gui.save.save-menu */
/* module game.feature.menu.gui.new-game.new-game-dialogs */

/* module game.feature.gui.screen.title-screen */

declare namespace sc {
  interface TitleScreenButtonGui extends ig.GuiElementBase {
    buttonGroup: sc.ButtonGroup;
    buttons: sc.ButtonGui[];

    show(this: this): void;
    hide(this: this, skipTransition: boolean): void;
  }
  interface TitleScreenButtonGuiConstructor
    extends ImpactClass<TitleScreenButtonGui> {
    new (): this['prototype'];
  }
  let TitleScreenButtonGui: TitleScreenButtonGuiConstructor;
}

/* module game.feature.gui.screen.pause-screen */

declare namespace sc {
  interface PauseScreenGui extends ig.GuiElementBase {
    buttonGroup: sc.ButtonGroup;
    resumeButton: sc.ButtonGui;
    skipButton: sc.ButtonGui;
    cancelButton: sc.ButtonGui;
    toTitleButton: sc.ButtonGui;
    saveGameButton: sc.ButtonGui;
    optionsButton: sc.ButtonGui;
    arenaRestart: sc.ButtonGui;
    arenaLobby: sc.ButtonGui;

    updateButtons(this: this, refocus: boolean): void;
  }
  interface PauseScreenGuiConstructor extends ImpactClass<PauseScreenGui> {
    new (): this['prototype'];
  }
  let PauseScreenGui: PauseScreenGuiConstructor;
}

/* module game.feature.gui.screen.credits-screen */
/* module game.feature.gui.widget.click-box */
/* module game.feature.gui.widget.gamepad-box */
/* module game.feature.gui.widget.counter-hud */
/* module game.feature.gui.widget.information */
/* module game.feature.combat.gui.hp-bar-boss */
/* module game.feature.gui.widget.bar-widget */
/* module game.feature.gui.widget.indiegogo-gui */

/* module game.feature.gui.widget.level-up-hud */

declare namespace sc {
  interface LevelUpContentGui extends ig.GuiElementBase {}
  interface LevelUpContentGuiConstructor
    extends ImpactClass<LevelUpContentGui> {}
  let LevelUpContentGui: LevelUpContentGuiConstructor;
}

/* module game.feature.gui.widget.social */
/* module game.feature.gui.widget.timer-gui */
/* module game.feature.gui.widget.sergey-mode */
/* module game.feature.gui.widget.chest-items */
/* module game.feature.gui.widget.demo-stats */
/* module game.feature.gui.widget.demo-highscore */
/* module game.feature.gui.widget.tutorial-marker */
/* module game.feature.gui.widget.tutorial-start-gui */
/* module game.feature.gui.widget.skip-scene */
/* module game.feature.gui.plug-in */
/* module game.feature.menu.gui.equip.equip-status */

/* module game.feature.menu.gui.equip.equip-misc */

declare namespace sc {
  interface BodyPartButton extends sc.ButtonGui {}
  interface BodyPartButtonConstructor extends ImpactClass<BodyPartButton> {}
  let BodyPartButton: BodyPartButtonConstructor;
}

/* module game.feature.menu.gui.equip.equip-bodypart */

declare namespace sc {
  namespace EquipBodyPartContainer {
    interface Entry extends ig.GuiElementBase {
      numberGfx: ig.Image;
      button: sc.BodyPartButton;
      level: number;
    }
    interface EntryConstructor extends ImpactClass<Entry> {
      new (
        bodyPart: string,
        equip: sc.Inventory.Item,
        x: number,
        y: number,
        globalButton: sc.BodyPartButton,
        topY: number,
      ): this['prototype'];
    }
    let Entry: EntryConstructor;
  }
}

/* module game.feature.menu.gui.help.help-misc */

declare namespace sc {
  interface HelpLevelEntry extends ig.GuiElementBase {
    color: sc.TextGui;
    desc: sc.TextGui;
  }
  interface HelpLevelEntryConstructor extends ImpactClass<HelpLevelEntry> {
    new (colorId: string, fontColor: sc.FONT_COLORS): this['prototype'];
  }
  let HelpLevelEntry: HelpLevelEntryConstructor;
}

/* module game.feature.menu.gui.help.help-menu */
/* module game.feature.menu.gui.equip.equip-menu */
/* module game.feature.skills.skills */
/* module game.feature.skills.skilltree */
/* module game.feature.menu.gui.circuit.circuit-misc */

/* module game.feature.menu.gui.circuit.circuit-detail-elements */

declare namespace sc {
  interface CircuitNodeMenu extends sc.MenuPanel {
    activate: sc.ButtonGui;
  }
  interface CircuitNodeMenuConstructor extends ImpactClass<CircuitNodeMenu> {
    new (scrollHook: ig.GuiHook): this['prototype'];
  }
  let CircuitNodeMenu: CircuitNodeMenuConstructor;

  interface CircuitInfoBox extends sc.MenuPanel {
    special: sc.TextGui;
  }
  interface CircuitInfoBoxConstructor extends ImpactClass<CircuitInfoBox> {
    new (scrollHook: ig.GuiHook): this['prototype'];
  }
  let CircuitInfoBox: CircuitInfoBoxConstructor;
}

/* module game.feature.menu.gui.circuit.circuit-overview */
/* module game.feature.menu.gui.circuit.circuit-effect-display */
/* module game.feature.menu.gui.circuit.circuit-detail */
/* module game.feature.menu.gui.circuit.circuit-swap-branches */
/* module game.feature.menu.gui.circuit.circuit-menu */
/* module game.feature.menu.gui.item.item-status-equip */
/* module game.feature.menu.gui.item.item-status-default */
/* module game.feature.menu.gui.item.item-status-buffs */
/* module game.feature.menu.gui.item.item-status-favs */
/* module game.feature.menu.gui.item.item-status-trade */
/* module game.feature.menu.gui.item.item-sort-menu */

/* module game.feature.menu.gui.item.item-list */

declare namespace sc {
  namespace ItemTabbedBox {
    interface TabButton extends ig.FocusGui {
      _largeWidth: number;
    }
    interface TabButtonConstructor extends ImpactClass<TabButton> {}
    let TabButton: TabButtonConstructor;
  }
}

/* module game.feature.menu.gui.item.item-menu */

/* module game.feature.menu.gui.map.map-misc */

declare namespace sc {
  interface LandmarkGui extends ig.FocusGui {
    map: sc.AreaLoadable.Map;
  }
  interface LandmarkGuiConstructor extends ImpactClass<LandmarkGui> {}
  let LandmarkGui: LandmarkGuiConstructor;
}

/* module game.feature.menu.gui.map.map-stamp */
/* module game.feature.menu.gui.map.map-floor */

/* module game.feature.menu.gui.map.map-area */

declare namespace sc {
  interface MapAreaContainer extends ig.GuiElementBase {
    onLandmarkPressed(this: this, landmark: sc.LandmarkGui): void;
  }
  interface MapAreaContainerConstructor extends ImpactClass<MapAreaContainer> {}
  let MapAreaContainer: MapAreaContainerConstructor;
}

/* module game.feature.menu.gui.map.map-worldmap */
/* module game.feature.menu.gui.map.map-menu */

/* module game.feature.menu.gui.options.options-misc */

declare namespace sc {
  interface KeyBinderGui extends ig.ColorGui {
    box: sc.BlackWhiteBox;
    button: sc.ButtonGui;
    back: sc.ButtonGui;

    show(
      this: this,
      finishCallback: (
        keyCode: number | null,
        isAlternative: boolean,
        unbind: boolean,
      ) => void,
      forAction: string,
      isAlternative: boolean,
    ): void;
  }
  interface KeyBinderGuiConstructor extends ImpactClass<KeyBinderGui> {
    new (): this['prototype'];
  }
  let KeyBinderGui: KeyBinderGuiConstructor;
}

/* module game.feature.menu.gui.options.options-types */

declare namespace sc {
  /* eslint-disable @typescript-eslint/class-name-casing, @typescript-eslint/camelcase */
  namespace OPTION_GUIS_defs {
    interface BUTTON_GROUP extends ig.GuiElementBase {}
    interface BUTTON_GROUP_Constructor extends ImpactClass<BUTTON_GROUP> {}

    interface ARRAY_SLIDER extends ig.GuiElementBase {}
    interface ARRAY_SLIDER_Constructor extends ImpactClass<ARRAY_SLIDER> {}

    interface OBJECT_SLIDER extends ig.GuiElementBase {}
    interface OBJECT_SLIDER_Constructor extends ImpactClass<OBJECT_SLIDER> {}

    interface CHECKBOX extends ig.GuiElementBase {
      button: sc.CheckboxGui;
    }
    interface CHECKBOX_Constructor extends ImpactClass<CHECKBOX> {}

    interface CONTROLS extends ig.GuiElementBase {}
    interface CONTROLS_Constructor extends ImpactClass<CONTROLS> {}

    interface LANGUAGE extends ig.GuiElementBase {}
    interface LANGUAGE_Constructor extends ImpactClass<LANGUAGE> {}

    /* eslint-disable @typescript-eslint/interface-name-prefix */
    interface INFO extends ig.GuiElementBase {}
    interface INFO_Constructor extends ImpactClass<INFO> {}
    /* eslint-enable @typescript-eslint/interface-name-prefix */
  }
  let OPTION_GUIS: [
    sc.OPTION_GUIS_defs.BUTTON_GROUP_Constructor,
    sc.OPTION_GUIS_defs.ARRAY_SLIDER_Constructor,
    sc.OPTION_GUIS_defs.OBJECT_SLIDER_Constructor,
    sc.OPTION_GUIS_defs.CHECKBOX_Constructor,
    sc.OPTION_GUIS_defs.CONTROLS_Constructor,
    sc.OPTION_GUIS_defs.LANGUAGE_Constructor,
    sc.OPTION_GUIS_defs.INFO_Constructor,
  ];

  interface OptionRow extends ig.GuiElementBase {
    option: sc.OptionDefinition;
    nameGui: sc.TextGui;
    typeGui:
      | sc.OPTION_GUIS_defs.BUTTON_GROUP
      | sc.OPTION_GUIS_defs.ARRAY_SLIDER
      | sc.OPTION_GUIS_defs.OBJECT_SLIDER
      | sc.OPTION_GUIS_defs.CHECKBOX
      | sc.OPTION_GUIS_defs.CONTROLS
      | sc.OPTION_GUIS_defs.LANGUAGE;
    _hasEntered: boolean;
  }
  interface OptionRowConstructor extends ImpactClass<OptionRow> {
    new (
      option: string,
      row: number,
      rowGroup: sc.RowButtonGroup,
      local?: boolean,
      width?: number,
      height?: number,
    ): this['prototype'];
  }
  let OptionRow: OptionRowConstructor;
  /* eslint-enable @typescript-eslint/class-name-casing, @typescript-eslint/camelcase */
}

/* module game.feature.menu.gui.options.options-list */

declare namespace sc {
  interface OptionsTabBox extends ig.GuiElementBase {}
  interface OptionsTabBoxConstructor extends ImpactClass<OptionsTabBox> {}
  let OptionsTabBox: OptionsTabBoxConstructor;
}

/* module game.feature.menu.gui.options.options-menu */
/* module game.feature.menu.gui.shop.shop-start */
/* module game.feature.menu.gui.shop.shop-misc */

/* module game.feature.menu.gui.shop.shop-list */

declare namespace sc {
  interface ShopItemButton extends sc.ListBoxButton {}
  interface ShopItemButtonConstructor extends ImpactClass<ShopItemButton> {}
  let ShopItemButton: ShopItemButtonConstructor;
}

/* module game.feature.trade.trade-model */

declare namespace sc {
  namespace TradeModel {
    interface FoundTrader {
      characterName: string;
      map: ig.LangLabel;
      area: ig.LangLabel;
      time: number;
    }
  }

  interface TradeModel extends ig.GameAddon {
    getFoundTrader(this: this, key: string): sc.TradeModel.FoundTrader;
  }
  interface TradeModelConstructor extends TradeModel {}
  let TradeModel: TradeModelConstructor;
  let trade: sc.TradeModel;
}

/* module game.feature.trade.gui.equip-toggle-stats */

declare namespace sc {
  interface TradeToggleStats extends ig.BoxGui {
    compareItem: sc.TextGui;
    compareHelpText: sc.TextGui;
    _createContent(this: this): void;
  }
  interface TradeToggleStatsConstructor extends ImpactClass<TradeToggleStats> {}
  let TradeToggleStats: TradeToggleStatsConstructor;
}

/* module game.feature.menu.gui.shop.shop-stats */

declare namespace sc {
  interface ShopEquipStats extends sc.TradeToggleStats {}
  interface ShopEquipStatsConstructor extends ImpactClass<ShopEquipStats> {
    new (): this['prototype'];
  }
  let ShopEquipStats: ShopEquipStatsConstructor;
}

/* module game.feature.menu.gui.shop.shop-cart */
/* module game.feature.menu.gui.shop.shop-quantity */
/* module game.feature.menu.gui.shop.shop-confirm */
/* module game.feature.menu.gui.shop.shop-menu */

/* module game.feature.menu.gui.help-boxes */

declare namespace sc {
  interface MultiPageBoxGui extends ig.GuiElementBase {
    header: sc.TextGui;

    _createInitContent(this: this, width: number): void;
  }
  interface MultiPageBoxGuiConstructor extends ImpactClass<MultiPageBoxGui> {}
  let MultiPageBoxGui: MultiPageBoxGuiConstructor;
}

/* module game.feature.menu.gui.synop.synop-misc */
/* module game.feature.menu.gui.synop.synop-menu */

/* module game.feature.menu.gui.quests.quest-misc */

declare namespace sc {
  interface QuestBaseBox extends ig.BoxGui {}
  interface QuestBaseBoxConstructor extends ImpactClass<QuestBaseBox> {}
  let QuestBaseBox: QuestBaseBoxConstructor;

  interface QuestInfoBox extends sc.QuestBaseBox {
    locationGui: ig.ColorGui;
    locationText: sc.TextGui;
  }
  interface QuestInfoBoxConstructor extends ImpactClass<QuestInfoBox> {
    new (): this['prototype'];
  }
  let QuestInfoBox: QuestInfoBoxConstructor;

  interface QuestDialog extends sc.QuestBaseBox {
    itemsGui: ig.GuiElementBase;

    setQuestRewards(
      this: this,
      quest: sc.Quest,
      hideRewards: boolean,
      finished: boolean,
    ): void;
  }
  interface QuestDialogConstructor extends ImpactClass<QuestDialog> {}
  let QuestDialog: QuestDialogConstructor;
}

/* module game.feature.menu.gui.quests.quest-tab-list */

declare namespace sc {
  interface QuestListBox extends ig.GuiElementBase {}
  interface QuestListBoxConstructor extends ImpactClass<QuestListBox> {}
  let QuestListBox: QuestListBoxConstructor;
}

/* module game.feature.npc.gui.npc-display-gui */
/* module game.feature.menu.gui.quests.quest-details */
/* module game.feature.menu.gui.quests.quest-menu */

/* module game.feature.menu.gui.tab-box */

declare namespace sc {
  interface TabbedPane extends ig.GuiElementBase {
    setPanelSize(this: this, width: number, height: number): void;
  }
  interface TabbedPaneConstructor extends ImpactClass<TabbedPane> {}
  let TabbedPane: TabbedPaneConstructor;

  interface ListTabbedPane extends sc.TabbedPane {
    bg: sc.MenuScanLines;

    onCreateListEntries(
      this: this,
      list: sc.ButtonListBox,
      buttonGroup: sc.ButtonGroup,
      type: any,
      sort: any,
    ): void;
  }
  interface ListTabbedPaneConstructor extends ImpactClass<ListTabbedPane> {}
  let ListTabbedPane: ListTabbedPaneConstructor;
}

/* module game.feature.msg.gui.msg-skip-hud */
/* module game.feature.msg.gui.side-message-hud */
/* module game.feature.combat.gui.enemy-display-gui */

/* module game.feature.menu.gui.enemies.enemy-pages */

declare namespace sc {
  interface EnemyBaseParamLine extends ig.GuiElementBase {
    gfx: ig.Image;
    icon: number;
  }
  interface EnemyBaseParamLineConstructor
    extends ImpactClass<EnemyBaseParamLine> {}
  let EnemyBaseParamLine: EnemyBaseParamLineConstructor;
}

/* module game.feature.menu.gui.social.social-misc */

declare namespace sc {
  interface SocialInfoBox extends ig.BoxGui {
    equip: ig.GuiElementBase;

    setCharacter(this: this, id: string): void;
  }
  interface SocialInfoBoxConstructor extends ImpactClass<SocialInfoBox> {}
  let SocialInfoBox: SocialInfoBoxConstructor;

  interface SocialEntryButton extends sc.ListBoxButton {
    gfx2: ig.Image;
    head: sc.SocialHead;
    status: ig.ImageGui;
    key: string;

    updateMemberStatus(this: this): void;
  }
  interface SocialEntryButtonConstructor
    extends ImpactClass<SocialEntryButton> {
    new (name: string, model: sc.PartyMemberModel): this['prototype'];
  }
  let SocialEntryButton: SocialEntryButtonConstructor;

  interface SocialHead extends ig.GuiElementBase {
    active: boolean;
  }
  interface SocialHeadConstructor extends ImpactClass<SocialHead> {}
  let SocialHead: SocialHeadConstructor;
}

/* module game.feature.menu.gui.quest-hub.quest-hub-misc */

/* module game.feature.menu.gui.quest-hub.quest-hub-list */

declare namespace sc {
  interface QuestHubList extends sc.ListTabbedPane {}
  interface QuestHubListConstructor extends ImpactClass<QuestHubList> {}
  let QuestHubList: QuestHubListConstructor;
}

/* module game.feature.menu.gui.quest-hub.quest-hub-menu */

/* module game.feature.menu.gui.enemies.enemy-list */

declare namespace sc {
  interface EnemyListBox extends sc.ListTabbedPane {}
  interface EnemyListBoxConstructor extends ImpactClass<EnemyListBox> {}
  let EnemyListBox: EnemyListBoxConstructor;
}

/* module game.feature.menu.gui.enemies.enemy-misc */
/* module game.feature.menu.gui.enemies.enemy-menu */
/* module game.feature.menu.gui.lore.lore-misc */

/* module game.feature.menu.gui.lore.lore-list */

declare namespace sc {
  interface LoreListBoxNew extends sc.ListTabbedPane {}
  interface LoreListBoxNewConstructor extends ImpactClass<LoreListBoxNew> {}
  let LoreListBoxNew: LoreListBoxNewConstructor;
}

/* module game.feature.menu.gui.lore.lore-menu */

/* module game.feature.menu.gui.status.status-misc */

declare namespace sc {
  interface StatusParamBar extends ig.GuiElementBase {
    gfx: ig.Image;
    lineID: number;
    usePercent: boolean;
    iconIndex: Vec2;
    skipVertLine: boolean;
    _baseRed: boolean;
    _equipRed: boolean;
    _skillsRed: boolean;
    _hideAll: boolean;
    _skillHidden: boolean;
  }
  interface StatusParamBarConstructor extends ImpactClass<StatusParamBar> {}
  let StatusParamBar: StatusParamBarConstructor;
}

/* module game.feature.menu.gui.status.status-view-main */

declare namespace sc {
  namespace StatusViewMainEquipment {
    interface Entry extends ig.GuiElementBase {
      textGui: sc.TextGui;
      itemGui: sc.TextGui & sc.TextGui.LevelDrawData;
    }
    interface EntryConstructor extends ImpactClass<Entry> {
      new (bodyPart: string): this['prototype'];
    }
    let Entry: EntryConstructor;
  }
}

/* module game.feature.menu.gui.stats.stats-gui-builds */
/* module game.feature.menu.gui.stats.stats-misc */
/* module game.feature.menu.gui.status.status-view-parameters */
/* module game.feature.menu.gui.status.status-view-modifiers */

/* module game.feature.menu.gui.status.status-view-combat-arts */

declare namespace sc {
  interface StatusViewCombatArtsEntry extends ig.GuiElementBase {
    getConditionType(this: this): string;
  }
  interface StatusViewCombatArtsEntryConstructor
    extends ImpactClass<StatusViewCombatArtsEntry> {}
  let StatusViewCombatArtsEntry: StatusViewCombatArtsEntryConstructor;
}

/* module game.feature.menu.gui.status.status-menu */
/* module game.feature.menu.gui.museum.museum-menu */
/* module game.feature.menu.gui.stats.stats-types */
/* module game.feature.menu.gui.stats.stats-list */
/* module game.feature.menu.gui.stats.stats-menu */
/* module game.feature.menu.gui.trophy.trophy-misc */
/* module game.feature.menu.gui.trophy.trophy-list */
/* module game.feature.menu.gui.trophy.trophy-menu */

/* module game.feature.menu.gui.social.social-list */

declare namespace sc {
  interface SocialList extends sc.ListTabbedPane {}
  interface SocialListConstructor extends ImpactClass<SocialList> {
    new (): this['prototype'];
  }
  let SocialList: SocialListConstructor;
}

/* module game.feature.menu.gui.social.social-menu */

/* module game.feature.trade.gui.trade-dialog */

declare namespace sc {
  interface TradeItem extends sc.ListBoxButton {}
  interface TradeItemConstructor extends ImpactClass<TradeItem> {
    // TODO name, id, description, amount, required, isTrade
    new (
      b: any,
      a: any,
      d: any,
      c: any,
      e: any,
      f: any,
      g: any,
    ): this['prototype'];
  }
  let TradeItem: TradeItemConstructor;

  interface TradeItemBox extends ig.GuiElementBase {}
  interface TradeItemBoxConstructor extends ImpactClass<TradeItemBox> {}
  let TradeItemBox: TradeItemBoxConstructor;
}

/* module game.feature.menu.gui.trade.trade-misc */

declare namespace sc {
  interface TradeButtonBox extends ig.GuiElementBase {
    location: sc.TextGui;
  }
  interface TradeButtonBoxConstructor extends ImpactClass<TradeButtonBox> {
    new (
      trader: string,
      buttonGroup: sc.ButtonGroup,
      buttonStartIndex: number,
    ): this['prototype'];
  }
  let TradeButtonBox: TradeButtonBoxConstructor;

  interface TradeDetailsView extends ig.BoxGui {
    location: sc.TextGui;
    getGui: sc.TradeItemBox;
    requireGui: sc.TradeItemBox;
    _trader: string;

    setTraderData(
      this: this,
      trader: string,
      offer: any,
      buttonPos: number,
    ): void;
  }
  interface TradeDetailsViewConstructor extends ImpactClass<TradeDetailsView> {
    new (): this['prototype'];
  }
  let TradeDetailsView: TradeDetailsViewConstructor;
}

/* module game.feature.menu.gui.trade.trader-list */

declare namespace sc {
  interface TradersListBox extends sc.ListTabbedPane {}
  interface TradersListBoxConstructor extends ImpactClass<TradersListBox> {
    new (): this['prototype'];
  }
  let TradersListBox: TradersListBoxConstructor;
}

/* module game.feature.menu.gui.trade.trader-menu */

/* module game.feature.menu.gui.botanics.botanics-misc */

declare namespace sc {
  interface BotanicsEntryButton extends sc.ListBoxButton {}
  interface BotanicsEntryButtonConstructor
    extends ImpactClass<BotanicsEntryButton> {}
  let BotanicsEntryButton: BotanicsEntryButtonConstructor;
}

/* module game.feature.menu.gui.botanics.botanics-list */

declare namespace sc {
  interface BotanicsListBox extends sc.ListTabbedPane {}
  interface BotanicsListBoxConstructor extends ImpactClass<BotanicsListBox> {}
  let BotanicsListBox: BotanicsListBoxConstructor;
}

/* module game.feature.menu.gui.botanics.botanics-menu */
/* module game.feature.menu.gui.arena.arena-cup-page */
/* module game.feature.menu.gui.arena.arena-round-page */
/* module game.feature.menu.gui.arena.arena-misc */

/* module game.feature.menu.gui.arena.arena-list */

declare namespace sc {
  interface ArenaCupList extends sc.ListTabbedPane {}
  interface ArenaCupListConstructor extends ImpactClass<ArenaCupList> {}
  let ArenaCupList: ArenaCupListConstructor;
}

/* module game.feature.menu.gui.arena.arena-menu */

/* module game.feature.menu.gui.new-game.new-game-misc */

declare namespace sc {
  interface NewGameToggleSet extends ig.GuiElementBase {}
  interface NewGameToggleSetConstructor extends ImpactClass<NewGameToggleSet> {}
  let NewGameToggleSet: NewGameToggleSetConstructor;

  interface NewGameOptionButton extends sc.ListBoxButtonCommon {
    data: { id: string; description: string };

    set: sc.NewGameToggleSet.SetOptions;

    updateToggleState(this: this): void;
  }
  interface NewGameOptionButtonConstructor
    extends ImpactClass<NewGameOptionButton> {
    new (
      name: string,
      amount: number,
      id: string,
      description: string,
      setKey: string,
      setOptions: sc.NewGameToggleSet.SetOptions,
      setGui: sc.NewGameToggleSet,
    ): this['prototype'];
  }
  let NewGameOptionButton: NewGameOptionButtonConstructor;
}

/* module game.feature.menu.gui.new-game.new-game-list */
/* module game.feature.menu.gui.new-game.new-game-menu */

/* module game.feature.menu.menu-model */

declare namespace sc {
  enum TOGGLE_SET_TYPE {
    SINGLE,
    MULTI,
  }

  interface MenuModel extends ig.GameAddon {
    statusElement: sc.ELEMENT;
    statusDiff: boolean;
  }
  interface MenuModelConstructor extends ImpactClass<MenuModel> {}
  let MenuModel: MenuModelConstructor;
  let menu: sc.MenuModel;

  interface MenuHelper {
    drawLevel(
      this: this,
      level: number,
      width: number,
      height: number,
      numberGfx: ig.Image,
    ): void;
  }
  let MenuHelper: MenuHelper;
}

/* module game.feature.model.game-model */

declare namespace sc {
  interface GameModel extends ig.GameAddon {
    message: sc.MessageModel;
  }
  interface GameModelConstructor extends ImpactClass<GameModel> {}
  let GameModel: GameModelConstructor;
  let model: sc.GameModel;
}

/* module game.feature.inventory.detectors */
/* module game.feature.inventory.plug-in */
/* module game.feature.ar.gui.ar-box */
/* module game.feature.ar.ar-steps */
/* module game.feature.ar.plug-in */
/* module game.feature.npc.entities.sc-actor */
/* module game.feature.base.action-steps */
/* module game.feature.base.event-steps */
/* module game.feature.base.plug-in */
/* module game.feature.bgm.playlist */
/* module game.feature.bgm.volume-map */
/* module game.feature.bgm.plug-in */
/* module game.feature.character.abstract-face */

/* module game.feature.character.character */

declare namespace sc {
  interface CharacterExpression extends ig.Cacheable {}
  interface CharacterExpressionConstructor
    extends ImpactClass<CharacterExpression> {}
  let CharacterExpression: CharacterExpressionConstructor;
}

/* module game.feature.character.char-templates */
/* module game.feature.character.plug-in */
/* module game.feature.combat.combat */
/* module game.feature.combat.pvp */
/* module game.feature.combat.combat-shield */
/* module game.feature.combat.combat-force */
/* module game.feature.combat.combat-stun */
/* module game.feature.combat.combat-assault */
/* module game.feature.combat.combat-poi */
/* module game.feature.combat.combat-charge */
/* module game.feature.combat.combat-sweep */
/* module game.feature.combat.entities.combatant-marble */
/* module game.feature.combat.entities.hit-number */
/* module game.feature.combat.entities.combatant */
/* module game.feature.combat.entities.food-icon */
/* module game.feature.combat.entities.drop */
/* module game.feature.combat.entities.item-drop */
/* module game.feature.combat.model.combat-condition */
/* module game.feature.combat.model.enemy-type */
/* module game.feature.combat.model.enemy-annotation */

/* module game.feature.new-game.new-game-model */

declare namespace sc {
  namespace NewGameToggleSet {
    interface SetOptions {
      type: sc.TOGGLE_SET_TYPE;
      order: number;
    }
  }

  let NEW_GAME_SETS: { [id: string]: sc.NewGameToggleSet.SetOptions };

  interface NewGamePlusModel extends ig.GameAddon {
    options: { [id: string]: boolean };
  }
  interface NewGamePlusModelConstructor extends ImpactClass<NewGamePlusModel> {}
  let NewGamePlusModel: NewGamePlusModelConstructor;
  let newgame: sc.NewGamePlusModel;
}

/* module game.feature.combat.entities.enemy */
/* module game.feature.combat.entities.enemy-spawner */
/* module game.feature.combat.entities.respawn-blocker */
/* module game.feature.combat.entities.burst-spawner */
/* module game.feature.combat.entities.stone */
/* module game.feature.combat.gui.status-bar */

/* module game.feature.combat.gui.pvp-gui */

declare namespace sc {
  interface PvpRoundGui extends ig.GuiElementBase {}
  interface PvpRoundGuiConstructor extends ImpactClass<PvpRoundGui> {
    new (roundNumber: number, autoContinue: number): this['prototype'];
  }
  let PvpRoundGui: PvpRoundGuiConstructor;
}

/* module game.feature.combat.model.combat-status */
/* module game.feature.combat.combat-target-event */
/* module game.feature.combat.model.enemy-reaction */
/* module game.feature.combat.model.enemy-collab */
/* module game.feature.combat.model.enemy-level-scaling */
/* module game.feature.combat.model.enemy-tracker */
/* module game.feature.combat.model.enemy-booster */
/* module game.feature.combat.entities.combat-proxy */
/* module game.feature.combat.combat-action-steps */
/* module game.feature.combat.combat-event-steps */
/* module game.feature.combat.enemy-steps */
/* module game.feature.combat.plug-in */
/* module game.feature.game-code.game-code */
/* module game.feature.game-code.plug-in */
/* module game.feature.interact.gui.interact-gui */
/* module game.feature.interact.map-interact */
/* module game.feature.map-content.entities.elevator */
/* module game.feature.map-content.map-content-steps */
/* module game.feature.map-content.gui.icon-hover-text */
/* module game.feature.map-content.map-style */
/* module game.feature.map-content.sc-doors */
/* module game.feature.map-content.prop-interact */
/* module game.feature.map-content.entities.jump-panel */
/* module game.feature.map-content.entities.teleport-central */
/* module game.feature.map-content.gui.rhombus-map */
/* module game.feature.map-content.entities.rhombus-point */
/* module game.feature.map-content.plug-in */
/* module game.feature.model.model-steps */
/* module game.feature.model.plug-in */
/* module game.feature.skills.plug-in */
/* module game.feature.msg.entities.event-trigger */
/* module game.feature.msg.gui.message-box */
/* module game.feature.msg.gui.dream-msg */
/* module game.feature.msg.gui.message-overlay */
/* module game.feature.msg.gui.message-board */
/* module game.feature.msg.msg-steps */
/* module game.feature.msg.plug-in */
/* module game.feature.interact.screen-interact */
/* module game.feature.interact.skip-interact */
/* module game.feature.interact.plug-in */
/* module game.feature.trade.gui.trade-menu */
/* module game.feature.npc.entities.npc-entity */
/* module game.feature.npc.entities.npc-runner-entity */
/* module game.feature.npc.npc-runners */

/* module game.feature.npc.npc-steps */

/* eslint-disable @typescript-eslint/class-name-casing, @typescript-eslint/camelcase */
declare namespace ig {
  namespace EVENT_STEP {
    interface DO_THE_SHAKE extends ig.EventStepBase {
      person: string;
      message: string;
      charExpression: sc.CharacterExpression;
    }
    interface DO_THE_SHAKE_Constructor extends ImpactClass<DO_THE_SHAKE> {}
    let DO_THE_SHAKE: DO_THE_SHAKE_Constructor;
  }
}
/* eslint-enable @typescript-eslint/class-name-casing, @typescript-eslint/camelcase */

/* module game.feature.npc.plug-in */
/* module game.feature.player.entities.crosshair */
/* module game.feature.player.player-level-notifier */
/* module game.feature.player.item-consumption */
/* module game.feature.player.entities.player-base */
/* module game.feature.player.entities.player-pet */
/* module game.feature.player.entities.player */

/* module game.feature.party.party */

declare namespace sc {
  enum PARTY_MEMBER_TYPE {
    UNKNOWN,
    CONTACT,
    FRIEND,
  }

  namespace PartyModel {
    interface Contact {
      status: sc.PARTY_MEMBER_TYPE;
      online: boolean;
      locked: boolean;
    }
  }
  interface PartyModel extends ig.GameAddon {
    contacts: { [name: string]: sc.PartyModel.Contact };
    isPartyMember(name: string): boolean;
  }
  interface PartyModelConstructor extends PartyModel {}
  let PartyModel: PartyModelConstructor;
  let party: sc.PartyModel;
}

/* module game.feature.player.player-steps */
/* module game.feature.player.crosshair-steps */
/* module game.feature.player.modifiers */
/* module game.feature.player.player-skin */
/* module game.feature.player.plug-in */
/* module game.feature.puzzle.components.push-pullable */
/* module game.feature.puzzle.entities.block */
/* module game.feature.puzzle.entities.blockers */
/* module game.feature.puzzle.entities.bomb */
/* module game.feature.puzzle.entities.water-bubble */
/* module game.feature.puzzle.entities.compressor */
/* module game.feature.puzzle.entities.water-block */
/* module game.feature.puzzle.entities.ice-disk */
/* module game.feature.puzzle.entities.key-panel */
/* module game.feature.puzzle.entities.ball-changer */
/* module game.feature.puzzle.entities.walls */
/* module game.feature.puzzle.entities.glowing-line */
/* module game.feature.puzzle.entities.lorry */
/* module game.feature.puzzle.entities.one-time-switch */
/* module game.feature.puzzle.entities.element-shield */
/* module game.feature.puzzle.entities.floor-switch */
/* module game.feature.puzzle.entities.magnet */
/* module game.feature.puzzle.entities.multi-hit-switch */
/* module game.feature.puzzle.entities.bounce-switch */
/* module game.feature.puzzle.entities.thermo-pole */
/* module game.feature.puzzle.entities.push-pull-block */
/* module game.feature.puzzle.entities.push-pull-dest */
/* module game.feature.puzzle.entities.sliding-block */
/* module game.feature.puzzle.entities.switch */
/* module game.feature.puzzle.entities.destructible */
/* module game.feature.puzzle.entities.item-destruct */
/* module game.feature.puzzle.entities.regen-destruct */
/* module game.feature.puzzle.entities.extract-platform */
/* module game.feature.puzzle.entities.dynamic-platform */
/* module game.feature.puzzle.entities.ol-platform */
/* module game.feature.puzzle.entities.enemy-counter */
/* module game.feature.puzzle.entities.group-switch */
/* module game.feature.puzzle.entities.chest */
/* module game.feature.puzzle.entities.quick-sand */
/* module game.feature.puzzle.entities.spiderweb */
/* module game.feature.puzzle.entities.steam-pipes */
/* module game.feature.puzzle.entities.tesla-coil */
/* module game.feature.puzzle.entities.wave-teleport */
/* module game.feature.puzzle.puzzle-steps */
/* module game.feature.puzzle.entities.rotate-blocker */
/* module game.feature.puzzle.entities.boss-platform */
/* module game.feature.puzzle.plug-in */
/* module game.feature.menu.menu-steps */
/* module game.feature.menu.plug-in */
/* module game.feature.quick-menu.gui.quick-item-menu */
/* module game.feature.quick-menu.gui.quick-misc */
/* module game.feature.quick-menu.gui.quick-screen-types */
/* module game.feature.quick-menu.gui.quick-screen */
/* module game.feature.quick-menu.gui.circle-menu */
/* module game.feature.quick-menu.gui.quick-party */
/* module game.feature.quick-menu.gui.quick-menu */
/* module game.feature.quick-menu.entities.analyzable */
/* module game.feature.quick-menu.plug-in */
/* module game.feature.tutorial.input-forcer */
/* module game.feature.tutorial.tutorial-steps */
/* module game.feature.tutorial.plug-in */

/* module game.feature.trade.gui.trade-icon */

declare namespace sc {
  interface TradeIconGui extends ig.BoxGui {
    entries: Array<{
      require: any;
      gui: sc.TextGui & { tradeName: string } & sc.TextGui.LevelDrawData;
    }>;

    _createContent(this: this): void;
  }
  interface TradeIconGuiConstructor extends ImpactClass<TradeIconGui> {}
  let TradeIconGui: TradeIconGuiConstructor;
}

/* module game.feature.trade.trade-steps */
/* module game.feature.trade.plug-in */
/* module game.feature.save-preset.save-preset */
/* module game.feature.save-preset.plug-in */
/* module game.feature.xeno-dialogs.entities.xeno-dialog */
/* module game.feature.xeno-dialogs.gui.xeno-icon */
/* module game.feature.xeno-dialogs.plug-in */

/* module game.feature.quest.quest-types */

declare namespace sc {
  interface QuestSubTaskBase extends ig.Class {}
  interface QuestSubTaskBaseConstructor extends ImpactClass<QuestSubTaskBase> {}
  let QuestSubTaskBase: QuestSubTaskBaseConstructor;

  interface Quest extends ig.Class {}
  interface QuestConstructor extends ImpactClass<Quest> {}
  let Quest: QuestConstructor;
}

/* module game.feature.quest.quest-model */
/* module game.feature.quest.quest-steps */
/* module game.feature.quest.plug-in */
/* module game.feature.party.party-steps */

/* module game.feature.party.party-member-model */

declare namespace sc {
  interface PartyMemberModel extends ig.Class {}
  interface PartyMemberModelConstructor extends ImpactClass<PartyMemberModel> {}
  let PartyMemberModel: PartyMemberModelConstructor;
}

/* module game.feature.party.entities.party-member-entity */
/* module game.feature.party.plug-in */
/* module game.feature.common-event.common-event */
/* module game.feature.common-event.common-event-steps */
/* module game.feature.common-event.plug-in */
/* module game.feature.voice-acting.voice-acting */
/* module game.feature.voice-acting.va-config */
/* module game.feature.voice-acting.plug-in */
/* module game.feature.credits.credit-loadable */

/* module game.feature.credits.gui.credits-gui */

declare namespace ig {
  namespace GUI {
    interface CreditSection extends ig.GuiElementBase {
      content: ig.GuiElementBase;
      finished: boolean;
      isOffscreen: boolean;

      remove(this: this): void;
      createHeader(
        this: this,
        text: ig.LangLabel.Data | string,
        pos: Vec2,
        namesEmpty: boolean,
      ): void;
      createNames(
        this: this,
        names: Array<ig.LangLabel.Data | string>,
        columns: number,
        columnGuis: ig.GuiElementBase[],
        pos: Vec2,
      ): void;
    }
    interface CreditSectionConstructor extends ImpactClass<CreditSection> {}
    let CreditSection: CreditSectionConstructor;
  }
}

/* module game.feature.credits.credits-steps */
/* module game.feature.credits.plug-in */
/* module game.feature.arena.entities.arena-spawn */
/* module game.feature.arena.arena-loadable */
/* module game.feature.arena.arena-bonus-objectives */
/* module game.feature.arena.arena-score-types */
/* module game.feature.arena.arena-challenges */
/* module game.feature.arena.arena-cheer */
/* module game.feature.arena.arena */
/* module game.feature.arena.gui.arena-effect-display */
/* module game.feature.arena.gui.arena-round-gui */
/* module game.feature.arena.gui.arena-trophy-gui */
/* module game.feature.arena.gui.arena-rush-gui */
/* module game.feature.arena.gui.arena-gui */
/* module game.feature.arena.gui.arena-start-gui */
/* module game.feature.arena.arena-steps */
/* module game.feature.arena.plug-in */
/* module game.feature.new-game.new-game-steps */
/* module game.feature.new-game.plug-in */
/* module game.feature.game-sense.game-sense-model */
/* module game.feature.game-sense.controllers.hp-controller */
/* module game.feature.game-sense.controllers.element-controller */
/* module game.feature.game-sense.plug-in */
/* module game.features */
/* module game.feature.beta.beta-controls */
/* module game.feature.beta.plug-in */
/* module impact.feature.lang-edit.lang-edit */
/* module impact.feature.lang-edit.plug-in */
/* module game.beta */

/* module game.main */

declare namespace sc {
  interface CrossCode extends ig.Game {
    onGameLoopStart(this: this): void;
  }
  interface CrossCodeConstructor extends ImpactClass<CrossCode> {}
  let CrossCode: CrossCodeConstructor;
}
