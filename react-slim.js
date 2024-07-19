import Mustache from 'mustache'
import { v4 as uuidv4 } from 'uuid'

export const create_app = (window) => ({window,volumes: []})

const get_app_element = (app,volume,binding) => 
    app.window.document.querySelector(`[volume_uuid="${volume.uuid}"][binding_uuid="${binding.uuid}"]`)

const get_element_attrs = (element) => {
      const attrs = {}
      Array.from(element.attributes).forEach(({name,value}) => {
        if(name!="binding_uuid" && name!="volume_uuid")
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

const render_binding = (app,volume,binding) => {
   const element = get_app_element(app,volume,binding)

   element._render(volume,binding,get_element_attrs(element))
}

const create_volume_binding = (volume,slot,props,parent,element,data) => {
    let uuid = uuidv4()
    let slots = {}
    if(parent) {
        if(slot in parent.slots) {
            uuid = parent.slots[slot]
            slots = volume.bindings[uuid].slots
        } else {
            parent.slots[slot]=uuid
        }
    }
    volume.bindings[uuid] = {props,parent,element,data,uuid,slots}
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

export const create_binding = (volume,component_data,slot,parent,props) => {
    const { element,data,props: dep_props } = component_data

    const binding = create_volume_binding(volume,slot,props,parent,element,data)

    resolve_deps(volume,dep_props,binding)

    return binding
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

export const create_element = (app,tag_name,template) => {
  Mustache.parse(template)  
  class DynamicComponent extends app.window.HTMLElement {
    constructor() {
      super()
    }

    connectedCallback() {
      const volume = get_volume(app,this.getAttribute('volume_uuid'))
      const binding = get_binding(volume,this.getAttribute('binding_uuid'))
      this._render(volume,binding,get_element_attrs(this))
    }

    _render(volume,binding,attrs) {
      try {
        const rendered = Mustache.render(template,{...binding.data(volume,binding),...attrs})
        this.innerHTML = rendered
      } catch (e) {
        console.error('Error rendering component:',e)
        this.innerHTML = '<p>Error rendering component</p>'
      }
    }
  }

  app.window.customElements.define(tag_name,DynamicComponent)
  return tag_name
}
