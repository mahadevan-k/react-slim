# React-slim

Super small react-redux implementation (~150 lines)

I like to think of it as the unshitification of react :)

The main motivation to write this library was the shock and horror I felt when I noticed that
the react library actually has a compiler and rust code that compiles to WASM etc. making me
wonder why such a complex implementation was needed for such a simple design pattern.


# What you get with this library

- Simple, understandable code that provides all of the core advantages of using the react design pattern
  - Component updation on declared state changes
  - Action dispatches which trigger state changes, which in turn trigger component updates
- Powerful template-based rendering thanks to ![Mustache](https://github.com/janl/mustache.js/)
- HTML tag names that correspond to your components, making the structure easy to read and debug
- Component heirarchies that update efficiently without duplication and unnecessary re-renders
- action chaining to reduce re-renders and control the order of async actions when needed
- State need not be immutable
- Modular structure that allows you to break up your app into multiple sub-apps
- Flexible, de-coupled implementation that allows you to combine things the way you want to
- Great performance

# What you don't get with this library

- Magic - no hidden functionality, no side-effects => no surprises or unpredictable behavior
- Bells and whistles - only one way to work with the library => no confusions
- developer "protection" - no parameter checking or safety checks => fast, tiny codebase

# installing react-slim

You can either install react-slim via npm and gang in your web application using

```
npm install react-slim
```

or

you can include it directly in your browser by including it along with the mustache library

```
 <script src="https://cdn.jsdelivr.net/npm/mustache@4.2.0/mustache.min.js"></script>
 <script type=module">
    import { create_app, create_volume, create_element, create_binding, dispatch, action } from "https://cdn.jsdelivr.net/npm/react-slim@latest/dist/react-slim.min.js">
 </script>
```

# Understanding react-slim

## Concepts

React-slim is broken up into three types of concepts.

These concepts are only needed for you to understand how react-slim works.

The actual implementation requires you to learn and use only 6 methods.

### Visual concepts

Concepts that deal with UI and rendering

**Apps**
: coordinate mapping and rendering to the UI, and help segregate functionality of large applications

**Elements**
: Register a custom HTML element which render a HTML ![mustache](https://github.com/janl/mustache.js/) template

### Propagation concepts

Concepts that coordinate updates to the UI based on changes to states

**Volumes**
: handle all UI updates associated with a State object 

**Bindings**
: handle UI updates for a single Component

### Declarative concepts

Concepts that simply declare methods or data

**States**
: javascript objects tha define the  data you need for your application. Top-level keys of the object can be used to subscribe/trigger changes to the UI

**Components**
: javascript objects that define Elements, the data they need to render and the state keys they subscribe to

**Actions**
: javascript objects that define functions that modify state and the declare the state keys that they modify


## How the react-slim event loop works

1. User interacts with a component
2. The component dispatches an Action (or a chain of Actions)
3. The Action modifes a State
4. The Volume managing the State triggers re-renders for all Bindings which subscribe to the state keys that the Action modifies
5. Each Binding triggers a render of the Element associated with its Component
6. The Element renders itself using data from the Component

## Declarative UI updates

React-slim uses a declarative approach to UI updates. The state keys that you declare in the components and actions are what react-slim uses to decide which components to update in the UI.

The main goal of keeping the structure this way is to help developers easily understand which parts of the state affect a component, instead of having to dig through code to understand changes.

An additional goal is to allow for action definitions that modify state but do not need to trigger UI updates.

This also means that states do not have to be immutable.

# Concept Re-usability

React-slim tries to keep its concepts as re-usable as possible.

- Actions are not bound to anything and can be re-used across apps, volumes and bindings
- Components can be re-used across Bindings, and therefore across Volumes and Apps
- States can be re-used across Volumes (but make sure you dispatch actions appropriately for each volume that manages the state)

However, there is an exception

- Elements are probably the least re-usable since they are bound to the app, and they need a globally unique element name since they are registered as custom HTML elements

The following diagram describes how react-slim is organized

![React-slim architecture](https://github.com/mahadevan-k/react-slim/blob/main/react-slim-architecture.jpg "Architecture Diagram")

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
