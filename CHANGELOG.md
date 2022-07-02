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