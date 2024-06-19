const target = {
  message1: "hello",
  message2: "everyone",
};

const handler2 = {
  get(target, prop, receiver) {
    return "world";
  },
};

const proxy2 = new Proxy(target, handler2);

const subscriptionHandler = {
  set(object,prop,value) {
      Reflect.set(...arguments);
      const subscriptions = object._subscriptions[prop] || [];
      subscriptions.forEach((fn) => fn(object,prop));
  }
}

function bind(object) {
    object._subscriptions={};
    return new Proxy(object,subscriptionHandler);
}

function subscribe(object,prop,fn) {
    object._subscriptions[prop]=[fn, ...(object._subscriptions[prop] || [])]
}


function eventHandler(object,prop) {
    console.log("Woohoo!");
    console.log("Prop "+prop+" was changed to "+object[prop]);
}

const a = bind({n1: 1, n2: 2});

subscribe(a,'n1',eventHandler);

a.n1=10;







