export {};

declare global {
  namespace sc {
    namespace MapModel {
      namespace Area {
        interface Landmark {
          teleportQuestion: ig.LangLabel.Data;
        }
      }
    }

    interface LandmarkGui {
      teleportQuestion: string;
    }
  }
}
