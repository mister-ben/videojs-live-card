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

      //Firefox reads network error #2 so we'll convert to 4 for simplicity
      if((navigator.userAgent.toLowerCase().indexOf('firefox') > -1) && errNo === 2){
        errNo = 4;
      }

      if ((errNo === 4 && duration === 0) || (errNo === 4 && duration === -1) || (errNo === 4 && duration === Infinity)){
        console.log('*** ERROR ***');
        console.log(errNo);
        console.log('*** DURATION ***');
        console.log(duration);
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

        console.log('SOURCES: ');
        console.log(src_array);

        console.log('M3U8: ');
        console.log(src_m3u8);

        //fire the checklive function
        videojs.xhr(src_m3u8, callback);
      }else{
        player.error();
      }
    });

    let callback = function(error, response, responseBody) {
                    //trigger spin
                    spin[0].style.display='block';

                    if(error){
                      console.log('ERROR IN VIDEOJS.XHR request');
                      return console.log('Error in the XHR call: ' + error);

                    }else if(response.statusCode == 404){
                    //if xhr call has been made but there's an error in the response (most likely response is 'Stream not found' then there is no live stream yet as the current manifest is empty)
                      console.log('XHR URL ', response.url);
                      console.log('has a response status 404: ', response.statusCode);         

                      //hide spin
                      spin[0].style.display = 'none';

                      //check again in 15 seconds
                      console.log('...checking again in 15 seconds...');

                      setTimeout(function() {
                        videojs.xhr(src_m3u8, callback);
                      }, 15000);
                      
                    }else{
                    //if xhr call has element(s)
                    console.log('XHR OK ', response)

                    let xhttpResponseArray,
                        xhttpResponseArrayCleaned = new Array();

                    //so we need to loop through all the URLs in the master manifest, assuming all URLs don't start with #
                      xhttpResponseArray = responseBody.split('\n');
                      console.log('array: ');
                      console.log(xhttpResponseArray);

                    //loop through and create a cleaned array with the urls only
                      for (var i=0; i < xhttpResponseArray.length; i++){
                        if(xhttpResponseArray[i].charAt(0) != '#' && xhttpResponseArray[i]){
                          xhttpResponseArrayCleaned.push(xhttpResponseArray[i]);
                        }
                      }
                      console.log('clean array: ');
                      console.log(xhttpResponseArrayCleaned);

                      //we'll check the first submanifest only, assuming Zencoder does its job properly and if a submanifest/rendition is available then asset and renditions are ready to be played 
                      if(xhttpResponseArrayCleaned[0].indexOf('.m3u8') > -1){
                        console.log('m3u8 manifest sill doesn\'t list ts segments, check again');
                        videojs.xhr(xhttpResponseArrayCleaned[0], callback)
                      }else{
                      //should be ts inside m3u8
                      //if we have less than 3 segments, keep checking every 15 seconds
                        if(xhttpResponseArrayCleaned.length < 3){
                          console.log('less than 3 segments, check again master m3u8');
                          setTimeout(function() {
                            checkLive(src_m3u8);
                          }, 15000);
                        }else{
                          //remove livecard and stop running
                          console.log('SUCCESS');

                          console.log('at least 3 segments available, ready to go!');

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