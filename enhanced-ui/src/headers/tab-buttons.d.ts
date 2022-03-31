declare namespace sc {
  namespace ui2 {
    interface TabbedPaneMixin {
      UI2_INCREASE_TAB_BUTTON_WIDTH?: number | null;
      UI2_TAB_BTN_AUTO_WIDTH?: boolean | null;
      UI2_TAB_BTN_AUTO_WIDTH_PADDING?: number | null;
      UI2_TAB_BTN_AUTO_WIDTH_MIN?: number | null;
    }
  }

  interface TabbedPane extends sc.ui2.TabbedPaneMixin {}
  interface ItemTabbedBox extends sc.ui2.TabbedPaneMixin {}
  interface OptionsTabBox extends sc.ui2.TabbedPaneMixin {}
  interface QuestListBox extends sc.ui2.TabbedPaneMixin {}
}
