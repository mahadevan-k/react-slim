# React-slim

Super small react-redux implementation (~200 lines,4KB minified)

I like to think of it as the unshitification of react :)

The main motivation to write this library was the shock and horror I felt when I noticed that
the react library actually has a compiler and rust code that compiles to WASM etc. making me
wonder why such a complex implementation was needed for such a simple design pattern.


# What you get with this library

- All the power of react and reduc encapsulated into 7 simple functions
- Powerful template-based rendering thanks to ![Mustache](https://github.com/janl/mustache.js/)
- Easy to debug - HTML tags to match your components, simple mapping via locators for tracing
- Efficient,predictable re-renders
- Modular structure - structure your application into multiple js bundles
- De-coupled implementation that allows you to combine things the way you want to
- Great performance
- Use it directly in your browser, or via node - your choice.

# What you don't get with this library

- No magic - no hidden functionality, no side-effects => no surprises or unpredictable behavior
- No bells and whistles - only one way to work with the library => no confusions
- No developer "protection" - no parameter checking or safety checks => fast, tiny codebase

# Installing react-slim

You can either install react-slim via npm and gang in your web application using

```
npm install react-slim
```

or

you can include it directly in your browser by including it along with the ![Mustache](https://github.com/janl/mustache.js/) library

```
 <script src="https://cdn.jsdelivr.net/npm/mustache@4.2.0/mustache.min.js"></script>
 <script type=module">
    import { create_app, create_volume, create_element, create_binding, dispatch, action } from "https://cdn.jsdelivr.net/npm/react-slim@latest/dist/react-slim.min.js">
 </script>
```

# Understanding react-slim

## Concepts

The diagram below gives a good overview of the various concepts in react-slim and how they interact with each other

![React-slim architecture](https://github.com/mahadevan-k/react-slim/blob/documentation/react-slim-architecture.png "Architecture Diagram")

## How the react-slim event loop works

1. User interacts with a Element
2. The Element triggers a Behavior
4. The Behavior dispatches an Action
5. The Action modifes a State
4. The Volume managing the State triggers re-renders for Bindings that correspond to the State changes
5. Each Binding triggers a re-render of the Element along with its Component at its Slot
6. The Element renders itself using data(and State) from the Component into the Slot

## Declarative UI updates

React-slim uses a declarative approach to UI updates. The state keys that you declare in the components and actions are what react-slim uses to decide which components to update in the UI.

The main goal of keeping the structure this way is to help developers easily understand which parts of the state affect a component, instead of having to dig through code to understand changes.

An additional goal is to allow for action definitions that modify state but do not need to trigger UI updates.

This also means that states do not have to be immutable.

## Concept Re-usability

React-slim tries to keep its concepts as re-usable as possible.

- Actions are not bound to anything and can be re-used across apps, volumes and bindings
- Components can be re-used across Bindings, and therefore across Volumes and Apps
- States can be re-used across Volumes (but make sure you dispatch actions appropriately for each volume that manages the state)

However, there is an exception

- Elements are probably the least re-usable since they are bound to the app, and they need a globally unique element name since they are registered as custom HTML elements

# Example app

An example usage of react-slim to create a simple app that demonstrates how to use react-slim
is included in the repository, you can see it here

![Example application](https://github.com/mahadevan-k/react-slim/blob/main/app.js "Example Application")


# Opinionated/polarizing design choices

Here are some polarizing design choices I've made in the library. These are points you should
seriously consider before adopting react-slim for large applications.

State change propagations are declarative, you'll need to declare state properties that your components 
depend on, and the properties that your actions modify. This was intentionally done to make it easier to
understand component and action dependencies when reading your code, however it does introduce the 
complexity of manually updating these props when you modify actions or components.

ChatGPT pointed out to me that state propagation across volumes is a disadvantage and suggested
centralized state management as an option. I decided to go against its suggestion because multiple volume
state changes can easily be triggered by two or more actions on two or more different volumes.
React-slim makes a trade-off on centralized state management and shoots for modular state because
centralized state management involves complexities in desiging the state for large applications.

ChatGPT also pointed out that I don't use a virtual DOM for efficient updates to the UI, but on
researching this topic, again, I found it unnecessary since react-slim only evaluates components whose state
has changed, unlike React which evaluates the entire DOM tree on every state update.

# How this library will evolve

I don't plan to change the functionality of the library *at all*. I think the world has too
many libraries that change too fast, leaving developers always confused about the right way
to build apps or features.

I am, however, open to performance improvements and bug-fixes

# Using ChatGPT to generate react-slim apps

The cool thing about react-slim is that 150 lines of code can easily be sent to ChatGPT in a prompt 
to create react-slim modules and app.

You can use the text of the following file as a prompt to chatgpt. The instructions to ChatGPT 
are at the end of the file.

![ChatGPT Prompt](https://github.com/mahadevan-k/react-slim/blob/main/chatgpt-prompt.txt "ChatGPT Prompt")

Far from perfect though, so make sure you match the coding convensions followed in the example application above 
and edit ChatGPT's output for best results.

# Author

Mahadevan K - mahadevan.k@gmail.com
