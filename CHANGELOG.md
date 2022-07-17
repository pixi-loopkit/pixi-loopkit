0.2.3
======

- Graphics function calls now return the graphics object to match Pixi's chaining
  behavior
- add experimental bounds property that allows telling pixi to not bother
  calculating bounds. this is useful when you have an object that involves rendering
  way bigger than you'd care to cache, for example. like a massive gradient 1% of
  which you care about.


0.2.2
======

- loopkit core loop - optimize timestamp list for tracking fps to avoid any
  unnecessary overhead
- override pixi's addChild to fix explodes when addChild is called with no params


0.2.1
======

- use pixi.js' backgroundColor attribute and use chroma to parse the color to hex
- add missing removeChildren proxy to kit
- when onFrame callback is not present .render() calls do not create animation
  frame, leaving full control to the caller


0.2.0
======

Change `graphics.scale` and `graphics.skew` to `doScale` and `doSkew`,
respectively, as the drawing operations were clashing with PIXI's `graphics`
properties.
