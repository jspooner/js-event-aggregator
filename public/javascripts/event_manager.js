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
  *
  *
  **/
  var EventManager = function() {
    this._messages = {}
    console.log("new EventManager", window.location.href);
    this._otherWindow = parent;
    this._targetOrigin = "*";
    if (location.ancestorOrigins.length > 0) {
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
  *
  * @method subscribe
  * @param {String} message
  * @param {Function} callback
  * @return {String} Returns a token that is used to unsubscribe
  */
  EventManager.prototype.subscribe = function(message, callback) {
    console.log("EventManager.subscribe", message, this._messages[message]);
    var message = this._messages[message] || (this._messages[message] = new Message(message));
    return message.subscribe(callback);
  };
  /**
  * Unsubscribe from an event from this or another window
  *
  * @method unsubscribe
  * @param {String} message
  * @param {String} token
  * @return {Boolean} 
  */
  EventManager.prototype.unsubscribe = function(message, token) {
  };
  EventManager.prototype.publish = function(message, payload) {
    if(this._messages[message]) {
      ((this._messages[message])).notify(payload);
    }
    this._otherWindow.postMessage(message, this._targetOrigin);
  };
  
  
  if (window.core == undefined) {
    window.core = {};
  }
  window.core.EventManager = EventManager;
  
})();