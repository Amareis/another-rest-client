export type Listener = (...p: any[]) => void

export type Target = {
    on: (type: string, func: Listener, ctx: any) => Target
    off: (type?: string, func?: Listener) => Target
    emit: (type: string, ...args: any[]) => Target
}

export function Events<T>(target: T): T & Target {
    const t: T & Target = target as any
    let events: Record<string, [Listener, any]> = {};
    /**
     *  On: listen to events
     */
    t.on = function(type, func, ctx) {
        (events[type] = events[type] || []).push([func, ctx])
        return t
    }
    /**
     *  Off: stop listening to event / specific callback
     */
    t.off = function(type, func) {
        if (!type) events = {}
        const list = events[type as any] || [];
        let i = func ? list.length : 0;
        while (i--) func == list[i][0] && list.splice(i, 1)
        return t
    }
    /**
     * Emit: send event, callbacks will be triggered
     */
    t.emit = function(type: string, ...args: any[]){
        const e = events[type] || [], list = e.length > 0 ? e.slice(0, e.length) : e;
        let i = 0, j;
        while (j = list[i++]) j[0].apply(j[1], args)
        return t
    };

    return t
}