import { sdk } from '../../sdk'
import { read } from './read'
import { write } from './write'
import { configSpec } from './spec'

export const config = sdk.Action.withInput(
  // id
  'config',

  // metadata
  async ({ effects }) => ({
    name: 'Customize Bitcoin',
    description: 'Edit the bitcoin.conf configuration file',
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  configSpec,

  // optionally pre-fill the input form
  ({ effects }) => read(effects),

  // the execution function
  ({ effects, input }) => write(input),
)
