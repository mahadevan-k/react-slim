/* react-tiny example app - tutorial */

/* the following 6 methods is all we need */
import { create_app, create_volume, create_element, create_binding, dispatch } from './react-slim.js'
import { JSDOM } from 'jsdom';

/* ONLY FOR DEMO: setup JSDOM with dom for testing without browser (not required in a real app) */
const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');
const { window } = dom

/* 
 * First, we create an app
 *
 * An app is the top-level object in the react-tiny system, all functionality works within the context of an app
 *
 * You can have as many apps as you want in your project to keep your code modular
 *
 * I plan to use the app object to break huge applications up into sets of single-page applications
 */
const app = create_app(window)

/*
 * Then we create a state, which should always be an object
 *
 * Here we create a simple state that contains two numbers,
 */ 
const state = {
    n1: 1,
    n2: 2
}

/*
 * Then, we crate a volume.
 *
 * A volume connects components to a state and handles re-rendering components on state changes
 *
 * You can create as many volumes as you want, but remember that state-changes and re-rendering only work
 * within a volume and not across volumes
 *
 * A paginated todo-list with all its CRUD operations is a good example I can think of, for a single volume 
 */
const volume = create_volume(app,state)

/*
 * Now lets define some actions - an action modifies state, and as a result, updates components
 *
 * Each action is a simple object that consists of 
 *
 *   - an action key that holds the function that executes the action, 
 *   - a props key that holds the keys of the state that are modified by the action
 * 
 * The props you declare are the ones that will trigger associated components to render, 
 * its manual and its upto you define it correctly, but this also means there is no magic and 
 * unexpected side-effects of doing this automatically
 */

/*
 * Here's our first action to increment n1 from our state
 */
const increment_n1 = {
    action: (state) => {
        state.n1=state.n1+1;
    },
    props: ['n1']
}

/*
 * Here's another to increment n2
 */
const increment_n2 = {
    action: (state) => {
        state.n2=state.n2+1;
    },
    props: ['n2']
}

/*
 * And one last action - to add an arbitrary value to n1
 *
 * I added this demonstrate use of additional arguments in actions
 */
const add_to_n1 = {
    action: (state,value) => {
        state.n1=state.n1+value;
    },
    props: ['n1']
}


/*
 * Time to build components and bindings
 *
 * A component is a simple object containing four keys
 *
 * element - a html custom element created with the create_element function(explained below)
 * data - function that returns all data required for rendering the component template
 * state - the state associated with the component
 * props - the keys in the state that the component uses, i.e. the keys that
 * should trigger a re-render of the component
 *
 * The create_element function, takes an app, a tag name for the element, 
 * and a mustache template containing a html template which renders the component
 *
 * The props argument determines which property updates trigger a re-render.
 * This is again manual but avoids unexpected results from automation
 *
 * So what's a binding then? Its a component associated with a bunch of things,
 * which helps the library do what it does, like creating and removing components during renders
 * and rendering components when the state changes
 */


/*
 * Here is our first component(not binding)
 */
const n2comp = {
    element: create_element(app,'n2-comp','<h2>N2 is {{n2}}</h2>'),
    data: (volume,binding) => ({ n2: volume.state.n2 }),
    props: ['n2']
}

/*
 * And our second component, which is turned into a binding on-the-fly
 *
 * One thing to note about this component is that it creates a sub-component. When we do this, its important to give
 * a unique slot name to the sub-component, so that we don't create duplicate sub-components on re-renders. The slot 
 * name only needs to be unique among the sub-components in the render function, so don't worry about the slot name 
 * being globally unique.
 *
 * To bind our component, we provide
 *
 * 1. The volume to add the component to
 * 2. The component 
 * 3. The data function that resolves the data to be passed to the component template
 * 4. the slot name we spoke about, only important for the sub-component
 * 5. component props - not to be confused with state props, just a set of arguments for the component to 
 * render, not connected to the state and does not trigger re-renders
 * 6. the parent binding, which is always the binding associated with our component, sent as a
 * parameter to the data function
 *
 * Note that the data function can return functions as well which can be used to attach event handlers etc.
 *
 * Also note that when using a component tag, you need to pass the volume_uuid and binding_uuid as props to the tag,
 * this can be obtained in the data function by creating the binding and then using it's uuid as shown below
 *
 * When reading this code, compare it to the simple component above to understand what is going on
 */

const n1compb = create_binding(volume,{
    element: create_element(app,'n1-comp',
        '<n2-comp volume_uuid="{{n2comp.volume_uuid}}" binding_uuid="{{n2comp.binding_uuid}}"></n2-comp><h1>N1 is {{n1}}</h1>'),
    data: (volume,binding) => {
        const n2compb = create_binding(volume,n2comp,'n2comp',{},binding)
        return { n2comp: {volume_uuid: volume.uuid, binding_uuid: n2compb.uuid}, n1: volume.state.n1 }
    },
    props: ['n1']
},'n1comp1',{},undefined);


/* 
 * Attach the top level component to our web page, simply by adding the component tag with volume and binding uuids
 */
window.document.body.innerHTML=`<n1-comp volume_uuid="${volume.uuid}" binding_uuid="${n1compb.uuid}"/>`
console.log(dom.serialize())

/*
 * ...and that's it, we're all setup and ready to go
 *
 * To test our components, we'll dispatch some actions below and display the changes to the dom tree
 *
 * Note that the library will appropriately update only components which are dependent on the props
 * modified by the actions
 */

console.log("INCREMENT N1")
dispatch(app, volume, increment_n1)
console.log(dom.serialize())
console.log("INCREMENT N1")
dispatch(app, volume, increment_n1)
console.log("INCREMENT N1")
dispatch(app, volume, increment_n1)
console.log("INCREMENT N2")
dispatch(app, volume, increment_n2)
console.log(dom.serialize())
console.log("ADD TO N1")
dispatch(app, volume, add_to_n1,5)
console.log(volume)

/*
 * The end, my friend
 */
