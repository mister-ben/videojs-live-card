# videojs-live-card

Placeholder for non-live live streams.

WORK IN PROGRESS: this is crude and just shows the placeholder on any error event

## Table of Contents

<!-- START doctoc -->
<!-- END doctoc -->
## Installation

```sh
npm install --save videojs-live-card
```

The npm installation is preferred, but Bower works, too.

```sh
bower install  --save videojs-live-card
```

## Usage

To include videojs-live-card on your website or web application, use any of the following methods.

### `<script>` Tag

This is the simplest case. Get the script in whatever way you prefer and include the plugin _after_ you include [video.js][videojs], so that the `videojs` global is available.

```html
<script src="//path/to/video.min.js"></script>
<script src="//path/to/videojs-live-card.min.js"></script>
<script>
  var player = videojs('my-video');

  player.liveCard();
</script>
```

### Browserify

When using with Browserify, install videojs-live-card via npm and `require` the plugin as you would any other module.

```js
var videojs = require('video.js');

// The actual plugin function is exported by this module, but it is also
// attached to the `Player.prototype`; so, there is no need to assign it
// to a variable.
require('videojs-live-card');

var player = videojs('my-video');

player.liveCard();
```

### RequireJS/AMD

When using with RequireJS (or another AMD library), get the script in whatever way you prefer and `require` the plugin as you normally would:

```js
require(['video.js', 'videojs-live-card'], function(videojs) {
  var player = videojs('my-video');

  player.liveCard();
});
```

## License

MIT. Copyright (c) mister-ben &lt;git@misterben.me&gt;


[videojs]: http://videojs.com/
