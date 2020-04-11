declare namespace Mod {
  interface Manifest {
    description?: string;
  }
}

declare interface Mod {
  name: string;
  manifest: Mod.Manifest;
}

declare interface Window {
  activeMods: Mod[];
  inactiveMods: Mod[];
}
