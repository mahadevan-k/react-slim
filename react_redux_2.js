const create_volume = () => ({ bindings: {}, states: {}, deps: {}, slots: {}})

const create_state = (volume,obj) => {
    const uuid = crypto.randomUUID()
    volume.states[uuid] = {...obj,uuid}
    return volume.states[uuid]
}

const get_binding = (volume,uuid) => volume.bindings[uuid]

const render_binding = (volume,binding) => binding.renderer(volume,binding)

const get_state = (volume,uuid) => volume.states[uuid]

const create_binding = (volume,slot,state,props,parent,renderer) => {
    console.log("Parent slots: ", parent && parent.slots);
    let uuid = crypto.randomUUID();
    let slots = {}
    if(parent) {
        if(slot in parent.slots) {
            uuid = parent.slots[slot]
            slots = volume.bindings[uuid]
        } else {
            parent.slots[slot]=uuid
        }
    }
    volume.bindings[uuid] = {state,props,parent,renderer,uuid,slots}
    return volume.bindings[uuid]
}


const get_ascendent = (volume,binding) => binding.parent ? volume.bindings[binding.parent.uuid] : undefined

const should_notify = (volume, prop, binding) => {
    if(prop in volume.deps) {
        let ascendent = get_ascendent(volume, binding)

        while(ascendent) {
            if(ascendent.uuid in volume.deps[prop])
                return false
            ascendent = get_ascendent(volume,ascendent)
        }
    }

    return true
}

const add_dep = (volume,prop,binding) => volume.deps[prop] ? 
    volume.deps[prop].add(binding.uuid) : volume.deps[prop]=new Set([binding.uuid])

const resolve_dep = (volume,prop,binding) => { 
    if(should_notify(volume,prop,binding))
        add_dep(volume,prop,binding)
}

const resolve_deps = (volume,props,binding) => {
    props.forEach((prop) => resolve_dep(volume,prop,binding))
}


const render_deps = (volume,props) => {
    props.forEach((prop) => {
        if(prop in volume.deps) {
            volume.deps[prop].forEach((binding_uuid) => {
                const binding = volume.bindings[binding_uuid]
                render_binding(volume,binding)
            })
        }
    })
}

const create_component = (volume,component_data,slot,state,props,parent) => {
    const { renderer, props: dep_props } = component_data

    const binding = create_binding(volume,slot,state,props,parent,renderer)

    resolve_deps(volume,dep_props,binding)

    return binding
}

const dispatch = (volume,action_data,state) => {
    const { action, props } = action_data
    action(state)
    render_deps(volume,props)
}

volume = create_volume()

state = create_state(volume, {
    n1: 1,
    n2: 2
})

const increment_n1 = {
    action: (state) => {
        state.n1=state.n1+1;
    },
    props: ['n1']
}

const increment_n2 = {
    action: (state) => {
        state.n2=state.n2+1;
    },
    props: ['n2']
}


const n2comp = {
    renderer: (volume,binding) => {
        console.log("n2 is "+binding.state.n2)
    },
    props: ['n2']
}

const n1compb = create_component(volume,{
    renderer: (volume,binding) => {
        const n2compb = create_component(volume,n2comp,'n2comp',binding.state,{},binding)
        render_binding(volume,n2compb)

        console.log("n1 is ",binding.state.n1);
    },
    props: ['n1']
},'n1comp1',state,{},undefined);

console.log("INCREMENT N1")
dispatch(volume, increment_n1, state)
console.log("INCREMENT N1")
dispatch(volume, increment_n1, state)
console.log("INCREMENT N1")
dispatch(volume, increment_n1, state)
console.log("INCREMENT N2")
dispatch(volume, increment_n2, state)
console.log(volume)

