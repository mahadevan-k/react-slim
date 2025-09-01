/* React-slim example app
 *
 * This file demonstrates how react-slim can be used to create applications.
 *
 * This is a simple app that simply tracks two counters, modifies them and updates the UI
 */


/* 
 * We need just these 7 methods to build large, scalable applications
 */
import { create_app, create_volume, create_element, create_binding, dispatch, action, execute_behavior } from './dist/react-slim.js';

/* 
 * APP
 *
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

console.log(app)

/*
 * STATE
 *
 * Next, we create a state, which should always be an object
 *
 * The state works exactly like a react-state, only top-level objects of the state can be used for propagating changes to components
 */ 
const state = {
    n1: 1,
    n2: 2
}

/*
 * VOLUME
 *
 * Then, we create a volume and attach it to the state
 *
 * Volumes brings the entire interface together, but for now it simply associates an app with a state
 */
const volume = create_volume(app,state)

/*
 * ACTIONS
 *
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
 * COMPONENTS
 *
 * Time to build components and bindings
 *
 * A component is a simple javascript object containing four keys
 *
 * element - a html custom element created with the create_element function(explained below)
 * data - function that returns all data required for rendering the component template
 * behaviors - an optional function that returns all event handlers used by the component
 * props - the top-level keys in the state that the component subscribes to, i.e. the keys that
 * should trigger a re-render of the component if the keys change
 *
 * The create_element function, takes an app, a globally-unique tag name for the element, 
 * and a mustache template containing a html template which renders the component
 *
 * The props argument determines which property updates trigger a re-render.
 * This is again manual but avoids unexpected results from automation
 *
 * BEHAVIORS
 *
 * Behaviors are event handlers defined within the component which can be triggered from event attributes 
 * in elements.
 *
 * The behavior demonstrated here is a non-functioning example since we're using JSDOM
 * but it has been tested on a browser
 *
 * The first thing to notice is the behavior invocation via the 'onclick' attribute on the 'h2' element
 *
 * The 'execute_behavior' function used to call the event handler has the following arguments
 *
 * this - the HTML element from which the event is being triggered
 * handler - a string containing the method name used in the component behaviors 
 * handler arguments - the remaining arguments are arguments passed to the handler function
 *   this - in case you need access to the element in your handler, simply pass this again as an argument
 *          to the handler as shown
 *   event - the event javascript object 
 *   {{n2}} - other arguments to the handler, in our case we want to multiply n2 by n2 - note the use 
 *            of the mustache template to provide the value of n2 as an argument here
 *
 * The handler itself is defined and returned as part of the behaviors function 
 *
 * In our case we create an action and an associated handler within the behaviors function
 *
 * You are of course, free to do as you like - you can define the action globally if thats what you need.
 */

/*
 * Here is our first component
 */
const n2comp = {
    element: create_element(app,'n2-comp',`<h2 onclick="execute_behavior(this,'multiply_handler',this,event,{{n2}})">N2 is {{n2}}</h2>`),
    data: (volume,binding) => ({ n2: volume.state.n2 }),
    behaviors: (volume,binding) => {
      const multiply_action = {
        action: async (state,element,event,value) => {
          state.n2=state.n2*value
        },
        props: ['n2']
      }

      return {
        multiply_handler: async function(element,event,value) { 
          await dispatch(app,volume,action(multiply_action,element,event,value)) 
        }
      }
    },
    props: ['n2']
}

/*
 * And our second component, which is turned into a binding on-the-fly, and demonstrates binding heirarchy
 *
 * Bindings 
 *
 * To bind our component, we provide
 *
 * 1. The app
 * 2. The volume to add the component to
 * 3. The component 
 * 
 * But if we create a child binding inside a parent binding, 
 * we'll need a unique(within the parent component) slot name and the parent binding as well
 *
 * This is shown in the `n2compb` initialization inside the data function
 *
 * In order to render the `n2compb` binding, we simply create the element with the tag corresponding to the
 * 'n2compb' component, which in our case is 'n2-comp'
 *
 * To associate the element with the binding, we pass a 'data-rsl' attribute and set it to the n2compb variable
 * which contains a unique key that associates the binding to the element
 *
 * When reading this code, compare it to the simple component 'n2comp' above to understand what is going on
 */

const n1compb = create_binding(app,volume,{
    element: create_element(app,'n1-comp',
      '<n2-comp data-rsl="{{n2compb}}"/><h1>N1 is {{n1}}</h1>'),
    data: (volume,binding,slot_guard) => {
        const n2compb = create_binding(app,volume,n2comp,'n2comp',binding,slot_guard)
        return { n2compb, n1: volume.state.n1 }
    },
    props: ['n1']
});


/* 
 * Attach the top level component to our web page, simply by adding the component tag with the rsl of its binding
 */
window.document.body.innerHTML=`<n1-comp data-rsl="${n1compb}"/>`
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
