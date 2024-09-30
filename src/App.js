import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
const { CallClient, VideoStreamRenderer, LocalVideoStream } = require('@azure/communication-calling');
const { AzureCommunicationTokenCredential } = require('@azure/communication-common');
const { AzureLogger, setLogLevel } = require("@azure/logger");


let callAgent;
let deviceManager;
let call;
let incomingCall;
let localVideoStream;
let localVideoStreamRenderer;

let initializeCallAgentButton = document.getElementById('initialize-call-agent');
let startCallButton = document.getElementById('start-call-button');
let acceptCallButton = document.getElementById('accept-call-button');
let remoteVideosGallery = document.getElementById('remoteVideosGallery');
let localVideoContainer = document.getElementById('localVideoContainer');

const USER_ACCESS_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjExRkNCRjhEQzBFRTMzQUY3QkIwQTE3OUUzNjI0RUNBNjk1ODE2NjQiLCJ4NXQiOiJFZnlfamNEdU02OTdzS0Y1NDJKT3ltbFlGbVEiLCJ0eXAiOiJKV1QifQ.eyJza3lwZWlkIjoiYWNzOmRkZWJlY2NmLTAxN2QtNGYxMC1iYjNiLTQ0NDRhNWRmOTRjYl8wMDAwMDAyMi1kMzdkLWJlYWItODc0YS1hZDNhMGQwMDc4ODgiLCJzY3AiOjE3OTIsImNzaSI6IjE3Mjc0NDI3MjEiLCJleHAiOjE3Mjc1MjkxMjEsInJnbiI6ImVtZWEiLCJhY3NTY29wZSI6ImNoYXQsdm9pcCIsInJlc291cmNlSWQiOiJkZGViZWNjZi0wMTdkLTRmMTAtYmIzYi00NDQ0YTVkZjk0Y2IiLCJyZXNvdXJjZUxvY2F0aW9uIjoiZXVyb3BlIiwiaWF0IjoxNzI3NDQyNzIxfQ.o5vzsBoqXwtONJO7xoHlwbrP4IVPixr_SoN1OZDppQQovalD5PNdXme22AT7pViKEcYyBeRp580wCWsE3ZqGspwGu5V3Nk3LyMy0nkYem3hoZoGPZ6bGAeA99okBaNcpOeQFQ-o158AYcsWwyuJcav4_ImDDna01BRtXuToC_kmLtlTkgl8kwGH8Xr28pD5WiMO9QyRKQSuxcAyjdCVoE6nac2_rTEEZfYItMyTSDBIKDJn1vXwkl4WUsK3RC6akds0eXbibLBYSHM-gFS4iAwaShVHfuwctWBztWQzTuvBSlzaxllE0BX5KVcu2GpCBd2_JvSD_rSdTvH_qHPGf2A"
const USER_CALLE_ID = "8:acs:ddebeccf-017d-4f10-bb3b-4444a5df94cb_00000022-d392-950a-a7ac-473a0d008847"

