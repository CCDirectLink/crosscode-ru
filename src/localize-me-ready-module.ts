export default async function initLocalizeMeReady(): Promise<void> {
  const NAME = 'localize-me.final-locale.ready';
  if (ig.modules[NAME] != null) return;

  ig.modules[NAME] = { requires: [], loaded: false, body: null };
  ig._waitForOnload++;

  await localizeMe.game_locale_config.get_final_locale();

  ig.modules[NAME].loaded = true;
  ig._waitForOnload--;
  ig._execModules();
}
