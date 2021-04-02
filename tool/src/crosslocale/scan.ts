// Integration with <https://github.com/dmitmel/crosscode-localization-engine/blob/df107e573d40edcdc8639df6c00818cd5f41a989/src/scan.rs>

/* eslint-disable @typescript-eslint/naming-convention */

import * as miscUtils from '../utils/misc.js';

export interface ScanDbSerde {
  id: string;
  ctime: number;
  game_version: string;
  game_files: Record<string, ScanGameFileSerde>;
}

export interface ScanGameFileSerde {
  asset_root: string;
  fragments: Record<string, ScanFragmentSerde>;
}

export interface ScanFragmentSerde {
  luid: number;
  desc: string[];
  text: Record<string, string>;
  flags: string[];
}

export class ScanDb {
  public gameFiles = new Map<string, ScanGameFile>();
  public constructor(
    //
    public id: string,
    public creationTimestamp: Date,
    public gameVersion: string,
  ) {}

  public static fromJSON(raw: ScanDbSerde): ScanDb {
    let self = new ScanDb(raw.id, new Date(raw.ctime), raw.game_version);
    for (let [gameFilePath, gameFileRaw] of miscUtils.objectIterator(raw.game_files)) {
      let gameFile = new ScanGameFile(self, gameFilePath, gameFileRaw.asset_root);
      for (let [fragmentJsonPath, fragmentRaw] of miscUtils.objectIterator(gameFileRaw.fragments)) {
        let fragment = new ScanFragment(
          self,
          gameFile,
          fragmentJsonPath,
          fragmentRaw.luid,
          fragmentRaw.desc,
          miscUtils.objectToMap(fragmentRaw.text),
          new Set(fragmentRaw.flags),
        );
        gameFile.fragments.set(fragmentJsonPath, fragment);
      }
      self.gameFiles.set(gameFilePath, gameFile);
    }
    return self;
  }

  public toJSON(): ScanDbSerde {
    let raw: ScanDbSerde = {
      id: this.id,
      ctime: Math.floor(this.creationTimestamp.getTime() / 1000),
      game_version: this.gameVersion,
      game_files: {},
    };
    for (let [gameFilePath, gameFile] of this.gameFiles) {
      let gameFileRaw: ScanGameFileSerde = {
        asset_root: gameFile.assetRoot,
        fragments: {},
      };
      for (let [fragmentJsonPath, fragment] of gameFile.fragments) {
        let fragmentRaw: ScanFragmentSerde = {
          luid: fragment.langUid,
          desc: fragment.description,
          text: miscUtils.mapToObject(fragment.text),
          flags: Array.from(fragment.flags),
        };
        gameFileRaw.fragments[fragmentJsonPath] = fragmentRaw;
      }
      raw.game_files[gameFilePath] = gameFileRaw;
    }
    return raw;
  }
}

export class ScanGameFile {
  public fragments = new Map<string, ScanFragment>();
  public constructor(
    //
    public scanDb: ScanDb,
    public path: string,
    public assetRoot: string,
  ) {}
}

export class ScanFragment {
  public constructor(
    public scanDb: ScanDb,
    public file: ScanGameFile,
    public jsonPath: string,
    public langUid: number,
    public description: string[],
    public text: Map<string, string>,
    public flags: Set<string>,
  ) {}
}
