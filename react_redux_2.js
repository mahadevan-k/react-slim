const _bindings = {};

const create_binder = (state,props,parent,renderer) => {
    const uuid = crypto.randomUUID()
    _bindings[uuid] = {state,props,parent,renderer,uuid}
    return _bindings[uuid]
}

const get_binder = (uuid) => _bindings[uuid]

const get_ascendent = (binder) => binder.parent ? _bindings[binder.parent.uuid] : undefined

const should_notify = (prop, binder, prop_binders) => {
    if(prop in prop_binders) {
        let ascendent = get_ascendent(binder)

        while(ascendent) {
            if(asc.uuid in prop_binders)
                return false
            ascendent = get_ascendent(ascendent)
        }
    }
    
    return true
}

const add_prop_binder = (prop,binder,prop_binders) => prop_binders[prop] ? 
    {...prop_binders, [prop]: [...prop_binders[prop], binder]} : 
    { ...prop_binders, [prop]: [binder]}

const resolve_prop_binders = (prop,binder,prop_binders) => 
  should_notify(prop,binder,prop_binders) ? add_prop_binder(prop,binder,prop_binders) : prop_binders

const create_state = (state) => ({...state,_prop_binders: {}})

const add_state_binder = (binder,state,prop) => ({...state,_prop_binders:resolve_prop_binders(prop,binder,state._prop_binders)})

const add_state_binders = (binder,state,props) => {
    let return_state = {...state};
    props.forEach((prop) => {
        return_state = add_state_binder(binder,state,prop)
    })
    return return_state
}

const call_state_renderers = (state,props) => {
    props.forEach((prop) => {
        state._prop_binders[prop].forEach((binder) => {
            binder.renderer(state,props)
        })
    })
}

state = create_state({
    n1: 1,
    n2: 2
})

const increment_n1 = (state) => {
    state.n1=state.n1+1;
    call_state_renderers(state,['n1']);
}

const n2comp = () => {
    return { 
        renderer: (state) => {
            console.log("n1 is ",state.n1);
        },
        props: ['n1']
    }
}

const n2comp1= n2comp()

const n2compb = create_binder(state, {}, undefined, n2comp1.renderer)

const app_bound_state = add_state_binders(n2compb, state, n2comp1.props)

call_state_renderers(app_bound_state,n2comp1.props)

increment_n1(app_bound_state)


