import { util, types as T } from "../dependencies.ts";

export const action = {
  async "delete-txindex"(
    effect: T.Effects,
    _input?: T.Config
  ): Promise<T.ResultType<T.ActionResult>> {
    const txinfoLocation = {
      path: "indexes/txindex",
      volumeId: "main",
    };
    if ((await util.exists(effect, txinfoLocation)) === false) {
      return {
        result: {
          copyable: false,
          message: "txindex doesn't exist",
          version: "0",
          qr: false,
        },
      };
    }
    await effect.removeDir(txinfoLocation);
    return {
      result: {
        copyable: false,
        message: "Deleted txindex",
        version: "0",
        qr: false,
      },
    };
  },
  async "delete-peers"(
    effect: T.Effects,
    _input?: T.Config
  ): Promise<T.ResultType<T.ActionResult>> {
    const peersLocation = {
      path: "peers.dat",
      volumeId: "main",
    };
    if ((await util.exists(effect, peersLocation)) === false) {
      return {
        result: {
          copyable: false,
          message: "peers.dat doesn't exist",
          version: "0",
          qr: false,
        },
      };
    }
    await effect.removeFile(peersLocation);
    return {
      result: {
        copyable: false,
        message: "Deleted peers.dat",
        version: "0",
        qr: false,
      },
    };
  },
  async "delete-coinstatsindex"(
    effect: T.Effects,
    _input?: T.Config,
  ): Promise<T.ResultType<T.ActionResult>> {
    const coinstatsinfoLocation = {
      path: "indexes/coinstats",
      volumeId: "main",
    };
    if (await util.exists(effect, coinstatsinfoLocation) === false) {
      return {
        result: {
          copyable: false,
          message: "coinstatsindex doesn't exist",
          version: "0",
          qr: false,
        },
      };
    }
    await effect.removeDir(coinstatsinfoLocation);
    return {
      result: {
        copyable: false,
        message: "Deleted coinstatsindex",
        version: "0",
        qr: false,
      },
    };
  },
};
