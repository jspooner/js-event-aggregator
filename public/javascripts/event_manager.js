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
    // console.log("new Message", messageName);
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
  // Notification
  //
  var Notification = function(message, data) {
    this.message = message;
    this.data    = data;
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
    // TODO Init with a list of windows
    this._messages = {}                                                         // hash of channels { 'ch1': new Message() }
    console.log("new EventManager", window.location.href);
    (window === parent) ? this._otherWindows = Array.prototype.slice.call(window.frames) : this._otherWindows = [parent];
    this._targetOrigin = "*";
    if (location.ancestorOrigins && location.ancestorOrigins.length > 0) {
      this._targetOrigin = location.ancestorOrigins[0];
    }    
    window.addEventListener("message", function(messageEvent) { // can we move this into a private method? ex: _handlePostMessage
      var notification = messageEvent['data'],
          channel      = notification['channel'],
          message      = notification['message'];
      console.log("EventManager handeling postMesage", channel, message, notification);
      console.log("Full postMessage event", messageEvent);
      console.log("------------------------------------ TODO check to see if this window is one we're interested in. ", messageEvent.source);

      if (this._messages[message]) {
        (this._messages[message]).notify(notification);
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
  EventManager.prototype.subscribe = function(message, callback) {
    // console.log("EventManager.subscribe", message);
    var message = this._messages[message] || (this._messages[message] = new Message(message));
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
  EventManager.prototype.unsubscribe = function(message, token) {
    // console.log("-------------", message, token)
    if (this._messages[message]) {
      this._messages[message].unsubscribe(token);
    }
  };
  EventManager.prototype.publish = function(message, payload) {
    // console.log('publish', message);
    var notification = new Notification(message, payload);
    if (this._messages[message]) {
      this._messages[message].notify(notification);
    }
    for (var i = 0; i < this._otherWindows.length; i++) { 
      this._otherWindows[i].postMessage(notification, this._targetOrigin);
    }
  };
  
  
  if (window.core == undefined) {
    window.core = {};
  }
  window.core.EventManager = EventManager;
  
})();