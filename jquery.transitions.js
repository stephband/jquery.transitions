// jquery.transitions.js
// 
// 1.3
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

(function(jQuery){
	var docElem = jQuery(document),
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
			timer;
	
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
		.addClass( classNames );
		
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
	jQuery.fn.addTransitionClass = function(classNames, options) {
		var fallback = options && options.fallback,
				callback = options && options.callback;
		
		this.addClass(classNames);
		
		if (fallback) { fallback.call(this, callback); }
		else					{ callback && callback.call(this); }
		
		return this;
	};
	
	jQuery.fn.removeTransitionClass = function( classNames, options ){
		var fallback = options && options.fallback,
				callback = options && options.callback;
		
		this.removeClass(classNames);
		
		if (fallback) { fallback.call(this, callback); }
		else 					{ callback && callback.call(this); }
		
		return this;
	};
	
	docElem
	.bind('transitionend webkitTransitionEnd oTransitionEnd', transitionEnd)
	.ready(function(){
		// Put the test element in the body
		document.body.appendChild( testElem[0] );
		
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