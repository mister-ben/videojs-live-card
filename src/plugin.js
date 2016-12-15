import videojs from 'video.js';
import LiveCardModal from './placeholder.js';

// Default options for the plugin.
const defaults = {
  imageUrl: 'http://solutions.brightcove.com/lchok/rscs/imgs/bc-logo-large.png',
  holdText: 'The live stream has not started',
  intervalTime: 15
};

/**
 * Function to invoke when the player is ready.
 *
 * This is a great place for your plugin to initialize itself. When this
 * function is called, the player will have its DOM and child components
 * in place.
 *
 * @function onPlayerReady
 * @param    {Player} player
 * @param    {Object} [options={}]
 */
const onPlayerReady = (player, options) => {
  player.addClass('vjs-live-card');
  
  let modal = new LiveCardModal(player, {
    label: player.localize('Live Error Card'),
    temporary: false,
    uncloseable: true,
    imageUrl: options.imageUrl,
    holdText: options.holdText,
    intervalTime: options.intervalTime
  });
  
  player.liveCardModal = modal;

  player.addChild(modal);
};

/**
 * A video.js plugin
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @function liveCard
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
const liveCard = function(options) {
  this.ready(() => {
    onPlayerReady(this, videojs.mergeOptions(defaults, options));
  });
};

// Register the plugin with video.js.
videojs.plugin('liveCard', liveCard);

// Include the version number.
liveCard.VERSION = '__VERSION__';

export default liveCard;