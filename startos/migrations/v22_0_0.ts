import { sdk } from '../sdk'
import { bitcoinConfFile } from '../file-models/bitcoin.conf'
import { ConfigSpec } from '../config/spec'
import { read } from '../config/read'

export const v22_0_0 = sdk.Migration.of({
  version: '22.0.0',
  up: async ({ effects }) => {
    const config = read
    await effects.setConfigured({ configured: false })
  },
  down: async ({ effects }) => {},
})