function App() {

  function fetchTokenFromGitHub() {
    return axios.get("https://api.github.com/repos/BiekeSurfOrg/acess-tokens/contents/acess-tokens.json", {
      headers: {
        "X-GitHub-Api-Version": "2022-11-28"
      }
    }).then((result => JSON.parse(atob(result.data.content).toString())
    ))
  }


  const [streamHidden, setStreamHidden] = useState(false);

  useEffect(() => {
    setLogLevel('verbose');
    AzureLogger.log = (...args) => {
      console.log(...args);
    };
    init();
  }, []);

  const init = async () => {
    try {
      const { caller, callee } = await fetchTokenFromGitHub()
      console.log("caller: ", caller, "callee: ", callee);

      const callClient = new CallClient();
      const tokenCredential = new AzureCommunicationTokenCredential(USER_ACCESS_TOKEN);
      callAgent = await callClient.createCallAgent(tokenCredential)
      // Set up a camera device to use.
      deviceManager = await callClient.getDeviceManager();
      await deviceManager.askDevicePermission({ video: true });
      await deviceManager.askDevicePermission({ audio: true });
      // Listen for an incoming call to accept.
      callAgent.on('incomingCall', async (args) => {
        try {
          incomingCall = args.incomingCall;
          acceptCallButton.disabled = false;
          startCallButton.disabled = true;
        } catch (error) {
          console.error(error);
        }
      });

      startCallButton.disabled = false;
      initializeCallAgentButton.disabled = true;
    } catch (error) {
      console.error(error);
    }
  }

  const startVideoCall = async () => {
    try {
      const localVideoStream = await createLocalVideoStream();
      const videoOptions = localVideoStream ? { localVideoStreams: [localVideoStream] } : undefined;
      call = callAgent.startCall([{ communicationUserId: USER_CALLE_ID }], { videoOptions });
      // Subscribe to the call's properties and events.
      subscribeToCall(call);
    } catch (error) {
      console.error(error);
    }
  }

  const acceptCall = async () => {
    try {
      const localVideoStream = await createLocalVideoStream();
      const videoOptions = localVideoStream ? { localVideoStreams: [localVideoStream] } : undefined;
      call = await incomingCall.accept({ videoOptions });
      // Subscribe to the call's properties and events.
      subscribeToCall(call);
    } catch (error) {
      console.error(error);
    }
  }

  const subscribeToCall = (call) => {
    try {
      // Inspect the initial call.id value.
      console.log(`Call Id: ${call.id}`);
      //Subscribe to call's 'idChanged' event for value changes.
      call.on('idChanged', () => {
        console.log(`Call Id changed: ${call.id}`);
      });

      // Inspect the initial call.state value.
      console.log(`Call state: ${call.state}`);
      // Subscribe to call's 'stateChanged' event for value changes.
      call.on('stateChanged', async () => {
        console.log(`Call state changed: ${call.state}`);
        if (call.state === 'Connected') {
        } else if (call.state === 'Disconnected') {
          console.log(`Call ended, call end reason={code=${call.callEndReason.code}, subCode=${call.callEndReason.subCode}}`);
        }
      });

      call.on('isLocalVideoStartedChanged', () => {
        console.log(`isLocalVideoStarted changed: ${call.isLocalVideoStarted}`);
      });
      console.log(`isLocalVideoStarted: ${call.isLocalVideoStarted}`);
      call.localVideoStreams.forEach(async (lvs) => {
        localVideoStream = lvs;
        await displayLocalVideoStream();
      });
      call.on('localVideoStreamsUpdated', e => {
        e.added.forEach(async (lvs) => {
          localVideoStream = lvs;
          await displayLocalVideoStream();
        });
        e.removed.forEach(lvs => {
          removeLocalVideoStream();
        });
      });

      // Inspect the call's current remote participants and subscribe to them.
      call.remoteParticipants.forEach(remoteParticipant => {
        subscribeToRemoteParticipant(remoteParticipant);
      });
      // Subscribe to the call's 'remoteParticipantsUpdated' event to be
      // notified when new participants are added to the call or removed from the call.
      call.on('remoteParticipantsUpdated', e => {
        // Subscribe to new remote participants that are added to the call.
        e.added.forEach(remoteParticipant => {
          subscribeToRemoteParticipant(remoteParticipant)
        });
        // Unsubscribe from participants that are removed from the call
        e.removed.forEach(remoteParticipant => {
          console.log('Remote participant removed from the call.');
        });
      });
    } catch (error) {
      console.error(error);
    }
  }

  const subscribeToRemoteParticipant = (remoteParticipant) => {
    try {
      // Inspect the initial remoteParticipant.state value.
      console.log(`Remote participant state: ${remoteParticipant.state}`);
      // Subscribe to remoteParticipant's 'stateChanged' event for value changes.
      remoteParticipant.on('stateChanged', () => {
        console.log(`Remote participant state changed: ${remoteParticipant.state}`);
      });

      // Inspect the remoteParticipants's current videoStreams and subscribe to them.
      remoteParticipant.videoStreams.forEach(remoteVideoStream => {
        subscribeToRemoteVideoStream(remoteVideoStream)
      });
      // Subscribe to the remoteParticipant's 'videoStreamsUpdated' event to be
      // notified when the remoteParticiapant adds new videoStreams and removes video streams.
      remoteParticipant.on('videoStreamsUpdated', e => {
        // Subscribe to new remote participant's video streams that were added.
        e.added.forEach(remoteVideoStream => {
          subscribeToRemoteVideoStream(remoteVideoStream)
        });
        // Unsubscribe from remote participant's video streams that were removed.
        e.removed.forEach(remoteVideoStream => {
          console.log('Remote participant video stream was removed.');
        })
      });
    } catch (error) {
      console.error(error);
    }
  }

  const subscribeToRemoteVideoStream = async (remoteVideoStream) => {
    let renderer = new VideoStreamRenderer(remoteVideoStream);
    let view;
    let remoteVideoContainer = document.createElement('div');
    remoteVideoContainer.className = 'remote-video-container';

    let loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'loading-spinner';
    remoteVideoStream.on('isReceivingChanged', () => {
      try {
        if (remoteVideoStream.isAvailable) {
          const isReceiving = remoteVideoStream.isReceiving;
          const isLoadingSpinnerActive = remoteVideoContainer.contains(loadingSpinner);
          if (!isReceiving && !isLoadingSpinnerActive) {
            remoteVideoContainer.appendChild(loadingSpinner);
          } else if (isReceiving && isLoadingSpinnerActive) {
            remoteVideoContainer.removeChild(loadingSpinner);
          }
        }
      } catch (e) {
        console.error(e);
      }
    });

    const createView = async () => {
      // Create a renderer view for the remote video stream.
      view = await renderer.createView();
      // Attach the renderer view to the UI.
      remoteVideoContainer.appendChild(view.target);
      remoteVideosGallery.appendChild(remoteVideoContainer);
    }

    // Remote participant has switched video on/off
    remoteVideoStream.on('isAvailableChanged', async () => {
      try {
        if (remoteVideoStream.isAvailable) {
          await createView();
        } else {
          view.dispose();
          remoteVideosGallery.removeChild(remoteVideoContainer);
        }
      } catch (e) {
        console.error(e);
      }
    });

    // Remote participant has video on initially.
    if (remoteVideoStream.isAvailable) {
      try {
        await createView();
      } catch (e) {
        console.error(e);
      }
    }
  }


  const stopVideo = async () => {
    try {
      await call.stopVideo(localVideoStream);
    } catch (error) {
      console.error(error);
    }
  }


  const createLocalVideoStream = async () => {
    const camera = (await deviceManager.getCameras())[0];
    if (camera) {
      return new LocalVideoStream(camera);
    } else {
      console.error(`No camera device found on the system`);
    }
  }

  /**
   * Display your local video stream preview in your UI
   */
  const displayLocalVideoStream = async () => {
    try {
      localVideoStreamRenderer = new VideoStreamRenderer(localVideoStream);
      const view = await localVideoStreamRenderer.createView();
      setStreamHidden(false)
      alert(view.target)
      localVideoContainer.appendChild(view.target);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Remove your local video stream preview from your UI
   */
  const removeLocalVideoStream = async () => {
    try {
      localVideoStreamRenderer.dispose();
      setStreamHidden(true)
    } catch (error) {
      console.error(error);
    }
  }

  const hangUp = async () => {
    await call.hangUp()
  }

  return (
    <div>
      <h4>Azure Communication Services - Calling Web SDK</h4>
      <button id="start-call-button" type="button" onClick={() => startVideoCall()}>Start Call</button>
      <button id="hangup-call-button" type="button" >Hang up Call</button>
      <button id="accept-call-button" type="button" >Accept Call</button>
      <button id="start-video-button" type="button">Start Video</button>
      <button id="stop-video-button" type="button">Stop Video</button>
      <br />
      <br />
      <div id="connectedLabel" >Call is connected!</div>
      <br />
      <div id="remoteVideosGallery" >Remote participants' video streams:</div>
      <br />
      <div id="localVideoContainer" >Local video stream:</div>
      <script src="./main.js"></script>
    </div>
  );
}


export default App;
