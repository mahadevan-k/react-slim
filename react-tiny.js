export const create_volume = () => ({ bindings: {}, states: {}, deps: {}, slots: {}})

export const create_state = (volume,obj) => {
    const uuid = crypto.randomUUID()
    volume.states[uuid] = {...obj,uuid}
    return volume.states[uuid]
}

const get_binding = (volume,uuid) => volume.bindings[uuid]

export const render_binding = (volume,binding) => binding.render(volume,binding)

const get_state = (volume,uuid) => volume.states[uuid]

const create_volume_binding = (volume,slot,state,props,parent,render) => {
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
    volume.bindings[uuid] = {state,props,parent,render,uuid,slots}
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

export const create_binding = (volume,component_data,slot,props,parent) => {
    const { render, props: dep_props } = component_data

    const binding = create_volume_binding(volume,slot,component_data.state,props,parent,render)

    resolve_deps(volume,dep_props,binding)

    return binding
}

export const dispatch = (volume,action_data,state,...args) => {
    const { action, props } = action_data
    action(state,...args)
    render_deps(volume,props)
}


