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
      let errNo = player.error().code;
      let duration = player.duration();
      global.intervalTime = options.intervalTime;

      //check the value of the delay timer passed and make sure it is in milliseconds
      if(Number.isInteger(intervalTime)){
        intervalTime = parseInt(intervalTime) * 1000;
      }else{
        //if value is not a number, default value to check again stream (in milliseconds)
        intervalTime = 15000;
      }

      //Firefox & IE read network error #2 so we'll convert to 4 for simplicity
      if(((navigator.userAgent.toLowerCase().indexOf('firefox') > -1) && errNo === 2) || (navigator.userAgent.match('MSIE 10.0;')) || (navigator.userAgent.match('rv:11.0'))){
        errNo = 4;
      }

      if ((errNo === 4 && duration === 0) || (errNo === 4 && duration === -1) || (errNo === 4 && duration === Infinity)){
        this.open();
        player.error(null);

        this.el_.style.backgroundImage = `url(${options.imageUrl})`;
        let placeHolderMsg = document.createElement('label'),
            placeHolderSpin = document.createElement('span');

        placeHolderMsg.className = 'vjs-placeHolderMsg';
        placeHolderSpin.className = 'vjs-placeHolderSpin';

        placeHolderMsg.innerHTML = options.holdText;
        this.el_.appendChild(placeHolderMsg);
        this.el_.appendChild(placeHolderSpin);
        
        //Start pinging the source file for a response and dynamically switch to the live media when ready. This was tested with DVR and NON-DVR environments but only through the Brightcove live module which expects an m3u8 as a valid response.

        //trigger spin
        global.spin = document.getElementsByClassName('vjs-placeHolderSpin');
        spin[0].style.display='block';
        
        let src_array = player.mediainfo.sources;

        //we assume the first item in the array is M3U8 when using the live module and only this one will be tested in this release
        global.src_m3u8 = src_array[0].src;

        //fire the xhr function
        videojs.xhr(src_m3u8, callback);
      }else{
        player.error();
      }
    });

    let callback = function(error, response, responseBody) {
                    //trigger spin
                    spin[0].style.display='block';

                    if(error){
                      return console.log('Error in the XHR call: ' + error);

                    }else if(response.statusCode == 404){
                    //if xhr call has been made but there's an error in the response (most likely response is 'Stream not found' then there is no live stream yet as the current manifest is empty)      

                      //hide spin
                      spin[0].style.display = 'none';

                      //check again in x seconds (default: 15)
                      setTimeout(function() {
                        videojs.xhr(src_m3u8, callback);
                      }, intervalTime);
                      
                    }else{
                    //if xhr call has element(s)

                    let xhttpResponseArray,
                        xhttpResponseArrayCleaned = new Array();

                    //so we need to loop through all the URLs in the master manifest, assuming all URLs don't start with #
                      xhttpResponseArray = responseBody.split('\n');

                    //loop through and create a cleaned array with the urls only
                      for (var i=0; i < xhttpResponseArray.length; i++){
                        if(xhttpResponseArray[i].charAt(0) != '#' && xhttpResponseArray[i]){
                          xhttpResponseArrayCleaned.push(xhttpResponseArray[i]);
                        }
                      }

                      //we'll check the first submanifest only, assuming Zencoder does its job properly and if a submanifest/rendition is available then asset and renditions are ready to be played 
                      if(xhttpResponseArrayCleaned[0].indexOf('.m3u8') > -1){
                        videojs.xhr(xhttpResponseArrayCleaned[0], callback)
                      }else{
                      //should be ts inside m3u8
                      //if we have less than 3 segments, keep checking every x seconds (default: 15)
                        if(xhttpResponseArrayCleaned.length < 3){
                          videojs.xhr(src_m3u8, callback);
                        }else{
                          //remove livecard and stop running
                          //hide spin
                          spin[0].style.display='none';

                          //remove livecard
                          player.liveCardModal.close();

                          //player loads current stream
                          player.one('loadstart', function() {player.play()})

                          //check if browser has native hls or not
                          if (player.tech_.hls) {
                            player.src(player.tech_.hls.source_);
                          }else{
                            player.load();
                          }

                          //LEAVE LOOP otherwise it will test other submanifests
                          return false;
                        }
                      }
                    }
    }
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