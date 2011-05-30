// jquery.transitions.js
// 
// 1.6
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
	var debug = (window.console && console.log),
			docElem = jQuery(document),
			testElem = jQuery('<div/>').css({
				// position: 'absolute' makes IE8 jump into Compatibility
				// Mode. Use position: 'relative'.
				position: 'relative',
				top: -200,
				left: -9999,
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
			  	transition, css, key, options, style;
			
			if (elem.hasClass(className) === add) {
				// No need to continue. Element already has got (or has not
				// got) this class.
				return;
			}
			
			doClass.call(elem, className).addClass(transitionClass);
			
			transition = (
				// For IE6, IE7, IE8
				this.css('transition') ||
				// For IE9
				(window.getComputedStyle && getComputedStyle(this[0], null).transition)
			);
			
			if (transition) {
				// IE, even though it doesn't support CSS transitions, at least
				// sees the rules, so we can interpret them and animate accordingly.
				
				css = {};
				style = elem.attr('style');
				options = {
					queue: true,
					specialEasing: {},
					complete: function() {
						var key;
						
						// Remove the transition class and reset the style attribute
						// to it's pre-animated state. In an ideal world, the elem will
						// remain the same because we have just animated to it.
				  	
				  	elem.removeClass(transitionClass);
				  	
				  	if (style) { elem.attr('style', style); }
				  	else { elem.removeAttr('style'); }
						
						callback && callback.apply(this);
					}
				};
				
				// Regex should be looser, to allow incompolete transition definitions...
				transition.replace(/([a-z\-]+)\s+([^\s]+)\s+([a-z\-]+)/g, function($match, $key, $duration, $easing) {
					css[$key] = elem.css($key);
					options.duration = parseFloat($duration) * 1000; // Convert seconds to milliseconds
					options.specialEasing[$key] = $easing;
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
				if (debug) { console.log('[jquery.transitions] Transition definition not readable'); }
				callback && callback.apply(this);
			}
		};
	}
	
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
		if (debug) { console.log('[jquery.transitions] CSS transition support detected.'); }
		
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
	
	
	// Easing functions 'borrowed' from jQuery UI, renamed to meet
	// the CSS spec. TODO: At some point, we should rewrite these
	// to exactly match ths CSS spec:
	//
	// ease: cubic-bezier(0,0,1,1)
	// ease-in: cubic-bezier(0.25,0.1,0.25,1)
	// ease-out: cubic-bezier(0,0,0.58,1)
	// ease-in-out: cubic-bezier(0.42,0,0.58,1)
	
	jQuery.extend(jQuery.easing, {
		'ease': function (x, t, b, c, d) {
			if ((t/=d/2) < 1) { return c/2*t*t + b };
			return -c/2 * ((--t)*(t-2) - 1) + b;
    },
		'ease-in': function (x, t, b, c, d) {
			return c*(t/=d)*t*t + b;
    },
		'ease-out': function (x, t, b, c, d) {
			return c*((t=t/d-1)*t*t + 1) + b;
		},
		'ease-in-out': function (x, t, b, c, d) {
			if ((t/=d/2) < 1) { return c/2*t*t*t + b };
			return c/2*((t-=2)*t*t + 2) + b;
		}
	});
	
	// Use addClass() and removeClass() methods by default
	
	jQuery.fn.addTransitionClass = function(classNames, o) {
		var options = jQuery.extend({}, o, addOptions);
		
		options.fallback.call(this, classNames, options.callback);
		return this;
	};
	
	jQuery.fn.removeTransitionClass = function(classNames, o){
		var options = jQuery.extend({}, o, removeOptions);
		
		options.fallback.call(this, classNames, options.callback);
		return this;
	};
	
	docElem
	.bind('transitionend webkitTransitionEnd oTransitionEnd', transitionEnd)
	.ready(function(){
		// Put the test element in the body
		testElem.appendTo('body');
		
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