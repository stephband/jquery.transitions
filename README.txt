<p>Now that we have class based transitions in the browser, we can trigger simple animations by adding and removing classes instead of relying on jQuery's .animate().
There are some advantages to class based animation, not least of which is the fact that it progressively enhances normal classes, but we do lose some functionality that .animate() provides - notably callbacks on animation end, and the ability to animate to 'hide', where display: none; is applied at the end of the animation.
These two methods address these problems.</p>

<h2>Methods</h2>
<pre>.addTransitionClass( className, options )
.removeTransitionClass( className, options )</pre>

<p>Adds or removes the class className to the node. In addition, the class 'transition' is added for the duration of the transition, allowing you to define styles before, during and after a transition.
Where support for CSS transitions is not detected, .addTransitionClass() and .removeTransitionClass behave as .addClass() and .removeClass() respectively.
The class 'transition' is not added, and the callback is called immediately after the className is applied.</p>

<h2>Options</h2>
<dl>
	<dt>callback</dt><dd><i>function</i> Called at the end of the CSS transition, or if CSS transition support is not detected, directly after className has been applied. Where fallback is defined, callback is passed to fallback as the first argument.<dd>
	<dt>fallback</dt><dd><i>function</i> When CSS transition support is not detected and fallback is defined, it is called directly after className is applied, with callback as its first argument. Typically this allows you to define jQuery animations to replace the missing CSS transitions.<dd>
</dl>