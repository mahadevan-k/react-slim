# React-tiny

Super small react-redux implementation (~87 lines)

I like to think of it as the unshitification of react :)

# What you get with this library

- Simple, understandable code that provides all of the core advantages of using the react design pattern
  - Component updation on declared state changes
  - Action dispatches which trigger state changes, which in turn trigger component updates
- Component heirarchies that update efficiently without duplication and unnecessary re-renders
- State need not be immutable
- Modular structure that allows you to break up your app into multiple sub-apps

# What you don't get with this library

Magic - no hidden functionality, no side-effects => no surprises or unpredictable behavior
Bells and whistles - only one way to work with the library => no confusions
extensible - provides enough de-coupled parts to let you combine things the way you want to
developer "protection" - no parameter checking or safety checks => fast, tiny codebase

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
