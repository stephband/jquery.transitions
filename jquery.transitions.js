// jquery.transitions.js
// 
// 1.8
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
				WebkitTransition: 'top 0.01s linear',
				MozTransition: 'top 0.01s linear',
				OTransition: 'top 0.01s linear',
				transition: 'top 0.01s linear'
			}),
			transitionClass = 'transition',
			addOptions = { fallback: makeFallback(true) },
			removeOptions = { fallback: makeFallback(false) },
			autoProperties = {
				'height': true,
				'width': true,
				'margin-left': true,
				'margin-right': true
			},
			keywordProperties = {
				'display': true,
				'overflow': true
			},
			transitionStr,
			transitionPropertyStr,
			cssTransitionNone,
			cssTransitionEmpty,
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
			
			doClass.call(elem, className);
			transition = this.css('transition') || (window.getComputedStyle && getComputedStyle(this[0], null).transition) ;
			
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

				// transitionClass must be added before anything is measured, else
				// IE8 goes marching merrily off into compatibility mode.
				elem.addClass(transitionClass);
				
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
		var elem = e.data.obj,
				style = e.data.style,
				callback = e.data.callback,
				properties = e.data.properties,
				property = e.originalEvent.propertyName;
		
		if (properties) {
			properties.splice(properties.indexOf(property), 1);
			
			// If properties are still animating, do nothing.
			if (properties.length) { return; }
		}
		
		elem.unbind(jQuery.support.cssTransitionEnd, end);
		
		// Reset the style attribute to how it was before
		if (style) { elem.attr('style', style); }
		else { elem.removeAttr('style'); }
		
		// Stop transitions and repaint
		elem.css(cssTransitionNone).width();
		
		if (style) { elem.attr('style', style); }
		else { elem.removeAttr('style'); }
		
		elem.data('preTransitionStyle', false);
		elem.removeClass(transitionClass);
		
		callback && callback.call(e.data.obj);
	}
	
	
	// jQuery plugins
	
	function applyClass(elem, doMethod, undoMethod, classNames, options) {
		var autoValues = {},
		    cssStart = {},
		    cssEnd = {},
		    style, flag, properties, property, l;
		
		elem
		.addClass(transitionClass)
		.width();
		
		// Measure the values of auto properties. We must do this before
		// adding the class and testing for transition (unfortunately),
		// because if they are transition properties, auto values collapse
		// to 0. And that's what we're trying to avoid.
		for (property in autoProperties) {
			autoValues[property] = elem.css(property);
		}
		
		doMethod.call(elem, classNames);
		
		// Make array out of transition properties.
		durations = (elem.css(transitionDurationStr) || elem.css('MozTransitionDuration')).split(/\s*,\s*/);
		
		if (durations.length > 1 || parseFloat(durations[0]) > 0) {
			properties = (elem.css(transitionPropertyStr) || elem.css('MozTransitionProperty')).split(/\s*,\s*/);
			
			if (debug) { console.log('[jquery.transitions]', properties, durations); }
			
			l = properties.length;
			style = elem.data('preTransitionStyle', style);
			
			if (!style) {
				style = elem.attr('style');
				elem.data('preTransitionStyle', style);
			}
			
		  while (l--) {
				property = properties[l];
				
				if (autoProperties[property]) {
					if (!flag) {
						// Apply a stop to the transitions
						elem.css(cssTransitionNone);
						flag = true;
					}
					
					// Store their pre-transition value
					cssStart[property] = autoValues[property];
					
					// Measure their post-transition value
					cssEnd[property] = elem.css(property);
					
					if (debug) { console.log('[jquery.transitions]', property+' start:', cssStart[property], 'end:', cssEnd[property]); }
				}
				
				if (keywordProperties[property]) {
					//console.log('keyword property', property, (parseFloat(jQuery.trim(elem.css(transitionStr+'Delay')).split(',')[l])) || (parseFloat(jQuery.trim(elem.css(transitionStr+'Duration')).split(',')[l])));
					// This is ok because we're looping backwards through
					// the properties array, so our index, l, still goes onto
					// the 'next' entry.
					properties.splice(l, 1);
				}
				
				if (flag) {
					// Apply the pre-transition values and force a repaint.
					undoMethod.call(elem, classNames).css(cssStart).width();
					
					// Apply the post-transition values and re-enable transitions.
					jQuery.extend(cssEnd, cssTransitionEmpty);
					doMethod.call(elem, classNames).css(cssEnd);
				}
			}
			
			elem
			.unbind(jQuery.support.cssTransitionEnd, end)
			.bind(jQuery.support.cssTransitionEnd, { obj: elem, callback: options && options.callback, properties: properties }, end);
		}
		// Check to see if children have transitions. This is just a
		// sanity check. It is not foolproof, because nodes could have
		// transitions defined that are nothing to do with the current
		// transition.
		else if (elem.find(':transition').length){
		  elem
		  .unbind(jQuery.support.cssTransitionEnd, end)
		  .bind(jQuery.support.cssTransitionEnd, { obj: elem, callback: options && options.callback }, end);
		}
		else {
			elem.removeClass(transitionClass);
		}
	}
	
	function addTransitionClass(classNames, options) {
		applyClass(this, jQuery.fn.addClass, jQuery.fn.removeClass, classNames, options);
		return this;
	}
	
	function removeTransitionClass(classNames, options) {
		applyClass(this, jQuery.fn.removeClass, jQuery.fn.addClass, classNames, options);
		return this;
	}
	
	// Feature testing for transitionend event
	
	function removeTest() {
		clearTimeout(timer);
		timer = null;
		testElem.remove();
	}
	
	var setVars = {
		transitionend: function() {
			// The standard, but could also be -moz-.
			transitionStr = 'transition';
			transitionPropertyStr = 'transitionProperty';
			transitionDurationStr = 'transitionDuration';
			cssTransitionNone = { transition: 'none', MozTransition: 'none' };
			cssTransitionEmpty = { transition: '', MozTransition: '' };
		},
		webkitTransitionEnd: function() {
			transitionStr = 'WebkitTransition';
			transitionPropertyStr = 'WebkitTransitionProperty';
			transitionDurationStr = 'WebkitTransitionDuration';
			cssTransitionNone = { WebkitTransition: 'none' };
			cssTransitionEmpty = { WebkitTransition: '' };
		},
		oTransitionEnd: function() {
			transitionStr = 'OTransition';
			transitionPropertyStr = 'OTransitionProperty';
			transitionDurationStr = 'OTransitionDuration';
			cssTransitionNone = { OTransition: 'none' };
			cssTransitionEmpty = { OTransition: '' };
		}
	}
	
	function transitionEnd(e) {
		if (debug) { console.log('[jquery.transitions] Transition feature test: PASS'); }
		
		// Get rid of the test element
		removeTest();
		
		// Store flags in jQuery.support
		jQuery.support.cssTransition = true;
		jQuery.support.cssTransitionEnd = e.type;
		
		// Store local variables
		setVars[e.type]();
		
		// Redefine addTransitionClass and removeTransitionClass
		jQuery.fn.addTransitionClass = addTransitionClass;
		jQuery.fn.removeTransitionClass = removeTransitionClass;
		
		// Stop listening for transitionend
		docElem.unbind('transitionend webkitTransitionEnd oTransitionEnd', transitionEnd);
	}
	
	
	// Easing functions 'borrowed' from jQuery UI, renamed to meet
	// the CSS spec. TODO: At some point, we should rewrite these
	// to exactly match ths CSS spec, which is:
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
	
	// Custom selector :transition for finding elements with
	// a transition defined.
	
	jQuery.expr[':'].transition = function(obj){
		var elem = jQuery(obj),
				durations = (elem.css(transitionDurationStr) || elem.css('MozTransitionDuration')).split(/\s*,\s*/);
		
		return durations && (durations.length > 1 || parseFloat(durations[0]) > 0);
	};
	
	docElem
	.bind('transitionend webkitTransitionEnd oTransitionEnd', transitionEnd)
	.ready(function(){
		var wait = setTimeout(function() {
			clearTimeout(wait);
			wait = null;
			
			if (debug) { console.log('[jquery.transitions] Running transition feature test.'); }
			
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
				
				if (debug) { console.log('[jquery.transitions] Transition feature test: FAIL'); }
				
				// Store flags in jQuery.support
				jQuery.support.cssTransition = false;
				jQuery.support.cssTransitionEnd = false;
			}, 100);
		}, 1);
	});
})(jQuery);