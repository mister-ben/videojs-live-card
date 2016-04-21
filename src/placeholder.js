import document from 'global/document';
import videojs from 'video.js';

const ModalDialog = videojs.getComponent('ModalDialog');

/**
 * @class EndCardModal
 * @extends {ModalDialog}
 */
class LiveCardModal extends ModalDialog {

  /**
   * Constructor for EndCardModal
   *
   * @method constructor
   * @param  {Player} player
   * @param  {Object} [options]
   */
  constructor(player, options) {
    super(player, options);
    this.on(player, 'error', this.open);
    this.el_.style.backgroundImage = `url(${options.imageUrl})`;
  }

  // Just don't fill for now
  fill() {
    //
  }

  /**
   * Build the modal's CSS class.
   *
   * @method buildCSSClass
   * @return {String}
   */
  buildCSSClass() {
    return `vjs-live-card ${super.buildCSSClass()}`;
  }

}

videojs.registerComponent('LiveCardModal', LiveCardModal);

export default LiveCardModal;