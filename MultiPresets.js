/*  Camera Preserts Version 1.2  Frank Reijn
This SOFTWARE PRODUCT is provided "as is" and "with all faults." 
There is no representations or warranties of any kind concerning the safety,
suitability, lack of viruses, inaccuracies, typographical errors,or 
other harmful components of this SOFTWARE PRODUCT. There are inherent 
dangers in the use of any software, and you are solely responsible for 
determining whether this SOFTWARE PRODUCT is compatible with your equipment 
and other software installed on your equipment. 
You are also solely responsible for the protection of your equipment 
and backup of your data, and THE PROVIDER will not be liable for any damages
you may suffer in connection with using, modifying, or distributing this SOFTWARE PRODUCT.
- How to :  Speakertrack wil be de-activate when GUI is activated and does STAY de-activated!
            Longpress a number does store the current active camera position , focus and zoom.
            Focus WhiteBalance Brightness..  Easy I hope
            EasterEgg, press the Smily button.  Position the camera for a wide view. 
            Longpress the Smily to store the positions.  Find a suggestion position in the settings tab.
            in the Settings there is a button for a suggestion camera position. 
*/
const xapi = require('xapi');

const CAMERAID_CAMERA_LEFT = 1;
const CAMERAID_CAMERA_RIGHT = 2;

const CAMERACONNECTORID_CAMERA_LEFT = 1;
const CAMERACONNECTORID_CAMERA_RIGHT = 2;

// Long Press times values
const everysecond = 1500; // In milliseconds
var longp = 0; //longpress flag
var timerId= 0;

let camera1active = true;
let camera2active = false;
let camno =0;

// focus var's
let focuslevel = 4200;
let focusstepper = 100;
let focusstr = '10';

//Brightness
let Brightval = 20;

//WhiteBalance
let WBval = 1;

let initstate = 0;   // only zero at first time !
let Easteregg = false;  // enter easteregg mode

xapi.event.on('UserInterface Extensions Page Action', (event) => {
  if(event.PageId == 'CamPresets'){
    if(event.Type == 'Opened'){
      if (initstate ==0){
        initstate = 10;
        setGuiValue('Autofocus', 'on');
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
          WidgetId: 'brtext',
          Value: 'A',
        });
        setGuiValue('bright', 'on');
        setGuiValue('Whitebalance', 'on');
        setGuiValue('standby', 'on');
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
          WidgetId: 'wbtext',
          Value: 'A',
        });
        //disable SpeakerTrack to avoid a runaway!
        xapi.status.get('Cameras SpeakerTrack Status').then((pstatus) => {
          if(pstatus == 'Active') {alert('', 'Please note : SpeakerTrack is now deactivated!!! ', 5)}});
            xapi.command('Cameras SpeakerTrack Deactivate');      
        }
      }       
    }
    //Focus page pressed
    if(event.PageId == 'Focus'){
      if(event.Type == 'Opened'){
        //xStatus Cameras Camera 1 Position Focus
        //grab current focus value
        camera1active &&xapi.status
        .get('Cameras Camera 1 Position Focus')
        .then((level) => {
            focuslevel=level;
        });
        camera2active &&xapi.status
        .get('Cameras Camera 2 Position Focus')
        .then((level) => {
            focuslevel = level;
        });
      }
    }
});

