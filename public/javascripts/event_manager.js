// Event Aggregator

(function() {
  "use strict";
  //
  // Subscription
  //
  var Subscription = function(id, callback) {
    this.id = id;
    this.callback = callback;
  }
  //
  // Message
  //
  var Message = function(messageName) {
    console.log("new Message", messageName);
    this._message       = messageName;
    this._subscriptions = [];
    this._nextId        = 0;
  }
  Message.prototype.unsubscribe = function(id) {
    this._subscriptions[id] = undefined;
  },
  Message.prototype.subscribe = function(callback) {
    var subscription = new Subscription(this._nextId++, callback);
    this._subscriptions[subscription.id] = subscription;
    return subscription.id;
  };
  Message.prototype.notify = function(payload) {
    var index;
    for(index = 0; index < this._subscriptions.length; index++) {
      if(this._subscriptions[index]) {
        this._subscriptions[index].callback(payload);
      }
    }
  };
  //
  // Channel
  //
  var Channel = function(channelName) {
    console.log("new Channel", channelName);
    this._messages      = {}
    this._channel       = channelName;
  }
  /**
  * EventManager 
  * The EventManager is an event aggregator with cross iFrame support.
  *
  * example 
  * 
  *    var em = new EventManager();
  *    var token = em.subscribe('click', function(payload){
  *      console.log("click handler", payload);
  *    });
  *    console.log('token for unsubscribing', token);
  *    em.publish('click', { 'foo' : 'bar' });
  **/
  var EventManager = function() {
    this._channels = {}                                                         // { 'ch1': new Message() }
    console.log("new EventManager", window.location.href);
    this._otherWindow = parent;
    this._targetOrigin = "*";
    if (location.ancestorOrigins && location.ancestorOrigins.length > 0) {
      this._targetOrigin = location.ancestorOrigins[0];
    }    
    window.addEventListener("message", function(event) { // can we move this into a private method? ex: _handlePostMessage
      var message = event['data'];
      console.log("EventManager handeling postMesage", message);
      console.log("Full postMessage event", event);
      if(this._messages[message]) {
        ((this._messages[message])).notify({});
      }
    }.bind(this));
  }
  /**
  * Subscribe to an event from this or another window
  * This will notify the current window before notifying the other window.
  *
  * @method subscribe
  * @param {String} message
  * @param {Function} callback
  * @return {String} Returns a token that is used to unsubscribe
  */
  EventManager.prototype.subscribe = function(channel, message, callback) {
    // console.log("EventManager.subscribe", channel, message);
    var channel = this._channels[channel] || (this._channels[channel] = new Channel(channel))         // has hash of of channels
    var message = channel._messages[message] || (channel._messages[message] = new Message(message));  // each channel has a hash of messages
    return message.subscribe(callback);
  };
  /**
  * Unsubscribe from an event from this or another window.
  * 
  *
  * @method unsubscribe
  * @param {String} message
  * @param {String} token
  * @return {Boolean} 
  */
  EventManager.prototype.unsubscribe = function(channel, message, token) {
    console.log("-------------", channel, message, token)
    if(this._messages[message]) {
      this._messages[message].unsubscribe(token);
    }
  };
  EventManager.prototype.publish = function(channel, message, payload) {
    console.log('publish', channel, message);
    if (this._channels[channel] && this._channels[channel]._messages[message]) {
      (this._channels[channel]._messages[message]).notify(payload);
    }
    // if(this._messages[message]) {
    //   ((this._messages[message])).notify(payload);
    // }
    // this._otherWindow.postMessage(message, this._targetOrigin);
  };
  
  
  if (window.core == undefined) {
    window.core = {};
  }
  window.core.EventManager = EventManager;
  
})();