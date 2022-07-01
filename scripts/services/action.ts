import { types as T } from '../dependencies.ts'

export const action = {

    async "delete-tx-index"(effect: T.Effects, _input?: T.Config): Promise<T.ResultType<T.ActionResult>> {
        await effect.removeDir({
            path: "indexes/txindex",
            volumeId: "main",
        });
        return {
            result: {
                copyable: false,
                message: "Deleted txindex",
                version: "0",
                qr: false,
            }
        }
    }
}