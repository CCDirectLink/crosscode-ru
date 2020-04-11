declare namespace sc {
  interface InfoBar {
    _associatedBuffInfo: sc.BuffInfo | null;

    _updateTickerMaxSize(this: this): void;
  }
}
