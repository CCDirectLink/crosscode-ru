// <https://gist.github.com/dmitmel/5a498b9c9ac33994ac1ab5accbe0d7da>
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ScanDb, ScanFragment, ScanGameFile } from './crosslocale/scan.js';
import * as uuid from 'uuid';
import * as paths from 'path';
import { ChangelogFileData } from 'ultimate-crosscode-typedefs/file-types/changelog';
import * as fsUtils from './utils/fs.js';
import * as yargs from 'yargs';

async function main(): Promise<void> {
  let opts = yargs(process.argv.slice(2))
    .usage('$0')
    .help()
    .strict()
    .options({
      gameAssetsDir: {
        string: true,
        requiresArg: true,
        alias: 'g',
        demandOption: true,
        normalize: true,
      },
      outputFile: {
        string: true,
        requiresArg: true,
        alias: 'o',
        demandOption: true,
        normalize: true,
      },
      prevFile: {
        string: true,
        requiresArg: true,
        alias: 'p',
        normalize: true,
      },
    }).argv;

  let scanDb: ScanDb;
  if (opts.prevFile != null) {
    scanDb = ScanDb.fromJSON(await fsUtils.readJsonFile(opts.prevFile));
  } else {
    let gameVersion = await loadGameVersion(opts.gameAssetsDir);
    scanDb = new ScanDb(uuid.v4(), new Date(), gameVersion);
  }

  function addGameFile(opts: { path: string; assetRoot?: string | null }): ScanGameFile {
    opts.assetRoot ??= '';
    let gameFile = scanDb.gameFiles.get(opts.path);
    if (gameFile == null) {
      gameFile = new ScanGameFile(scanDb, opts.path, opts.assetRoot);
      scanDb.gameFiles.set(gameFile.path, gameFile);
    }
    return gameFile;
  }

  function addFragment(
    gameFile: ScanGameFile,
    opts: {
      jsonPath: string;
      langUid?: number | null;
      description?: string[] | null;
      text: string;
      injected?: boolean | null;
      flags?: string[] | null;
    },
  ): ScanFragment {
    opts.langUid ??= 0;
    opts.description ??= [];
    opts.injected ??= true;
    opts.flags ??= [];

    let flags = new Set(opts.flags);
    let description = [...opts.description];
    if (opts.injected) {
      flags.add('injected_in_mod');
      description.push('INJECTED_IN_MOD');
    }

    let fragment = new ScanFragment(
      scanDb,
      gameFile,
      opts.jsonPath,
      opts.langUid,
      description,
      new Map([['en_US', opts.text]]),
      flags,
    );
    gameFile.fragments.set(fragment.jsonPath, fragment);
    return fragment;
  }

  {
    let file = addGameFile({ path: 'data/lang/sc/gui.en_US.json' });
    addFragment(file, { jsonPath: 'labels/combat-hud/pvp-round', text: 'Round' });
    addFragment(file, { jsonPath: 'labels/combat-hud/boss', text: 'Boss' });
    addFragment(file, { jsonPath: 'labels/title-screen/changelog', text: 'Changelog' });
    addFragment(file, {
      jsonPath: 'labels/options/crosscode-ru/localized-labels-on-sprites/name',
      text: 'Localized labels on sprites',
    });
    addFragment(file, {
      jsonPath: 'labels/options/crosscode-ru/localized-labels-on-sprites/description',
      text: 'Enables translated labels on sprites such as signs in the game world. \\c[1]Needs a restart!',
    });
    addFragment(file, { jsonPath: 'labels/menu/option/mods', text: 'Mods' });
    addFragment(file, {
      jsonPath: 'labels/options/mods-description/description',
      text: 'In this menu you can \\c[3]enable or disable installed mods\\c[0]. Mod descriptions are shown below. \\c[1]The game needs to be restarted\\c[0] if you change any options here!',
    });
    addFragment(file, { jsonPath: 'labels/options/headers/logLevel', text: 'Log levels' });
    addFragment(file, {
      jsonPath: 'labels/options/logLevel-log/name',
      text: 'Log level: Default',
    });
    addFragment(file, {
      jsonPath: 'labels/options/logLevel-log/description',
      text: 'Enables default message popups. \\c[1]Needs a restart!',
    });
    addFragment(file, {
      jsonPath: 'labels/options/logLevel-warn/name',
      text: 'Log level: Warnings',
    });
    addFragment(file, {
      jsonPath: 'labels/options/logLevel-warn/description',
      text: 'Enables warning popups. \\c[1]Needs a restart!',
    });
    addFragment(file, {
      jsonPath: 'labels/options/logLevel-error/name',
      text: 'Log level: Errors',
    });
    addFragment(file, {
      jsonPath: 'labels/options/logLevel-error/description',
      text: 'Enables error popups. \\c[1]Needs a restart!',
    });
    addFragment(file, { jsonPath: 'labels/misc-time-var/12-00', text: "It's High Noon" });
  }

  {
    let file = addGameFile({ path: 'data/maps/bergen/bergen.json' });
    for (let { path, description } of [
      {
        path: 'entities/836/settings/npcStates/0/event/quest/13/name',
        description: [
          'NPC',
          'gamecode.holidayQuest',
          'ADD_MSG_PERSON bergen.one-holiday-man @DEFAULT',
        ],
      },
      {
        path: 'entities/836/settings/npcStates/1/event/0/name',
        description: [
          'NPC',
          'quest.holiday-man.started',
          'ADD_MSG_PERSON bergen.one-holiday-man @DEFAULT',
        ],
      },
      {
        path: 'entities/836/settings/npcStates/2/event/quest/0/name',
        description: [
          'NPC',
          'quest.holiday-man.task.4',
          'ADD_MSG_PERSON bergen.one-holiday-man @DEFAULT',
        ],
      },
      {
        path: 'entities/836/settings/npcStates/2/event/quest/18/name',
        description: [
          'NPC',
          'quest.holiday-man.task.4',
          'ADD_MSG_PERSON bergen.one-holiday-man @DEFAULT',
        ],
      },
      {
        path: 'entities/836/settings/npcStates/2/event/quest/25/name',
        description: [
          'NPC',
          'quest.holiday-man.task.4',
          'ADD_MSG_PERSON bergen.one-holiday-man @DEFAULT',
        ],
      },
      {
        path: 'entities/836/settings/npcStates/3/event/0/name',
        description: [
          'NPC',
          'quest.holiday-man.task.5',
          'ADD_MSG_PERSON bergen.one-holiday-man @DEFAULT',
        ],
      },
      {
        path: 'entities/836/settings/npcStates/4/event/quest/0/name',
        description: [
          'NPC',
          'quest.holiday-man.task.6',
          'ADD_MSG_PERSON bergen.one-holiday-man @DEFAULT',
        ],
      },
      {
        path: 'entities/836/settings/npcStates/5/event/7/thenStep/0/thenStep/7/name',
        description: [
          'NPC',
          'quest.holiday-man.solved',
          'IF !map.gotHolidayBoots && item.16.amount < 1',
          'IF player.hasElement.3 && player.hasElement.4',
          'ADD_MSG_PERSON bergen.one-holiday-man @BALD',
        ],
      },
    ]) {
      addFragment(file, { jsonPath: path, description, text: 'Holiday Man' });
    }
  }

  {
    let databaseJson = await fsUtils.readJsonFile<any>(
      paths.join(opts.gameAssetsDir, 'data', 'database.json'),
    );
    let file = addGameFile({ path: 'data/database.json' });

    for (let [areaId, area] of Object.entries<any>(databaseJson.areas)) {
      let { landmarks } = area;
      if (landmarks == null) continue;
      for (let [landmarkId, landmark] of Object.entries<any>(landmarks)) {
        if (landmark.teleportQuestion == null && landmark.name != null) {
          addFragment(file, {
            jsonPath: `areas/${areaId}/landmarks/${landmarkId}/teleportQuestion`,
            description: [],
            text: `Teleport to ${landmark.name.en_US}?`,
          });
        }
      }
    }
  }

  await fsUtils.writeJsonFile(opts.outputFile, scanDb);
}

// Taken from <https://github.com/dmitmel/ccloader3/blob/8cdfed34dacb46879cb1aa86729e9b2c5aa7b0a2/src/game.ts#L9-L32>
async function loadGameVersion(gameAssetsDir: string): Promise<string> {
  let { changelog } = await fsUtils.readJsonFile<ChangelogFileData>(
    paths.join(gameAssetsDir, 'data', 'changelog.json'),
  );
  let latestEntry = changelog[0];

  let hotfix = 0;
  let changes = [];
  if (latestEntry.changes != null) changes.push(...latestEntry.changes);
  if (latestEntry.fixes != null) changes.push(...latestEntry.fixes);
  for (let change of changes) {
    let match = /^\W*HOTFIX\((\d+)\)/i.exec(change);
    if (match != null && match.length === 2) {
      hotfix = Math.max(hotfix, parseInt(match[1], 10));
    }
  }

  return `${latestEntry.version}-${hotfix}`;
}

void main();
