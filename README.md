# Teams Integration 

## Available Scripts

In the project directory, you can run:

### `npm run start-dev`

to start the local env server

## Starting the project

cd into the project folder / open a terminal from the IDE and run `npm install`, after everything is installed run `npm run start-dev`

## Components 

there is one component the App component.

All of the logic for the azure teams integration is in this component - time constrains

## Functions

   There are 6 main functions:
1. init()
2. fetchTokenFromGitHub()
3. startVideoCall()
4. hangUpVideoCall()
5. startVideoInCall()
6. stopVideoInCall()

init: Called on component render via the `useEffect` lifecycle hook initializes the call agent and calls all of the helper funtions.

fetchTokenFromGitHub: Fetches and sets the right access tokens and identities from a Json file in my (BorisStankov98)'s account.

startVideoCall: Calls the identity which is set by the fetchTokenFromGitHub function and updates the state of the buttons.

hangUpVideoCall: Hangs up the call and updates the state of the buttons.

startVideoInCall: Starts the camera while already in the call and updates the state of the buttons.

stopVideoInCall: Stops the camera while already in the call and updates the state of the buttons.

 
