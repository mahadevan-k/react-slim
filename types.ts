export interface App {
    window:Window,
    volumes:{[id:string]:Volume}
}

export interface Volume {
    uuid:string,
    bindings: {[id:string]: Binding},
    state: State
    deps: {[id:string]:Set<string>}
}

export interface State {[id:string]:any}

export type DataFunction =  (volume:Volume,binding:Binding) => {}

export interface Slots {[id:string]:string}

export interface Props {[id:string]:any}

export interface Binding {
    uuid: string,
    props: Props,
    parent: Binding,
    element: Element,
    data: DataFunction,
    slots: Slots
}

export interface Component {
    element: Element,
    data: (volume:Volume,binding:Binding) => {},
    props: string[]
}

export interface Element extends HTMLElement {
    _render: (volume:Volume,binding:Binding) => void
}

export interface Action {
    action: (state:State,...args:any[]) => Promise<void>,
    props: string[]
}