// Cam zoom in out
xapi.event.on('UserInterface Extensions Widget Action', (event) => {
  if(event.WidgetId == 'Zoom'){
    if(event.Type == 'pressed'){
      switch(event.Value){
        case 'increment':
          camera1active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_LEFT,  Zoom: 'In', ZoomSpeed : '15'});
          camera2active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_RIGHT, Zoom: 'In', ZoomSpeed : '15'});
          break;
        case 'decrement':
          camera1active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_LEFT,  Zoom: 'Out', ZoomSpeed : '15'});
          camera2active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_RIGHT, Zoom: 'Out', ZoomSpeed : '15'});
          break;
      }  
    }
    else if(event.Type == 'released'){
      camera1active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_LEFT, Zoom: 'Stop'});
      camera2active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_RIGHT,Zoom: 'Stop'});
    }
  }
    
  // Enable disable AutoFocus
  if(event.WidgetId == 'Autofocus'){
    if(event.Type == 'changed'){     
      if (event.Value == "on"){
        xapi.config.set('Cameras Camera 1 Focus Mode','Auto');
        xapi.config.set('Cameras Camera 2 Focus Mode','Auto');
      } else {
        xapi.config.set('Cameras Camera 1 Focus Mode','Manual');
        xapi.config.set('Cameras Camera 2 Focus Mode','Manual');
      }
    }
  } 

  
  // Set Focus inc/dec speed  100x 10x 1x
  if(event.WidgetId == 'fspeed'){
    if(event.Type == 'pressed'){
      focusstepper = parseInt(event.Value);       
    }
  } 

  //set focus distance  + or -
  if(event.WidgetId == 'Focusset'){
    if(event.Type == 'pressed'){
      switch(event.Value){
        case 'increment':
          focuslevel = focuslevel +focusstepper;
          focusstr=`${focuslevel}`;
          break;
        case 'decrement':
          focuslevel = focuslevel -focusstepper;
          focusstr=`${focuslevel}`;              
          break;
        }
      camera1active && xapi.command("Camera PositionSet", {CameraId: CAMERAID_CAMERA_LEFT,Focus:focusstr});
      camera2active && xapi.command("Camera PositionSet", {CameraId: CAMERAID_CAMERA_RIGHT,Focus:focusstr});
    }
    else if(event.Type == 'released'){
      // update the value to the Gui
      xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'Focusset',
        Value: focuslevel,
      });
    }
  }


  // Enable disable Brightness
  if(event.WidgetId == 'bright'){
    if(event.Type == 'changed'){     
      if (event.Value == "on"){
        xapi.config.set('Cameras Camera 1 Brightness Mode','Auto');
        xapi.config.set('Cameras Camera 2 Brightness Mode','Auto');
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'brtext',
        Value: 'A',
        });
      } else {
        xapi.config.set('Cameras Camera 1 Brightness Mode','Manual');
        xapi.config.set('Cameras Camera 2 Brightness Mode','Manual');
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'brtext',
        Value: '20',
        });
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'brightset',
        Value: '255',
        });
      }  
    }
  } 


  //set Brightness slider
  if(event.WidgetId == 'brightset'){
    if(event.Type == 'pressed'){
    //none
    }
    else if(event.Type == 'released'){
      Brightval = parseInt(Math.floor((event.Value * 0.1)));
      camera1active && xapi.config.set('Cameras Camera 1 Brightness DefaultLevel',Brightval);
      camera1active && xapi.config.set('Cameras Camera 2 Brightness DefaultLevel',Brightval); 
      // update the value to the Gui
      xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'brtext',
        Value: Brightval,
      });
    }
  }


  // Enable disable WhiteBalance
  if(event.WidgetId == 'Whitebalance'){
    if(event.Type == 'changed'){     
      if (event.Value == "on"){
        xapi.config.set('Cameras Camera 1 Whitebalance Mode','Auto');
        xapi.config.set('Cameras Camera 2 Whitebalance Mode','Auto');
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'wbtext',
        Value: 'A',
      });
      } else {
        xapi.config.set('Cameras Camera 1 Whitebalance Mode','Manual');
        xapi.config.set('Cameras Camera 2 Whitebalance Mode','Manual');
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'wbset',
        Value: '255',
        });
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'wbtext',
        Value: '16',
        });
      }  
    }
  }

  //set WhiteBalance slider
  if(event.WidgetId == 'wbset'){
    if(event.Type == 'pressed'){
      //none
    }
    else if(event.Type == 'released'){
      WBval = parseInt(Math.floor((event.Value * 0.064)));
      camera1active && xapi.config.set('Cameras Camera 1 Whitebalance Level',WBval);
      camera2active && xapi.config.set('Cameras Camera 2 Whitebalance Level',WBval);
      // update the value to the Gui
      xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'wbtext',
        Value: WBval,
      });
    }
  }

  //cam position left right up down
  if(event.WidgetId == 'NESW'){
    if(event.Type == 'pressed'){
      //start timer for long press check
      timerId = setInterval(longpress, everysecond); 
      switch(event.Value){
        case 'right':
          if(camera1active && camera2active){
            //noop
          }
          else{
            camera1active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_LEFT,  Pan: 'Right'});
            camera2active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_RIGHT, Pan: 'Right'});
          }
          break;
        case 'left':
          if(camera1active && camera2active){
            //noop
          }
          else{
            camera1active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_LEFT,  Pan: 'Left'});
            camera2active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_RIGHT, Pan: 'Left'});
          }
          break;
        case 'up':
          camera1active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_LEFT,  Tilt: 'Up'});
          camera2active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_RIGHT, Tilt: 'Up'});
          break;
        case 'down':
          camera1active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_LEFT,  Tilt: 'Down'});
          camera2active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_RIGHT, Tilt: 'Down'});
          break;
        case 'center':
          //Set crazy wide view  ( easter egg )
          //camera1active = true;
          //camera2active = true;                
          break;
        default:
          console.log(`Unhandled Navigation`);
        }
      }
      else if(event.Type == 'released'){
        camera1active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_LEFT, Tilt: 'Stop',Pan: 'Stop'});
        camera2active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_RIGHT,Tilt: 'Stop',Pan: 'Stop'});
        //Long Press stuff
        clearInterval(timerId);  //stop the timer
          if (longp==1){
            longp=0;  //clear long flag
            if (event.Value == 'center'){
              xapi.command("Camera Preset Store", {PresetId: '14', CameraId: CAMERAID_CAMERA_LEFT });
              xapi.command("Camera Preset Store", {PresetId: '13', CameraId: CAMERAID_CAMERA_RIGHT });
              alert('', 'EasterEgg Preset positions Saved', 3);
            }  
          }
          else {
            if (event.Value == 'center'){
              Easteregg = !Easteregg;
              if (Easteregg){  // Show Egg Text on GUI
                setGuiValue('eggtext', 'EggM');
              }
              else{
                setGuiValue('eggtext', '');
              }
              xapi.command("Camera Preset Activate",{PresetId: '13'});
              xapi.command("Camera Preset Activate",{PresetId: '14'});
              xapi.command("Video Input SetMainVideoSource", {ConnectorId: [CAMERACONNECTORID_CAMERA_LEFT, CAMERACONNECTORID_CAMERA_RIGHT]});
              //xapi.command("Video Input SetMainVideoSource", {ConnectorId: [CAMERACONNECTORID_CAMERA_RIGHT, CAMERACONNECTORID_CAMERA_LEFT]});
            }
          }  
        }
      }

    // set active cam 
    if(event.WidgetId == 'CamSelect'){
      if(event.Type == 'pressed'){
        switch(event.Value){
          case 'Cam1':
            if (!Easteregg){
              xapi.command("Video Input SetMainVideoSource", {ConnectorId: CAMERACONNECTORID_CAMERA_LEFT});
            }
            camera1active = true;
            camera2active = false;   
            break;
          case 'Cam2':
            if (!Easteregg){
              xapi.command("Video Input SetMainVideoSource", {ConnectorId: CAMERACONNECTORID_CAMERA_RIGHT});
            }
            camera2active = true;
            camera1active = false;   
          default:
            console.log(`Unhandled Navigation`);
        }
      } 
    }
     
    // Enable Selfview 
    if(event.WidgetId == 'SelfView'){
      if(event.Type == 'changed'){     
        if (event.Value == "on"){
          xapi.command("Video Selfview Set", {Mode: 'On', FullscreenMode: 'On', OnMonitorRole: 'First'});
        } else {
          xapi.command("Video Selfview Set", {Mode: 'On', FullscreenMode: 'Off', OnMonitorRole: 'First'});
        }
      }
    }

    // Clear all presets
    if(event.WidgetId == 'ClearAll'){
      if(event.Type == 'pressed'){
        xapi.command('Userinterface Message Prompt Display', {
          Title: 'Camera Presets',
          Text: 'Erease ALL presets?',
          feedbackId: 'prompt0',
          'Option.1': 'Yes Please !!',
          'Option.2': 'No No No Cancel',
        });
      }
    }

    // Get or store preset button
    if(event.WidgetId == 'Preset'){
      if(event.Type == 'pressed'){
        timerId = setInterval(longpress, everysecond);
        switch(event.Value){    
          default:
          //nop
        }
      }
      else if(event.Type == 'released'){
        clearInterval(timerId);  //stop the timer
        if (longp==1){
          longp=0;  //clear long flag
          //store the active camera settings in a preset button.
          camera1active && xapi.command("Camera Preset Store", {PresetId: event.Value, CameraId: CAMERAID_CAMERA_LEFT });
          camera2active && xapi.command("Camera Preset Store", {PresetId: event.Value , CameraId: CAMERAID_CAMERA_RIGHT });
          alert('', 'Preset position Saved', 3);
        }
        else {
          // get camera in position of this preset
          xapi.command("Camera Preset Activate",{PresetId: event.Value });
        }     
      }
    }

    // Get or store preset button
    if(event.WidgetId == 'eggsuggestion'){
      if(event.Type == 'pressed'){
        if(Easteregg){
          xapi.command("Camera PositionSet", {CameraId: CAMERAID_CAMERA_LEFT,Tilt: '10',Pan: '4500',Zoom: '8500'});
          xapi.command("Camera PositionSet", {CameraId: CAMERAID_CAMERA_RIGHT,Tilt: '130',Pan: '-3700',Zoom: '8500'});
        }
        else {
          alert('', 'Please Activate EasterEgg first!!', 3);
        }
      }
    }

    // Enable disable auto Standby 
    if(event.WidgetId == 'standby'){
        if(event.Type == 'changed'){     
          if (event.Value == "on"){
            xapi.config.set('Standby Control:','On');
          } else {
            xapi.config.set('Standby Control:','Off');
          }
        }
      } 
});

