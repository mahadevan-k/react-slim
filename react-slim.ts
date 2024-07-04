import Mustache from 'mustache'
import { v4 as uuidv4 } from 'uuid'
import { App,Volume,State,Binding,Component,DataFunction,Element,Props,Action } from './types'

export const create_app = (window:Window):App => ({window,volumes: {}})

export const get_app_element = (app:App,volume:Volume,binding:Binding):Element | null => 
    app.window.document.querySelector(`[volume_uuid="${volume.uuid}"][binding_uuid="${binding.uuid}"]`)

export const create_volume = (app:App,state:State):Volume => {
    const uuid = uuidv4()
    app.volumes[uuid] = { uuid,bindings: {},state: state,deps: {} }
    return app.volumes[uuid]
}

const get_volume = (app:App,uuid:string):Volume => app.volumes[uuid]

const get_binding = (volume:Volume,uuid:string):Binding => volume.bindings[uuid]

export const render_binding = (app:App,volume:Volume,binding:Binding):void => {
   const element = get_app_element(app,volume,binding)
   element?._render(volume,binding)
}

const create_volume_binding = (volume:Volume,slot:string,props:{},parent:Binding,element:Element,data:DataFunction) => {
    let uuid = uuidv4()
    let slots = {}
    if(parent) {
        if(slot in parent.slots) {
            uuid = parent.slots[slot]
            slots = volume.bindings[uuid]
        } else {
            parent.slots[slot]=uuid
        }
    }
    volume.bindings[uuid] = {props,parent,element,data,uuid,slots}
    return volume.bindings[uuid]
}


const get_ascendent = (volume:Volume,binding:Binding):Binding | undefined => binding.parent ? volume.bindings[binding.parent.uuid] : undefined

const should_notify = (volume:Volume,prop:string,binding:Binding):boolean => {
    if(prop in volume.deps) {
        let ascendent = get_ascendent(volume,binding)

        while(ascendent) {
            if(ascendent.uuid in volume.deps[prop])
                return false
            ascendent = get_ascendent(volume,ascendent)
        }
    }

    return true
}

const add_dep = (volume:Volume,prop:string,binding:Binding):Set<string> => volume.deps[prop] ? 
    volume.deps[prop].add(binding.uuid) : volume.deps[prop]=new Set([binding.uuid])

const resolve_dep = (volume:Volume,prop:string,binding:Binding):void => { 
    if(should_notify(volume,prop,binding))
        add_dep(volume,prop,binding)
}

const resolve_deps = (volume:Volume,props:string[],binding:Binding) => {
    props.forEach((prop) => resolve_dep(volume,prop,binding))
}


const render_deps = (app:App,volume:Volume,props:string[]) => {
    props.forEach((prop:string) => {
        if(prop in volume.deps) {
            volume.deps[prop].forEach((binding_uuid) => {
                const binding = volume.bindings[binding_uuid]
                render_binding(app,volume,binding)
            })
        }
    })
}

export const create_binding = (volume:Volume,component_data:Component,slot:string,props:string[],parent:Binding) => {
    const { element,data,props: dep_props } = component_data

    const binding = create_volume_binding(volume,slot,props,parent,element,data)

    resolve_deps(volume,dep_props,binding)

    return binding
}

export const dispatch = async (app:App,volume:Volume,action_data:Action,...args:any[]) => {
    const { action,props } = action_data
    await action(volume.state,...args)
    render_deps(app,volume,props)
}

export const create_element = (app:App,tag_name:string,template:string) => {
  Mustache.parse(template)  
  class DynamicComponent<CustomElementConstructor> extends app.window.HTMLElement {
    constructor() {
      super()

    }

    connectedCallback():void {
      const volume = get_volume(app,this.getAttribute('volume_uuid'))
      const binding = get_binding(volume,this.getAttribute('binding_uuid'))

      this._render(volume,binding)
    }

    _render(volume:Volume,binding:Binding):void {
      try {
        const rendered = Mustache.render(template,binding.data(volume,binding))
        this.innerHTML = rendered
      } catch (e) {
        console.error('Error rendering component:',e)
        this.innerHTML = '<p>Error rendering component</p>'
      }
    }
  }

  app.window.customElements.define(tag_name,DynamicComponent)
}
