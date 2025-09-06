import { bitcoinConfFile } from '../fileModels/bitcoin.conf'
import { sdk } from '../sdk'
import {
  prunedRpcallowip,
  prunedRpcbind,
  unprunedRpcallowIp,
  unprunedRpcbind,
} from '../utils'

export const watchPrune = sdk.setupOnInit(async (effects, _) => {
  const conf = await bitcoinConfFile
    .read((c) => ({
      prune: c.prune,
      rpcbind: c.rpcbind,
      rpcallowip: c.rpcallowip,
    }))
    .const(effects)
  if (!conf) {
    throw new Error('bitcoin.conf not found')
  }
  const { prune, rpcbind, rpcallowip } = conf

  if (prune) {
    if (rpcbind !== prunedRpcbind || rpcallowip !== prunedRpcallowip) {
      await bitcoinConfFile.merge(
        effects,
        {
          rpcbind: prunedRpcbind,
          rpcallowip: prunedRpcallowip,
        },
        { allowWriteAfterConst: true },
      )
    }
  } else {
    if (rpcbind !== unprunedRpcbind || rpcallowip !== unprunedRpcallowIp)
      await bitcoinConfFile.merge(effects, {
        rpcbind: unprunedRpcbind,
        rpcallowip: unprunedRpcallowIp,
      })
  }
})