// Debug utils
function listenToGui() {
  xapi.Event.UserInterface.Extensions.on((event) => {
    const msg = JSON.stringify(event);
    alertBigScreen('UI Extensions event', msg);
    console.log(msg);
  });
}
function alertBigScreen(title, text, duration = 5) {
  xapi.Command.UserInterface.Message.Alert.Display({
    Title: title,
    Text: text,
    Duration: duration,
  });
}
//listenToGui();   //remove comment to get debug output
// end of debug utils

// used and abused to sent notification to Tough10 and big screen
function alert(Title, Text, Duration = 5) {
  xapi.Command.UserInterface.Message.Alert.Display({ Title, Text, Duration });
}

// only to set the longpress flag :-)  from the timer
function longpress (){
  longp =1; // set longpress flag
}

// update the Gui
async function setGuiValue(id, value) {
  try {
    await xapi.Command.UserInterface.Extensions.Widget.SetValue({
      WidgetId: id,
      Value: value,
    })
  } catch (error) {
     console.error('Not able to set GUI value', id, value);
  }
}

xapi.event.on('UserInterface Message Prompt Response', (event) => {
  switch (event.FeedbackId + event.OptionId) {
    case 'prompt0' + '1':
      //xCommand Camera Preset Remove PresetId: PresetId
      xapi.command("Camera Preset Remove", {PresetId: '5'});
      xapi.command("Camera Preset Remove", {PresetId: '6'});
      xapi.command("Camera Preset Remove", {PresetId: '7'});
      xapi.command("Camera Preset Remove", {PresetId: '8'});
      xapi.command("Camera Preset Remove", {PresetId: '9'});
      xapi.command("Camera Preset Remove", {PresetId: '10'});
      xapi.command("Camera Preset Remove", {PresetId: '11'});
      xapi.command("Camera Preset Remove", {PresetId: '12'});
      xapi.command("Camera Preset Remove", {PresetId: '13'});
      xapi.command("Camera Preset Remove", {PresetId: '14'});
      alert('', 'All Preset setting cleared ', 3);
      break;  
  }
});
