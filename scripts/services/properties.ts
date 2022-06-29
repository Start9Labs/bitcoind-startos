import { Effects, ExpectedExports, YAML } from "../deps.ts";

type UnPromise<A> = A extends Promise<infer B> ? B : never
// deno-lint-ignore no-explicit-any
const asResult = (result: any) => ({ result })
const noPropertiesFound: UnPromise<ReturnType<ExpectedExports.properties>> = {
  result: {
    version: 2,
    data: {
      "Not Ready": {
        type: "string",
        value: "Could not find properties. The service might still be starting",
        qr: false,
        copyable: false,
        masked: false,
        description: "Fallback Message When Properties could not be found"
      }
    }
  }
} as const
export const properties: ExpectedExports.properties = (
  effects: Effects,
) => {

  return effects.readFile({
    path: "start9/stats.yaml",
    volumeId: "main",
  }).then(YAML.parse).then(asResult, () => noPropertiesFound)
};
