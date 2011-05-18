<p>Now that we have class based transitions in the browser, we can trigger simple animations by adding and removing classes instead of relying on jQuery's .animate().
There are some advantages to class based animation, not least of which is the fact that it progressively enhances normal classes, but we do lose some functionality that .animate() provides - notably callbacks on animation end, and the ability to animate to 'hide', where display: none; is applied at the end of the animation.
These two methods address these problems.</p>

<h2>New in 1.5 - IE fallback!</h2>
<p>Automatic fallback to jQuery's .animate() in IE6, IE7 and IE8, allowing you to write transitions in CSS and have them display in these browsers, too. Support is rudimentary for the moment, but works if you stick to a few rules.</p>
<ul>
<li>CSS must be written: <code>transition: width 0.4s ease-in [, property duration easing];</code>. Transition sub-properties not supported.</li>
<li>Supports any number of property definitions, but animates them all at the last defined duration (avoids launching multiple calls to .animate()).</li>
<li>Supports animations on the current element only. That is, children that have transitions defined will not be animated. (Finding them could potentially be expensive).</li>
</ul>

<h2>Methods</h2>
<pre>.addTransitionClass( className, options )
.removeTransitionClass( className, options )</pre>

<p>Adds or removes the class className to the node. In addition, the class 'transition' is added for the duration of the transition, allowing you to define styles before, during and after a transition.
Where support for CSS transitions is not detected, .addTransitionClass() and .removeTransitionClass behave as .addClass() and .removeClass() respectively.
The class 'transition' is not added, and the callback is called immediately after the className is applied.</p>

<h2>Options</h2>
<dl>
	<dt>callback</dt><dd><i>function()</i> Called at the end of the CSS transition, or if CSS transition support is not detected, directly after className has been applied. Where fallback is defined, callback is passed to fallback as the first argument.<dd>
	<dt>fallback</dt><dd><i>function(class, callback)</i> Fallback is only called when native CSS transition support is not detected, typically allowing you to define jQuery animations to replace the missing CSS transitions. Overrides the default fallback which currently implements an automatic animation fallback in IE6, IE7 and IE8.<dd>
</dl>

<h2>An example</h2>
<p>Meet Jim.</p>
<pre><code>.jim {
  display: none;
  opacity: 0;
  
  -webkit-transition: opacity 0.06s ease-in;
     -moz-transition: opacity 0.06s ease-in;
          transition: opacity 0.06s ease-in;
}

.jim.active {
  display: block;
  opacity: 1;
}

.jim.transition {
  display: block;
}</code></pre>
<p>Jim is hidden until:</p>
<pre><code>jQuery('.jim').addTransitionClass('active')</code></pre>
<p>...at which point he becomes a block and fades in to <code>opacity: 1</code>. On:</p>
<pre><code>jQuery('.jim').removeTransitionClass('active')</code></pre>
<p>...he fades out again, and then is removed from display.</p>
<p>Note that if you try doing this simply by adding and removing the class <code>active</code>, you get some surprising results. When you add <code>active</code>, Jim appears at full opacity, without any transition. The browser does not judge a transition applicable because it has just rendered Jim for the first time, with <code>display: block; opacity: 1</code>. Jim disappears just as quickly when you remove the class <code>active</code>, because he suddenly no longer has <code>display: block</code>. The <code>transition</code> class, along with .addTransitionClass() and .removeTransitionClass(), solve these problems.</p>

<h2>Help</h2>
<p>Help improve me. Fork and help out!</p>