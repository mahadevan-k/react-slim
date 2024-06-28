# React-tiny

Super small react-redux implementation (~127 lines)

I like to think of it as the unshitification of react :)

The main motivation to write this library was the shock and horror I felt when I noticed that
the react library actually has a compiler and rust code that compiles to WASM etc. making me
wonder why such a complex implementation was needed for such a simple design pattern.

# What you get with this library

- Simple, understandable code that provides all of the core advantages of using the react design pattern
  - Component updation on declared state changes
  - Action dispatches which trigger state changes, which in turn trigger component updates
- Component heirarchies that update efficiently without duplication and unnecessary re-renders
- State need not be immutable
- Modular structure that allows you to break up your app into multiple sub-apps
- De-coupled implementation that allows you to combine things the way you want to

# What you don't get with this library

- Magic - no hidden functionality, no side-effects => no surprises or unpredictable behavior
- Bells and whistles - only one way to work with the library => no confusions
- developer "protection" - no parameter checking or safety checks => fast, tiny codebase

# Learning react-tiny

To learn how to use the react-tiny library, read the app.js file in this repository,
which contains detailed documentation in comments, which can be run in the command-line itself via

    npx node app.js

# How this library will evolve

I don't plan to change the functionality of the library *at all*. I think the world has too
many libraries that change too fast, leaving developers always confused about the right way
to build apps or features.

I am, however, open to performance improvements and bug-fixes

# Author

Mahadevan K - mahadevan.k@gmail.com
