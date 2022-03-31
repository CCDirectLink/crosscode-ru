declare namespace sc {
  interface ListBoxButton {
    UI2_LIST_BOX_BTN_TICKER_DISPLAY?: boolean | null;
  }

  interface NewGameOptionButton {
    name: sc.TextLike;
  }

  interface TradeToggleStats {
    _updateTickerMaxSize(this: this): void;
  }

  interface SubTaskEntryBase {
    _updateTickerMaxSize(this: this): void;
  }
}
