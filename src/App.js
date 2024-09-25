import './App.css';
import { useEffect, useState } from 'react';
import { CallClient } from "@azure/communication-calling";
import { Features } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from '@azure/communication-common';

let call;
let teamsMeetingJoinButton;
let callStateElement;
let recordingStateElement;
let callAgent;
const MEETING_LINK = "https://teams.microsoft.com/l/meetup-join/19%3ameeting_NmNhZjQzODItY2QzMC00ZDViLWIzNTctMjA3ZTBiNzZhY2Fl%40thread.v2/0?context=%7b%22Tid%22%3a%2264af2aee-7d6c-49ac-a409-192d3fee73b8%22%2c%22Oid%22%3a%2272f4579d-e889-41ed-88d2-78c4f3a16cbf%22%7d"

function App() {
  
  const [buttonDisable, setButtonDisable] = useState(true);

  useEffect(() => {
    
    init();
}, []);


  async function init() {
     teamsMeetingJoinButton = document.getElementById('join-meeting-button');
     callStateElement = document.getElementById('call-state');
     recordingStateElement = document.getElementById('recording-state');
      const callClient = new CallClient();
      const tokenCredential = new AzureCommunicationTokenCredential("eyJhbGciOiJSUzI1NiIsImtpZCI6IjExRkNCRjhEQzBFRTMzQUY3QkIwQTE3OUUzNjI0RUNBNjk1ODE2NjQiLCJ4NXQiOiJFZnlfamNEdU02OTdzS0Y1NDJKT3ltbFlGbVEiLCJ0eXAiOiJKV1QifQ.eyJza3lwZWlkIjoiYWNzOmRkZWJlY2NmLTAxN2QtNGYxMC1iYjNiLTQ0NDRhNWRmOTRjYl8wMDAwMDAyMi1jODEyLWUyNDAtZjVmNC1hZDNhMGQwMDg4NzMiLCJzY3AiOjE3OTIsImNzaSI6IjE3MjcyNTExNjgiLCJleHAiOjE3MjczMzc1NjgsInJnbiI6ImVtZWEiLCJhY3NTY29wZSI6ImNoYXQsdm9pcCIsInJlc291cmNlSWQiOiJkZGViZWNjZi0wMTdkLTRmMTAtYmIzYi00NDQ0YTVkZjk0Y2IiLCJyZXNvdXJjZUxvY2F0aW9uIjoiZXVyb3BlIiwiaWF0IjoxNzI3MjUxMTY4fQ.ip5tzYiwyY7DUpbGWXWeHuTYpCnPnhu3upstr9ugPpYylhVgJhx3eCwALLF9VdcnrTZj5EF_D4cqmNQiHXl1SItL2Il1sDkolSuVncEvnRxR3W9943N-R5SpVN1eyL--sd8a1PErBK5XHQmWqKxOWG7l0nDFdAMfXTr4R1EnpQjQCgbZbMY1OlYj7coLWQJEkq4JAZXO8ZD3CETplau4JFTIkpURMNrnMiuWPP29PCcSnITMoCdRyPhxLCF9P7_zjpgU5Xz8QuYWAX0tT_cFazHfB6ad4tmrI8XnFIwE9newiHMVsEtG4bX3ENuqe1Y_y3oAd9YEt0c_RNA4vzINGg");
      callAgent = await callClient.createCallAgent(tokenCredential, { displayName: 'Holopod User' });
      teamsMeetingJoinButton.disabled = false;
  }
  
  function joinMeeting(){
    call = callAgent.join({ meetingLink: MEETING_LINK }, {});
    
    call.on('stateChanged', () => {
        callStateElement.innerText = call.state;
    })

    call.feature(Features.Recording).on('isRecordingActiveChanged', () => {
        if (call.feature(Features.Recording).isRecordingActive) {
            recordingStateElement.innerText = "This call is being recorded";
        }
        else {
            recordingStateElement.innerText = "";
        }
    });
    setButtonDisable(false);
    
    teamsMeetingJoinButton.disabled = true;
  }


  async function leaveTeamsMeeting() {
    await call.hangUp();
      teamsMeetingJoinButton.disabled = false;
      callStateElement.innerText = '-';
      setButtonDisable(true)
  }

  
  return (
    <div className="App">
         <h4>Azure Communication Services</h4>
    <h1>Teams meeting join quickstart</h1>
    <input id="teams-link-input" type="text" placeholder="Teams meeting link" />
    <p>Call state <span id="call-state">-</span></p>
    <p><span  id="recording-state"></span></p>
    <div>
        <button id="join-meeting-button" type="button" disabled={false} onClick={()=> joinMeeting()}>
            Join Teams Meeting
        </button>
        <button id="hang-up-button" type="button" disabled={buttonDisable ? true : false} onClick={async ()=>await leaveTeamsMeeting()}>
            Hang Up
        </button>
    </div>
    </div>
  );
}

export default App;
