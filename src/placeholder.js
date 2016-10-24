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
      if ((errNo === 4 && duration === 0) || (errNo === 4 && duration === -1) || (errNo === 4 && duration === Infinity)){
        console.log('*** ERROR ***');
        console.log(errNo);
        console.log('*** DURATION ***');
        console.log(duration);
        this.open();
        player.error(null);
      }

    this.el_.style.backgroundImage = `url(${options.imageUrl})`;
    let placeHolderMsg = document.createElement('label'),
        placeHolderSpin = document.createElement('span');

    placeHolderMsg.className = 'vjs-placeHolderMsg';
    placeHolderSpin.className = 'vjs-placeHolderSpin';

    placeHolderMsg.innerHTML = options.holdText;
    this.el_.appendChild(placeHolderMsg);
    this.el_.appendChild(placeHolderSpin);

    /* SCRIPT IN DRAFT VERSION, NOT CURRENTLY WORKING AS THE ASSET DOESN'T PLAY ONCE VAILD TS SEGMENTS HAVE BEEN FOUND. PLEASE READ COMMENTS IN GITHUB FOR MORE*/
    
    //Start pinging the source file for a response and dynamically switch to the live media when ready. This was tested with DVR and NON-DVR environments but only through the Brightcove live module which expects an m3u8 as a valid response.

      //trigger spin
      let spin = document.getElementsByClassName('vjs-placeHolderSpin');
      spin[0].style.display='block';
      
      let src_array = player.mediainfo.sources,

      //we assume the first item in the array is M3U8 when using the live module and only this one will be tested in this release
      src_m3u8 = src_array[0].src;

      console.log('SOURCES: ');
      console.log(src_array);

      console.log('M3U8: ');
      console.log(src_m3u8);

      //fire the checklive function
      checkLive(src_m3u8);

      xhttp.onreadystatechange = function() {

        //trigger spin
        spin[0].style.display='block';
          
          //if xhr call has been made but there's an error in the response (most likely response is 'Stream not found' then there is no live stream yet as the current manifest is empty)
          if (xhttp.readyState == 4 && xhttp.status == 404){
            console.log('xhttp onreadystatechange with status 404: ');
            console.log(xhttp.responseText);          

            //hide spin
            spin[0].style.display='none';

            console.log('...checking again in 15 seconds...');

            //check again in 15 seconds
              setTimeout(function() {
                checkLive(src_m3u8);
              }, 15000);

          //if xhr call has been made and is successful, we still need to check the response of each individual manifest in the master one
          }else if (xhttp.readyState == 4 && xhttp.status == 200){
            let xhttpResponse = xhttp.responseText,
                xhttpResponseArray,
                xhttpResponseArrayCleaned = new Array(),
                nRequest = new Array();

          //as soon as a stream has started, the manifest will list m3u8s, it cannot be empty again BUT the m3u8s in it will be empty after DVR expiration or if one starts a new stream from within the module but doesn't actually stream (tested with DVR enabled, would need to test without DVR).
            console.log('*xhttp onreadystatechange with status 200: ');
            console.log(xhttpResponse);

          //so we need to loop through all the URLs in the master manifest, assuming all URLs don't start with #
            xhttpResponseArray = xhttpResponse.split('\n');
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

            //loop through the cleaned array one final time
            for (i=0; i < xhttpResponseArrayCleaned.length; i++){
                (function(i) {
                  nRequest[i] = new XMLHttpRequest();
                  nRequest[i].open("GET", xhttpResponseArrayCleaned[i], true);
                
                  nRequest[i].onreadystatechange = function (oEvent) {

                  //if unsuccessful, keep checking other submanifests
                  if (nRequest[i].readyState == 4 && nRequest[i].status == 404){
                    console.log('Error: ' + nRequest[i].statusText);
                    console.log('done... checking again in 15 seconds');

                      //last loop, set timeout to fire the checklive function again in 15 seconds
                      if(i == xhttpResponseArrayCleaned.length-1){

                        //hide spin
                        spin[0].style.display='none';

                        setTimeout(function() {
                          checkLive(src_m3u8);
                        }, 15000);
                      }

                  //as soon as ONE submanifest is valid, then check that there are at least 3 segments available before playing (same procedure as before)
                  }else if (nRequest[i].readyState == 4 && nRequest[i].status == 200){
                    console.log('Segments found, checking that there are at least 3');
                    console.log(nRequest[i].responseText);

                    let tsResponse = nRequest[i].responseText,
                        tsResponseArray,
                        tsResponseArrayCleaned = new Array();

                    tsResponseArray = tsResponse.split('\n');
                    console.log('ts array: ');
                    console.log(tsResponseArray);

                    //loop through and create a cleaned array with the segments only
                      for (i=0; i < tsResponseArray.length; i++){
                        if(tsResponseArray[i].charAt(0) != '#' && tsResponseArray[i]){
                          tsResponseArrayCleaned.push(tsResponseArray[i]);
                        }
                      }
                      console.log('ts clean array: ');
                      console.log(tsResponseArrayCleaned);

                      console.log('how many segments?');
                      console.log(tsResponseArrayCleaned.length);

                      //if we have less than 3 segments, keep checking every 15 seconds
                        if(tsResponseArrayCleaned.length < 3){
                          console.log('less than 3 segments, check again master m3u8');
                          setTimeout(function() {
                            checkLive(src_m3u8);
                          }, 15000);
                        }else{
                          console.log('at least 3 segments available, ready to go!');

                          //remove livecard and stop running
                          console.log('SUCCESS');

                          //hide spin
                          spin[0].style.display='none';

                          //remove livecard
                          player.liveCardModal.close();

                          //player loads current stream
                          player.load();

                          //LEAVE LOOP otherwise it will test other submanifests
                          return false;
                        }
                  }
                };
                nRequest[i].send();
              })(i);
            } //end of loop
          }
        };
    });

    let xhttp = new XMLHttpRequest();

      function checkLive(url){
        xhttp.open('GET', url, true);
        xhttp.send();
      };
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