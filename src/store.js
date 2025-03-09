import {debounce} from 'components/src/util.js'
import * as kv from 'idb-keyval'
import {writable} from 'svelte/store'

import {router} from '~/App.svelte'

export const appstate = writable({})
export const session = writable({
    loaded: false,
})
;(async function init() {
    const appstate_idb = await kv.get('appstate')
    if (appstate_idb) appstate.set(appstate_idb)

    session.update(v => ({...v, loaded: true}))
    router.listen()
})()

appstate.subscribe(
    debounce(data => {
        kv.set('appstate', data)
    }, 200),
)
