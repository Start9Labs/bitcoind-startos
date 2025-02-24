import { FileHelper, matches } from '@start9labs/start-sdk'

const {
  object,
  string,
  boolean,
  number
} = matches

const shape = object({
  bitcoind_address: string,
  bitcoind_port: number,
  bind_address: string,
  bind_port: number,
  cookie_file: string,
  tor_proxy: string,
  tor_only: boolean
})

export const configToml = FileHelper.toml('/media/startos/volumes/main/config.toml', shape)