/* React-slim example app
 *
 * This file demonstrates how react-slim can be used to create applications.
 *
 * This is a simple app that simply tracks two counters, modifies them and updates the UI
 */


/* 
 * We need just these 6 methods to build large, scalable applications
 */
import { create_app, create_volume, create_element, create_binding, dispatch, action } from './dist/react-slim.js';

/* 
 * First, let's create an app
 *
 * Apps connect the visual interface to react-slim.
 *
 * In this case we assign a JSDOM window to the app to simulate a web browser
 *
 * In most cases you could just pass window as an argument to initialize an app
 *
 * You can create as many apps as you like, to modularize your application and js bundles
 */
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');
const { window } = dom
const app = create_app(window)

/*
 * Next, we create a state, which should always be an object
 *
 * The state works exactly like a react-state, only top-level objects of the state can be used for propagating changes to components
 */ 
const state = {
    n1: 1,
    n2: 2
}

/*
 * Then, we create a volume and attach it to the state
 *
 * Volumes bring an entire app together, but for now it simply associates an app with a state
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
    action: async (state) => {
        state.n1=state.n1+1;
    },
    props: ['n1']
}

/*
 * Here's another to increment n2
 */
const increment_n2 = {
    action: async (state) => {
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
    action: async (state,value) => {
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
 * props - the keys in the state that the component subscribes to, i.e. the keys that
 * should trigger a re-render of the component
 *
 * The create_element function, takes an app, a tag name for the element, 
 * and a mustache template containing a html template which renders the component
 *
 * The props argument determines which property updates trigger a re-render.
 * This is again manual but avoids unexpected results from automation
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
 * And our second component, which is turned into a binding on-the-fly, and demonstrates binding heirarchy
 *
 * Bindings 
 *
 * To bind our component, we provide
 *
 * 1. The volume to add the component to
 * 2. The component 
 * 
 * But if we create a binding inside another binding, we'll need a unique slot name and the parent binding as well
 *
 * This is shown in the `n2compb` initialization inside the data function
 *
 * Note that the data function can return functions as well which can be used to attach event handlers etc.
 *
 * Also note that when using a child component tag, you need to pass the volume_uuid and binding_uuid as props to the tag,
 * this can be obtained in the data function by creating the binding and then using it's uuid as shown below
 *
 * When reading this code, compare it to the simple component above to understand what is going on
 */

const n1compb = create_binding(volume,{
    element: create_element(app,'n1-comp',
        '<n2-comp volume_uuid="{{n2comp.volume_uuid}}" binding_uuid="{{n2comp.binding_uuid}}"></n2-comp><h1>N1 is {{n1}}</h1>'),
    data: (volume,binding) => {
        const n2compb = create_binding(volume,n2comp,'n2comp',binding)
        return { n2comp: {volume_uuid: volume.uuid, binding_uuid: n2compb.uuid}, n1: volume.state.n1 }
    },
    props: ['n1']
});


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

// increment n1 and print dom
console.log("INCREMENT N1")
await dispatch(app,volume,action(increment_n1))
console.log(dom.serialize())
// chain some increments
console.log("CHAIN INCREMENT N1 3 times")
await dispatch(app,volume,action(increment_n1),action(increment_n1),action(increment_n1))
console.log(dom.serialize())
console.log("ADD TO N1")
await dispatch(app,volume,action(add_to_n1,5))
console.log(volume)

/*
 * The end, my friend
 */
