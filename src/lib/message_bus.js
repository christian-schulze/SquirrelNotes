
let topics = {};

export default class MessageBus {
  static subscribe(topic, listener) {
    if (!topics[topic]) {
      topics[topic] = [];
    }

    topics[topic].push(listener);
  }

  static publish(topic, data) {
    if (!topics[topic] || topics[topic].length === 0) {
      return;
    }

    for (let listener of topics[topic]) {
      listener(data);
    }
  }
}

