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
		e.data
		.unbind( jQuery.support.cssTransitionEnd, end )
		.removeClass( transitionClass );
	}
	
	// jQuery plugin methods
	
	function addTransitionClass( classNames ) {
		// Add the transition class then force the
		// browser to reflow.
		this
		.addClass( transitionClass )
		.width();
		
		this
		.bind( jQuery.support.cssTransitionEnd, this, end )
		.addClass( classNames );
		
		return this;
	}
	
	function removeTransitionClass( classNames ) {
		// Add the transition class then force the
		// browser to reflow.
		this
		.addClass( transitionClass )
		.width();
		
		this
		.bind( jQuery.support.cssTransitionEnd, this, end )
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
	
	// Use the non-transition plugins by default
	jQuery.fn.addTransitionClass = jQuery.fn.addClass;
	jQuery.fn.removeTransitionClass = jQuery.fn.removeClass;
	
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