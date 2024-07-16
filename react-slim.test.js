import { mock,test } from 'node:test'
import assert from 'node:assert'
import { create_app, create_volume, create_element, create_binding, dispatch } from './react-slim.js'
import { JSDOM } from 'jsdom'


test("reactive state change propagation",async () => {
    const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');
    const { window } = dom

    const app = create_app(window)
    const state = {a: 1, b: 2}
    const volume = create_volume(app,state)
    const increase_a = {
        action: mock.fn(async (state,amount) => { state.a = state.a + amount}),
        props: ['a']
    }
    const component = {
        template: create_element(app,'a-test',"<p>{{greeting}} {{a}}</p>"), 
        data: mock.fn((volume,binding) => ({ a:volume.state.a })),
        props: ['a']
    }
    const binding = create_binding(volume,component,'',[])
    window.document.body.innerHTML=`<a-test volume_uuid="${volume.uuid}" binding_uuid="${binding.uuid}" greeting="a is"/>`
    assert.strictEqual(binding.data.mock.calls.length,1)
    const dom_element = app.window.document.querySelector(`[volume_uuid="${volume.uuid}"][binding_uuid="${binding.uuid}"]`)
    assert.strictEqual(dom_element.innerHTML,"<p>a is 1</p>");
    await dispatch(app,volume,increase_a,5)
    assert.strictEqual(dom_element.innerHTML,"<p>a is 6</p>");
    assert.strictEqual(increase_a.action.mock.calls.length,1)
    assert.strictEqual(component.data.mock.calls.length,2)
    assert.deepStrictEqual(increase_a.action.mock.calls[0].arguments,[state,5])
    assert.deepStrictEqual(component.data.mock.calls[0].arguments,[volume,binding])
    assert.deepStrictEqual(component.data.mock.calls[1].arguments,[volume,binding])
    assert.deepStrictEqual(component.data.mock.calls[0].result,{a:1})
    assert.deepStrictEqual(component.data.mock.calls[1].result,{a:6})
    mock.reset()
})

/*
const app = create_app(window)
const state = {
    n1: 1,
    n2: 2
}
const volume = create_volume(app,state)
const increment_n1 = {
    action: async (state) => {
        state.n1=state.n1+1;
    },
    props: ['n1']
}
const increment_n2 = {
    action: async (state) => {
        state.n2=state.n2+1;
    },
    props: ['n2']
}
const add_to_n1 = {
    action: async (state,value) => {
        state.n1=state.n1+value;
    },
    props: ['n1']
}
const n2comp = {
    element: create_element(app,'n2-comp','<h2>N2 is {{n2}}</h2>'),
    data: (volume,binding) => ({ n2: volume.state.n2 }),
    props: ['n2']
}
const n1compb = create_binding(volume,{
    element: create_element(app,'n1-comp',
        '<n2-comp volume_uuid="{{n2comp.volume_uuid}}" binding_uuid="{{n2comp.binding_uuid}}"></n2-comp><h1>N1 is {{n1}}</h1>'),
    data: (volume,binding) => {
        const n2compb = create_binding(volume,n2comp,'n2comp',{},binding)
        return { n2comp: {volume_uuid: volume.uuid, binding_uuid: n2compb.uuid}, n1: volume.state.n1 }
    },
    props: ['n1']
},'n1comp1',{},undefined);
window.document.body.innerHTML=`<n1-comp volume_uuid="${volume.uuid}" binding_uuid="${n1compb.uuid}"/>`
console.log(dom.serialize())
console.log("INCREMENT N1")
await dispatch(app, volume, increment_n1)
console.log(dom.serialize())
console.log("INCREMENT N1")
await dispatch(app, volume, increment_n1)
console.log("INCREMENT N1")
await dispatch(app, volume, increment_n1)
console.log("INCREMENT N2")
await dispatch(app, volume, increment_n2)
console.log(dom.serialize())
console.log("ADD TO N1")
await dispatch(app, volume, add_to_n1,5)
console.log(volume)
*/
