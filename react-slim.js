import Mustache from 'mustache';
import { v4 as uuidv4 } from 'uuid';

export const create_app = (window) => ({window, volumes: []})

export const get_app_element = (app,volume,binding) => 
    app.window.document.querySelector(`[volume_uuid="${volume.uuid}"][binding_uuid="${binding.uuid}"]`);

export const create_volume = (app) => {
    const uuid = uuidv4()
    app.volumes[uuid] = { uuid, bindings: {}, states: {}, deps: {} }
    return app.volumes[uuid];
}

const get_volume = (app,uuid) => app.volumes[uuid]

export const create_state = (volume,obj) => { const uuid = uuidv4()
    volume.states[uuid] = {...obj,uuid}
    return volume.states[uuid]
}


const get_binding = (volume,uuid) => volume.bindings[uuid]

export const render_binding = (app,volume,binding) => {
   const element = get_app_element(app,volume,binding)
   element._render(volume,binding)
}

const get_state = (volume,uuid) => volume.states[uuid]

const create_volume_binding = (volume,slot,state,props,parent,element,data) => {
    let uuid = uuidv4();
    let slots = {}
    if(parent) {
        if(slot in parent.slots) {
            uuid = parent.slots[slot]
            slots = volume.bindings[uuid]
        } else {
            parent.slots[slot]=uuid
        }
    }
    volume.bindings[uuid] = {state,props,parent,element,data,uuid,slots}
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


const render_deps = (app,volume,props) => {
    props.forEach((prop) => {
        if(prop in volume.deps) {
            volume.deps[prop].forEach((binding_uuid) => {
                const binding = volume.bindings[binding_uuid]
                render_binding(app,volume,binding)
            })
        }
    })
}

export const create_binding = (volume,component_data,slot,props,parent) => {
    const { element, data, state, props: dep_props } = component_data

    const binding = create_volume_binding(volume,slot,state,props,parent,element,data)

    resolve_deps(volume,dep_props,binding)

    return binding
}

export const dispatch = (app,volume,action_data,state,...args) => {
    const { action, props } = action_data
    action(state,...args)
    render_deps(app,volume,props)
}

export const create_element = (app, tag_name, template) => {
  class DynamicComponent extends app.window.HTMLElement {
    constructor() {
      super();

    }

    connectedCallback() {
      const volume = get_volume(app, this.getAttribute('volume_uuid'))
      const binding = get_binding(volume, this.getAttribute('binding_uuid'))

      this._render(volume,binding)
    }

    _render(volume,binding) {
      try {
        const rendered = Mustache.render(template, binding.data(volume,binding));
        this.innerHTML = rendered
      } catch (e) {
        console.error('Error rendering component:', e);
        this.innerHTML = '<p>Error rendering component</p>';
      }
    }
  }

  app.window.customElements.define(tag_name, DynamicComponent);
}