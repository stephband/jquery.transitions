Now that we have class based transitions in the browser, we can trigger simple animations by adding and removing classes instead of relying on jQuery's .animate(). There are some advantages to class based animation, not least of which is the fact that it progressively enhances normal classes, but we do lose some functionality that .animate() provides - notably callbacks on animation end, and the ability to animate to 'hide', where display: none; is applied at the end of the animation. These two methods address these problems.


.addTransitionClass( className, callback )

Adds the class className to the node, along with the class 'transition'. The class 'transition' is removed at the end of the transition, allowing you to define styles in CSS for before, during and after the transition.

Where transition support is not detected, addTransitionClass() behaves as addClass(). The class 'transition' is not added, and the callback is called immediately.


.removeTransitionClass( className, callback )

Removes the class className to the node, and adds the class 'transition'. The class 'transition' is removed at the end of the transition, allowing you to define styles in CSS for before, during and after the transition.

Where transition support is not detected, removeTransitionClass() behaves as removeClass(). The class 'transition' is not added, and the callback is called immediately.