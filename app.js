import { create_volume, create_state, create_binding, render_binding, dispatch } from './react-tiny.js'

const volume = create_volume()

const state = create_state(volume, {
    n1: 1,
    n2: 2
})

const increment_n1 = {
    action: (state) => {
        state.n1=state.n1+1;
    },
    props: ['n1']
}

const increment_n2 = {
    action: (state) => {
        state.n2=state.n2+1;
    },
    props: ['n2']
}

const add_to_n1 = {
    action: (state,value) => {
        state.n1=state.n1+value;
    },
    props: ['n1']
}




const n2comp = {
    render: (volume,binding) => {
        console.log("n2 is "+binding.state.n2)
    },
    state,
    props: ['n2']
}

const n1compb = create_binding(volume,{
    render: (volume,binding) => {
        const n2compb = create_binding(volume,n2comp,'n2comp',{},binding)
        render_binding(volume,n2compb)

        console.log("n1 is "+binding.state.n1);
    },
    state,
    props: ['n1']
},'n1comp1',{},undefined);

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

