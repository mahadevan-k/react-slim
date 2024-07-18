import { mock,test } from 'node:test'
import assert from 'node:assert'
import { create_app, create_volume, create_element, create_binding, dispatch } from './react-slim.js'
import { JSDOM } from 'jsdom'

await test("happy flow and sanity", async () => {
    /*
     * Tests the basic flow of the library
     *
     * - check that data is being fetched when component is created
     * - check that HTML rendered contains correct value from state
     * - check that action triggers component re-render
     * - check that action parameters are passed to the action method
     * - check that element attributes are propagated to the element rendering
     * - check that all calls are happening with correct arguments and results
     */
    const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>');
    const { window } = dom

    const app = create_app(window)
    const state = {a: 1, b: 2}
    const volume = create_volume(app,state)
    const increase_a = {
        action: mock.fn(async (state,amount) => { state.a = state.a + amount}),
        props: ['a']
    }
    const component = {
        element: create_element(app,'a-test',"<p>{{greeting}} {{a}}</p>"), 
        data: mock.fn((volume,binding) => ({ a:volume.state.a })),
        props: ['a']
    }
    const binding = create_binding(volume,component)
    window.document.body.innerHTML=`<a-test volume_uuid="${volume.uuid}" binding_uuid="${binding.uuid}" greeting="a is"/>`
    const dom_element = app.window.document.querySelector(`[volume_uuid="${volume.uuid}"][binding_uuid="${binding.uuid}"]`)
    assert.strictEqual(dom_element.innerHTML,"<p>a is 1</p>");
    assert.strictEqual(component.data.mock.calls.length,1)
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


await test("hierarchial component re-renders", async () => {
    // Check that if a component higher in heirarchy is being re-rendered, the descendents are not re-rendered again
    const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');
    const { window } = dom

    const app = create_app(window)
    const state = {a: 1, b: 2}
    const volume = create_volume(app,state)
    let bbottom = undefined
    const increase_a = {
        action: mock.fn(async (state,amount) => { state.a = state.a + amount}),
        props: ['a']
    }
    const cbottom = {
        element: create_element(app,'c-bottom',"<p>{{greeting}} {{a}}</p>"), 
        data: mock.fn((volume,binding) => ({ a:volume.state.a })),
        props: ['a']
    }
    const cmiddle = {
        element: create_element(app,'c-middle','<c-bottom volume_uuid="{{bbottom.volume}}" binding_uuid="{{bbottom.binding}}" greeting="a is"></c-bottom>'), 
        data: mock.fn((volume,binding) => { 
            bbottom = create_binding(volume,cbottom,'b-bottom',binding)
            return { a:volume.state.a,bbottom: { volume: volume.uuid, binding: bbottom.uuid } }
        }),
        props: ['a']
    }
    const ctop = {
        element: create_element(app,'c-top','<c-middle volume_uuid="{{bmiddle.volume}}" binding_uuid="{{bmiddle.binding}}"></c-middle>'), 
        data: mock.fn((volume,binding) => { 
            const bmiddle = create_binding(volume,cmiddle,'b-middle',binding)
            return { a:volume.state.a,bmiddle: { volume: volume.uuid, binding: bmiddle.uuid } }
        }),
        props: ['a']
    }
    const btop = create_binding(volume,ctop)
    window.document.body.innerHTML=`<c-top volume_uuid="${volume.uuid}" binding_uuid="${btop.uuid}"></c-top>`
    assert.strictEqual(ctop.data.mock.calls.length,1)
    assert.strictEqual(cmiddle.data.mock.calls.length,1)
    assert.strictEqual(cbottom.data.mock.calls.length,1)
    await dispatch(app,volume,increase_a,6)
    assert.strictEqual(ctop.data.mock.calls.length,2)
    assert.strictEqual(cmiddle.data.mock.calls.length,2)
    assert.strictEqual(cbottom.data.mock.calls.length,2)
})

await test("hierarchial component re-renders", async () => {
    // Check that if a component higher in heirarchy is being re-rendered, the descendents are not re-rendered again
    const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');
    const { window } = dom

    const app = create_app(window)
    const state = {a: 1, b: 2}
    const volume = create_volume(app,state)
    let bbottom = undefined
    const increase_a = {
        action: mock.fn(async (state,amount) => { state.a = state.a + amount}),
        props: ['a']
    }
    const cbottom = {
        element: create_element(app,'c-bottom',"<p>{{greeting}} {{a}}</p>"), 
        data: mock.fn((volume,binding) => ({ a:volume.state.a })),
        props: ['a']
    }
    const cmiddle = {
        element: create_element(app,'c-middle','<c-bottom volume_uuid="{{bbottom.volume}}" binding_uuid="{{bbottom.binding}}" greeting="a is"></c-bottom>'), 
        data: mock.fn((volume,binding) => { 
            bbottom = create_binding(volume,cbottom,'b-bottom',binding)
            return { a:volume.state.a,bbottom: { volume: volume.uuid, binding: bbottom.uuid } }
        }),
        props: ['a']
    }
    const ctop = {
        element: create_element(app,'c-top','<c-middle volume_uuid="{{bmiddle.volume}}" binding_uuid="{{bmiddle.binding}}"></c-middle>'), 
        data: mock.fn((volume,binding) => { 
            const bmiddle = create_binding(volume,cmiddle,'b-middle',binding)
            return { a:volume.state.a,bmiddle: { volume: volume.uuid, binding: bmiddle.uuid } }
        }),
        props: ['a']
    }
    const btop = create_binding(volume,ctop)
    window.document.body.innerHTML=`<c-top volume_uuid="${volume.uuid}" binding_uuid="${btop.uuid}"></c-top>`
    assert.strictEqual(ctop.data.mock.calls.length,1)
    assert.strictEqual(cmiddle.data.mock.calls.length,1)
    assert.strictEqual(cbottom.data.mock.calls.length,1)
    await dispatch(app,volume,increase_a,6)
    assert.strictEqual(ctop.data.mock.calls.length,2)
    assert.strictEqual(cmiddle.data.mock.calls.length,2)
    assert.strictEqual(cbottom.data.mock.calls.length,2)
})

await test("multiple property change re-rendering", async () => {
    // check that on multiple property changes by an action, no unnecessary re-renders occur
    const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');
    const { window } = dom

    const app = create_app(window)
    const state = {a: 1, b: 2}
    const volume = create_volume(app,state)
    let bbottom = undefined
    const increase_a = {
        action: mock.fn(async (state,amount) => { state.a = state.a + amount}),
        props: ['a']
    }
    const increase_a_and_b = {
        action: mock.fn(async (state,amount) => { state.a = state.a + amount; state.b = state.b + amount ; }),
        props: ['a','b']
    }
    const cbottom = {
        element: create_element(app,'c-bottom',"<p>{{greeting}} {{a}}</p>"), 
        data: mock.fn((volume,binding) => ({ a:volume.state.a })),
        props: ['a']
    }
    const cmiddle = {
        element: create_element(app,'c-middle','<c-bottom volume_uuid="{{bbottom.volume}}" binding_uuid="{{bbottom.binding}}" greeting="a is"></c-bottom><p>b is {{b}}'), 
        data: mock.fn((volume,binding) => { 
            bbottom = create_binding(volume,cbottom,'b-bottom',binding)
            return { b:volume.state.b,bbottom: { volume: volume.uuid, binding: bbottom.uuid } }
        }),
        props: ['a','b']
    }
    const ctop = {
        element: create_element(app,'c-top','<c-middle volume_uuid="{{bmiddle.volume}}" binding_uuid="{{bmiddle.binding}}"></c-middle>'), 
        data: mock.fn((volume,binding) => { 
            const bmiddle = create_binding(volume,cmiddle,'b-middle',binding)
            return { a:volume.state.a,bmiddle: { volume: volume.uuid, binding: bmiddle.uuid } }
        }),
        props: ['a']
    }
    const btop = create_binding(volume,ctop)
    window.document.body.innerHTML=`<c-top volume_uuid="${volume.uuid}" binding_uuid="${btop.uuid}"></c-top>`
    assert.strictEqual(ctop.data.mock.calls.length,1)
    assert.strictEqual(cmiddle.data.mock.calls.length,1)
    assert.strictEqual(cbottom.data.mock.calls.length,1)
    await dispatch(app,volume,increase_a,6)
    assert.strictEqual(ctop.data.mock.calls.length,2)
    assert.strictEqual(cmiddle.data.mock.calls.length,2)
    assert.strictEqual(cbottom.data.mock.calls.length,2)
    await dispatch(app,volume,increase_a_and_b,6)
    assert.strictEqual(ctop.data.mock.calls.length,3)
    assert.strictEqual(cmiddle.data.mock.calls.length,3)
    assert.strictEqual(cbottom.data.mock.calls.length,3)
})
