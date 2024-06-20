/* react-tiny example code */

/*
 * five functions is all we need \m/
 */
import { create_volume, create_state, create_binding, render_binding, dispatch } from './react-tiny.js'

/*
 * First, create a volume, a volume is like a module, it holds a set of components, states and other info
 */
const volume = create_volume()

/*
 * Add a state to our volume, a simple state that contains two numbers,
 * should always be an javascript object
 */ 
const state = create_state(volume, {
    n1: 1,
    n2: 2
})

/*
 * Now lets define some actions - an action modifies state, and as a result, updates components
 *
 * Each action consists of an action key that holds the function that executes the action, 
 * and a props key that holds the keys of the state that are modified by the action
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
 * A component is a simple object containing three keys
 *
 * render - the function that renders the component
 * state - the state associated with the component
 * props - the keys in the state that the component uses, i.e. the keys that
 * should trigger a re-render of the component
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
    render: (volume,binding) => {
        console.log("n2 is "+binding.state.n2)
    },
    state,
    props: ['n2']
}

/*
 * And our second component, which is turned into a binding on-the-fly
 *
 * One thing to note about this component is that it creates a sub-component within its render function.
 * When we do this, its important to give a unique slot name to the sub-component, so that we don't create duplicate
 * sub-components on re-renders. The slot name only needs to be unique among the sub-components in the render function,
 * so don't worry about the slot name being globally unique.
 *
 * To bind our component, we provide
 *
 * 1. The volume to add the component to
 * 2. The component itself (an object with render,state and prop keys)
 * 3. the slot name we spoke about, only important for the sub-component
 * 4. component props - not to be confused with state props, just a set of arguments for the component to 
 * render, not connected to the state and does not trigger re-renders
 * 5. the parent binding, which is always the binding associated with our component, sent as a
 * parameter to the render function
 */

create_binding(volume,{
    render: (volume,binding) => {
        const n2compb = create_binding(volume,n2comp,'n2comp',{},binding)
        render_binding(volume,n2compb)

        console.log("n1 is "+binding.state.n1);
    },
    state,
    props: ['n1']
},'n1comp1',{},undefined);

/*
 * ...and that's it, we're all setup and ready to go
 *
 * To test our components, we'll dispatch some actions below
 *
 * Note that the library will appropriately update only components which are dependent on the props
 * modified by the actions
 */

console.log("INCREMENT N1")
dispatch(volume, increment_n1, state)
console.log("INCREMENT N1")
dispatch(volume, increment_n1, state)
console.log("INCREMENT N1")
dispatch(volume, increment_n1, state)
console.log("INCREMENT N2")
dispatch(volume, increment_n2, state)
console.log("ADD TO N1")
dispatch(volume, add_to_n1, state,5)

/*
 * The end, my friend
 */
