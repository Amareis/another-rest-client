const empty: never[] = [];

type Listener = (...p: any[]) => void

export function Events(target: any) {
    let events: Record<string, [Listener, any]> = {};
    /**
     *  On: listen to events
     */
    target.on = function(type: string, func: Listener, ctx: any){
        (events[type] = events[type] || []).push([func, ctx])
        return target
    }
    /**
     *  Off: stop listening to event / specific callback
     */
    target.off = function(type: string, func?: Listener) {
        if (!type) events = {}
        const list = events[type] || empty;
        let i = func ? list.length : 0;
        while (i--) func == list[i][0] && list.splice(i, 1)
        return target
    }
    /**
     * Emit: send event, callbacks will be triggered
     */
    target.emit = function(type: string){
        const e = events[type] || empty, list = e.length > 0 ? e.slice(0, e.length) : e;
        let i = 0, j;
        while (j=list[i++]) j[0].apply(j[1], empty.slice.call(arguments, 1))
        return target
    };
}