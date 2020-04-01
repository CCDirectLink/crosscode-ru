declare namespace sc {
  interface ListBoxButtonCommon {
    enableTickerDisplay: boolean;
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
