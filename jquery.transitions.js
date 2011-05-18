// jquery.transitions.js
// 
// 1.5
// 
// Feature detects CSS transitions and provides a means to manage
// transitions that start or end with un-transitionable properties
// using CSS classes. Adds two methods to jQuery:
// 
// .addTransitionClass( className, callback )
// .removeTransitionClass( className, callback )
// 
// These fall back to jQuery's standard .addClass() and .removeClass()
// when the browser does not support CSS transitions, so they are safe
// to use without forking your code.

(function(jQuery, undefined){
	var debug = window.console && console.log,
			docElem = jQuery(document),
			testElem = jQuery('<div/>').css({
				position: 'absolute',
				top: -200,
				width: 100,
				height: 100,
				WebkitTransition: 'top 0.001s linear',
				MozTransition: 'top 0.001s linear',
				OTransition: 'top 0.001s linear',
				transition: 'top 0.001s linear'
			}),
			transitionClass = 'transition',
			addOptions = { fallback: makeFallback(true) },
			removeOptions = { fallback: makeFallback(false) },
			timer;
	
	function makeFallback(add) {
		var doClass = add ? jQuery.fn.addClass : jQuery.fn.removeClass,
				undoClass = add ? jQuery.fn.removeClass : jQuery.fn.addClass;
		
		return function(className, callback) {
			var elem = this,
			  	transition, css, key, options;
			
			if (elem.hasClass(className) === add) {
				// No need to continue. Element already has got, or has not
				// got this class.
				return;
			}
			
			doClass.call(elem, className).addClass(transitionClass);
			
			transition = this.css('transition') || this.css('-webkit-transition') || this.css('-moz-transition');
			
			if (transition) {
				// IE, even though it doesn't support CSS transitions, at least
				// sees the rules, so we can interpret them and animate accordingly.
				
				css = {};
				options = {
					complete: function() {
						var key;
						
						for (key in css) { css[key] = ''; }
						
						// Add the class and remove inline styles that have been
						// animated. In an ideal world, the style will remain the
						// same because we have just animated to it :)
				  	elem.removeClass(transitionClass).css(css);
						
						callback && callback.apply(this);
					},
					queue: true
				};
				
				transition.replace(/([a-z\-]+)\s+([^\s]+)\s+([a-z\-]+)/g, function($match, $key, $duration, $easing) {
					css[$key] = elem.css($key);
					options.duration = parseFloat($duration) * 1000; // Convert seconds to milliseconds
					//options.easing = $easing;
				});
				
				undoClass.call(elem, className);
				
				// Remove any style definitions that don't change, hopefully reducing
				// animation processing, and protecting predefined inline styles from
				// being removed.
				for (key in css) {
					if (css[key] === elem.css(key)) {
						delete css[key];
					}
				}
				
				elem.animate(css, options);
				doClass.call(elem, className);
			}
			else {
				if (debug) { console.log('Cannot use transition definition'); }
				callback && callback.apply(this);
			}
		}
	};
	
	function end(e){
		var callback = e.data.callback;
		
		e.data.obj
		.unbind( jQuery.support.cssTransitionEnd, end )
		.removeClass( transitionClass );
		
		callback && callback.call(e.data.obj);
	}
	
	// jQuery plugins
	
	function addTransitionClass( classNames, options ) {
		// Add the transition class then force the
		// browser to reflow by measuring something.
		this
		.addClass( transitionClass )
		.width();
		
		this
		.unbind(jQuery.support.cssTransitionEnd, end)
		.bind(jQuery.support.cssTransitionEnd, { obj: this, callback: options && options.callback }, end)
		.addClass(classNames);
		
		return this;
	}
	
	function removeTransitionClass( classNames, options ) {
		// Add the transition class then force the
		// browser to reflow by measuring something.
		this
		.addClass( transitionClass )
		.width();
		
		this
		.unbind(jQuery.support.cssTransitionEnd, end)
		.bind(jQuery.support.cssTransitionEnd, { obj: this, callback: options && options.callback }, end)
		.removeClass( classNames );
		
		return this;
	}
	
	// Feature testing for transitionend event
	
	function removeTest(){
		clearTimeout(timer);
		timer = null;
		testElem.remove();
	}
	
	function transitionEnd(e){
		// Get rid of the test element
		removeTest();
		
		// Store flags in jQuery.support
		jQuery.support.cssTransition = true;
		jQuery.support.cssTransitionEnd = e.type;
		
		// Redefine addTransitionClass and removeTransitionClass
		jQuery.fn.addTransitionClass = addTransitionClass;
		jQuery.fn.removeTransitionClass = removeTransitionClass;
		
		// Stop listening for transitionend
		docElem.unbind('transitionend webkitTransitionEnd oTransitionEnd', transitionEnd);
	}
	
	
	// Use addClass() and removeClass() methods by default
	
	jQuery.fn.addTransitionClass = function(classNames, o) {
		var options = jQuery.extend({}, o, addOptions);
		
		options.fallback.call(this, classNames, options.callback);
		return this;
	};
	
	jQuery.fn.removeTransitionClass = function( classNames, o ){
		var options = jQuery.extend({}, o, removeOptions);
		
		options.fallback.call(this, classNames, options.callback);
		return this;
	};
	
	docElem
	.bind('transitionend webkitTransitionEnd oTransitionEnd', transitionEnd)
	.ready(function(){
		// Put the test element in the body
		document.body.appendChild(testElem[0]);
		
		// Force the browser to reflow.
		testElem.width();
		
		// Apply CSS to trigger a transition
		testElem.css({ top: -300 });
		
		// Set a timeout for the transition test to finish, and if it does not,
		// get rid of the test element. Opera requires a much greater delay
		// than the time the transition should take, worryingly.
		timer = setTimeout(function(){
			removeTest();
			
			// Store flags in jQuery.support
			jQuery.support.cssTransition = false;
			jQuery.support.cssTransitionEnd = false;
		}, 100);
	});
})(jQuery);