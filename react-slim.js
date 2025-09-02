let Mustache;

const __react_slim_apps = {};

if (typeof window === 'undefined') {
  // Node environment
  Mustache = await import(/* webpackIgnore: true */'mustache');
  // If you want just the default export:
  Mustache = Mustache.default || Mustache;
} else {
  // Browser environment, expect global Mustache from CDN
  Mustache = window.Mustache;
}

function uuidv4(length = 2) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let uuid = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    uuid += chars[randomIndex];
  }
  return uuid;
}

export const create_app = (window) => {
  const uuid = uuidv4()
  __react_slim_apps[uuid] = {uuid,window,volumes: []}
  return __react_slim_apps[uuid]
}

const get_app = (uuid) => (__react_slim_apps[uuid])

const get_app_element = (app,volume,binding) => 
    app.window.document.querySelector(`[data-rsl="${app.uuid}${volume.uuid}${binding.uuid}"]`)

const get_element_attrs = (element) => {
      const attrs = {}
      Array.from(element.attributes).forEach(({name,value}) => {
        if(name!="data-rsl")
          attrs[name]=value
      })
      return attrs
}

export const create_volume = (app,state) => {
    const uuid = uuidv4()
    app.volumes[uuid] = { uuid,bindings: {},state: state,deps: {} }
    return app.volumes[uuid]
}

const get_volume = (app,uuid) => app.volumes[uuid]

const get_binding = (volume,uuid) => volume.bindings[uuid]

const get_locator = (app,volume,binding) => (`${app.uuid}${volume.uuid}${binding.uuid}`)

const resolve_locator = (rsl) => {
  const app = get_app(rsl.substring(0,2))
  const volume = get_volume(app,rsl.substring(2,4))
  const binding = get_binding(volume,rsl.substring(4,6))
  return {app,volume,binding}
}

const render_binding = (app,volume,binding) => {
   const rsl = get_locator(app,volume,binding)
   const element = get_app_element(app,volume,binding)
   if(element==null) ReferenceError(`Element for binding(rsl=${rsl}) not found, you might have missed specifying the 'data-rsl' attribute or your element may not have rendered due to some issues`)

   element._render(volume,binding,get_element_attrs(element))
}

const create_volume_binding = (volume,slot,props,parent,element,data,behaviors,slot_guard) => {
    let uuid = uuidv4()
    let slots = {}
    if(parent) {
        if(slot in parent.slots) {
            uuid = parent.slots[slot]
            if(uuid in volume.bindings) {
              if(volume.bindings[uuid].slot_guard==slot_guard)
                throw new TypeError(`you seem to be mapping multiple bindings to the slot '${slot}'. Ensure that each slot within a binding are mapped to a unique binding.`);
              slots = volume.bindings[uuid].slots
            }
        } else {
            parent.slots[slot]=uuid
        }
    }
    volume.bindings[uuid] = {props,parent,element,data,uuid,slots,behaviors,slot_guard}
    return volume.bindings[uuid]
}


const get_ascendent = (volume,binding) => binding && binding.parent ? volume.bindings[binding.parent.uuid] : undefined

const is_ascendent_in_set = (volume,set,binding) => {
    let ascendent = get_ascendent(volume,binding)
    while(ascendent) {
        if(set.has(ascendent.uuid)) 
            return true
        ascendent = get_ascendent(volume,ascendent)
    }
    return false
}

const should_notify = (volume,prop,binding) => {
    if(prop in volume.deps) {
        if(is_ascendent_in_set(volume,volume.deps[prop],binding))
            return false
    }

    return true
}

const add_dep = (volume,prop,binding) => prop in volume.deps ?
        volume.deps[prop].add(binding.uuid) : volume.deps[prop]=new Set([binding.uuid])

const resolve_dep = (volume,prop,binding) => { 
    if(should_notify(volume,prop,binding))
        add_dep(volume,prop,binding)
}

const resolve_deps = (volume,props,binding) => {
    props.forEach((prop) => resolve_dep(volume,prop,binding))
}


const render_deps = (app,volume,props) => {
    const rerenders=new Set([])
    props.forEach((prop) => {
        if(prop in volume.deps) {
            volume.deps[prop].forEach((binding_uuid) => {
                rerenders.add(binding_uuid)
            })
        }
    })

    const final_renders = Array.from(rerenders).filter((binding_uuid) => !is_ascendent_in_set(volume,rerenders, get_binding(volume,binding_uuid)))

    final_renders.forEach((binding_uuid) => { render_binding(app,volume,get_binding(volume,binding_uuid)) })
}

export const create_binding = (app,volume,component_data,slot,parent,slot_guard,props) => {
    const { element,data,props: dep_props } = component_data
    const behaviors = component_data["behaviors"]
    if(slot && !slot_guard)
      throw new ReferenceError("slot is present but slot_guard is not, ensure you receive it and pass it on in your data function")

    const binding = create_volume_binding(volume,slot,props,parent,element,data,behaviors,slot_guard)
    resolve_deps(volume,dep_props,binding)

    return get_locator(app,volume,binding)
}

const action_caller = (fn,...args) => async (volume) => await fn(volume.state,...args)

export const action = (action_data,...args) => {
    const { action,props } = action_data
    return { call: action_caller(action,...args), props }
}

export const dispatch = async (app,volume,...actions) => {
    const render_props = new Set([])
    actions.forEach((action) => {
        action.call(volume)
        action.props.forEach((prop) => render_props.add(prop))
    })
    render_deps(app,volume,render_props)
}

export const execute_behavior = async (element,fn, ...args) => {
  let currentNode=element
  while(currentNode) {
    const rsl = currentNode.getAttribute('data-rsl')
    if(!rsl) {
      currentNode = currentNode.parentNode
    } else {
      const { app,volume,binding } = resolve_locator(rsl)
      const behaviors = binding.behaviors(volume,binding)
      if(!(fn in behaviors))
        throw new ReferenceError(`The behavior ${fn} is not present in binding(rsl='${rsl}')`);
      behaviors[fn](...args)
      return
    }
  }
  throw new ReferenceError(`Couldn't execute behavior ${fn} because there was no element with the 'data-rsl' attribute in the element heirarchy`)
}

export const create_element = (app,tag_name,template) => {
  Mustache.parse(template)  
  class DynamicComponent extends app.window.HTMLElement {
    constructor() {
      super()
    }

    connectedCallback() {
      const rsl = this.getAttribute('data-rsl')
      const {app,volume,binding} = resolve_locator(rsl)
      this._render(volume,binding,get_element_attrs(this))
    }

    _render(volume,binding,attrs) {
      try {
        this.innerHTML = Mustache.render(template,{...binding.data(volume,binding,uuidv4(6)),...attrs});

      } catch (e) {
        console.error('Error rendering component:',e)
        this.innerHTML = '<p>Error rendering component</p>'
      }
    }
  }

  app.window.customElements.define(tag_name,DynamicComponent)
  return tag_name
}
