
if (!Cordova.hasResource("battery")) {
Cordova.addResource("battery");

/**
 * This class contains information about the current battery status.
 * @constructor
 */
var Battery = function() {
    this._level = null;
    this._isPlugged = null;
    this._batteryListener = [];
    this._lowListener = [];
    this._criticalListener = [];
};

/**
 * Registers as an event producer for battery events.
 * 
 * @param {Object} eventType
 * @param {Object} handler
 * @param {Object} add
 */
Battery.prototype.eventHandler = function(eventType, handler, add) {
    var me = navigator.battery;
    if (add) {
        // If there are no current registered event listeners start the battery listener on native side.
        if (me._batteryListener.length === 0 && me._lowListener.length === 0 && me._criticalListener.length === 0) {
            Cordova.exec(me._status, me._error, "org.apache.cordova.battery", "start", []);
        }
        
        // Register the event listener in the proper array
        if (eventType === "batterystatus") {
            var pos = me._batteryListener.indexOf(handler);
            if (pos === -1) {
            	me._batteryListener.push(handler);
            }
        } else if (eventType === "batterylow") {
            var pos = me._lowListener.indexOf(handler);
            if (pos === -1) {
            	me._lowListener.push(handler);
            }
        } else if (eventType === "batterycritical") {
            var pos = me._criticalListener.indexOf(handler);
            if (pos === -1) {
            	me._criticalListener.push(handler);
            }
        }
    } else {
        // Remove the event listener from the proper array
        if (eventType === "batterystatus") {
            var pos = me._batteryListener.indexOf(handler);
            if (pos > -1) {
                me._batteryListener.splice(pos, 1);        
            }
        } else if (eventType === "batterylow") {
            var pos = me._lowListener.indexOf(handler);
            if (pos > -1) {
                me._lowListener.splice(pos, 1);        
            }
        } else if (eventType === "batterycritical") {
            var pos = me._criticalListener.indexOf(handler);
            if (pos > -1) {
                me._criticalListener.splice(pos, 1);        
            }
        }
        
        // If there are no more registered event listeners stop the battery listener on native side.
        if (me._batteryListener.length === 0 && me._lowListener.length === 0 && me._criticalListener.length === 0) {
            Cordova.exec(null, null, "org.apache.cordova.battery", "stop", []);
        }
    }
};

/**
 * Callback for battery status
 * 
 * @param {Object} info			keys: level, isPlugged
 */
Battery.prototype._status = function(info) {
	if (info) {
		var me = this;
		if (me._level != info.level || me._isPlugged != info.isPlugged) {
			// Fire batterystatus event
			//Cordova.fireWindowEvent("batterystatus", info);
			// use this workaround since iOS 3.x does have window.dispatchEvent
			Cordova.fireEvent("batterystatus", window, info);	

			// Fire low battery event
			if (info.level == 20 || info.level == 5) {
				if (info.level == 20) {
					//Cordova.fireWindowEvent("batterylow", info);
					// use this workaround since iOS 3.x does not have window.dispatchEvent
					Cordova.fireEvent("batterylow", window, info);
				}
				else {
					//Cordova.fireWindowEvent("batterycritical", info);
					// use this workaround since iOS 3.x does not have window.dispatchEvent
					Cordova.fireEvent("batterycritical", window, info);
				}
			}
		}
		me._level = info.level;
		me._isPlugged = info.isPlugged;	
	}
};

/**
 * Error callback for battery start
 */
Battery.prototype._error = function(e) {
    console.log("Error initializing Battery: " + e);
};

Cordova.addConstructor(function() {
    if (typeof navigator.battery === "undefined") {
        navigator.battery = new Battery();
        Cordova.addWindowEventHandler("batterystatus", navigator.battery.eventHandler);
        Cordova.addWindowEventHandler("batterylow", navigator.battery.eventHandler);
        Cordova.addWindowEventHandler("batterycritical", navigator.battery.eventHandler);
    }
});
}