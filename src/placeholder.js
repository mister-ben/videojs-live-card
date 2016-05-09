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
    this.on(player, 'error', function () {
      //display error card if no stream found 
      var errNo = player.error().code;
      var duration = player.duration();
      if (errNo == '4' && duration == '0') {
        this.open();
        player.error(null);
      }
    });

    this.el_.style.backgroundImage = `url(${options.imageUrl})`;
    let placeHolderMsg = document.createElement('label');
    placeHolderMsg.className = 'vjs-placeHolderMsg';
    placeHolderMsg.innerHTML = options.holdText;
    this.el_.appendChild(placeHolderMsg);
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