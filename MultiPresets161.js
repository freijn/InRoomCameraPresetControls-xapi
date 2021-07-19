/*  Camera Preserts Version 1.6.1  Frank Reijn  2021-06-25
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
            EasterEgg, press the Smiley button.  Position the camera for a wide view. 
            Longpress the Smily to store the positions.  Find a suggestion position in the settings tab.
            in the Settings there is a button for a suggestion camera position. 
Change history:
  2021-03-18
- 3 Camera control implemented
- Proximity on/off implemented
- Standby on/off implemented

2021-04-01
- rewite of the focus routine
- rewrite of the brightness routine
- rewite of the storage routine.

2021-06-25
- bug fixed brightness camera 1 2 3
- bug fixed UltraSound
- bug fixed Selfview
*/


const xapi = require('xapi');

const CAMERAID_CAMERA_LEFT = 1;
const CAMERAID_CAMERA_RIGHT = 2;
const CAMERAID_CAMERA_THREE = 3;

const CAMERACONNECTORID_CAMERA_LEFT = 1;
const CAMERACONNECTORID_CAMERA_RIGHT = 2;
const CAMERACONNECTORID_CAMERA_THREE = 3;

// Long Press times values
const everysecond = 1500; // In milliseconds
const everyminute = 1000*60; // In milliseconds
var longp = 0; //longpress flag
var timerId= 0; // seconds for long press count
var standbyTimer = 0; //keep the system awake timer

let camera1active = true;
let camera2active = false;
let camera3active = false;

let camno =0;

// focus var's
let Tfocuslevel = 4200;
let Tfocusstepper = 1;
let Tfocusstr = '10';
let TfocusDir = 1;  // focus direction
var F1timerId= 0; // x 1 count
var F2timerId= 0; // x 10 count
var F3timerId= 0; // x 100 count
var F4timerId= 0; // x 1000 count
//Focus longpress timers
const F1seconds = 300; // In milliseconds
const F2seconds = 1000*3; // In milliseconds
const F3seconds = 1000*7; // In milliseconds
const F4seconds = 1000*10; // In milliseconds


//Brightness
let Brightval1 = 31;   // value only 1-31
let Brightval2 = 31;   // value only 1-31
let Brightval3 = 31;   // value only 1-31

//WhiteBalance
let WBval1 = 7;  // value only 1-7
let WBval2 = 7;  // value only 1-7
let WBval3 = 7;  // value only 1-7

let initstate = 0;   // only zero at first time !
let Easteregg = false;  // enter easteregg mode



xapi.event.on('UserInterface Extensions Page Action', (event) => {
  if(event.PageId == 'CamPresets'){
    if(event.Type == 'Opened'){
      if (initstate ==0){
        initstate = 10;
        // set initial state of the Gui
        setGuiValue('Autofocus', 'on');
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'fspeedmultip',
        Value: 'X1',
        });
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
              WidgetId: 'activecamnumber',
              Value: 'Active Camera 1',
            });
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
              WidgetId: 'remember',
              Value: ' ',
        }); 
        setGuiValue('bright1', 'on');
        setGuiValue('bright2', 'on');
        setGuiValue('bright3', 'on');
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'brtext1',
        Value: 'A',
        });
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'brtext2',
        Value: 'A',
        });
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'brtext3',
        Value: 'A',
        });
        setGuiValue('Whitebalance1', 'on');
        setGuiValue('Whitebalance2', 'on');
        setGuiValue('Whitebalance3', 'on');
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'wbtext1',
        Value: 'A',});
      xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'wbtext2',
        Value: 'A',});
      xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'wbtext3',
        Value: 'A',});
        setGuiValue('standby', 'on');
        setGuiValue('ultrasonic', 'off');
        //disable SpeakerTrack to avoid a runaway!
        xapi.status.get('Cameras SpeakerTrack Status').then((pstatus) => {
          if(pstatus == 'Active') {alert('', 'Please note : SpeakerTrack & Proximity now deactivated!!! ', 5)}});
            xapi.command('Cameras SpeakerTrack Deactivate');
            xapi.command('Proximity Services Deactivate');      
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
            Tfocuslevel=level;
        });
        camera2active &&xapi.status
        .get('Cameras Camera 2 Position Focus')
        .then((level) => {
            Tfocuslevel = level;
        });
         camera3active &&xapi.status
        .get('Cameras Camera 3 Position Focus')
        .then((level) => {
            Tfocuslevel = level;
        });
        // update the value to the Gui 
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
          WidgetId: 'widget_30',
          Value: Tfocuslevel,
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
          camera3active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_THREE, Zoom: 'In', ZoomSpeed : '15'});
          break;
        case 'decrement':
          camera1active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_LEFT,  Zoom: 'Out', ZoomSpeed : '15'});
          camera2active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_RIGHT, Zoom: 'Out', ZoomSpeed : '15'});
          camera3active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_THREE, Zoom: 'Out', ZoomSpeed : '15'});
          break;
      }  
    }
    else if(event.Type == 'released'){
      camera1active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_LEFT, Zoom: 'Stop'});
      camera2active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_RIGHT,Zoom: 'Stop'});
      camera3active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_THREE,Zoom: 'Stop'});
    }
  }
    
  // Enable disable AutoFocus
  if(event.WidgetId == 'Autofocus'){
    //console.log('autofocus routine' )
    if(event.Type == 'changed'){     
      if (event.Value == "on"){
        camera1active && xapi.config.set('Cameras Camera 1 Focus Mode','Auto');
        camera2active && xapi.config.set('Cameras Camera 2 Focus Mode','Auto');
        camera3active && xapi.config.set('Cameras Camera 3 Focus Mode','Auto');
      } else {
        camera1active && xapi.config.set('Cameras Camera 1 Focus Mode','Manual');
        camera2active && xapi.config.set('Cameras Camera 2 Focus Mode','Manual');
        camera3active && xapi.config.set('Cameras Camera 3 Focus Mode','Manual');
      }
    }
  } 


//_________________________________________________________________________
//_______Focus ____________________________________________________________
//_________________________________________________________________________

//set focus distance  + or -    widget_30
  if(event.WidgetId == 'widget_30'){
    if(event.Type == 'pressed'){
      switch(event.Value){
        case 'increment':
          TfocusDir = 1;
          Tfocuslevel = Tfocuslevel + 1;
          if (Tfocuslevel > 65000) {
            xapi.Command.UserInterface.Extensions.Widget.SetValue({
              WidgetId: 'fspeedmultip',
              Value: '!!MAX!!',
            }); 
          Tfocuslevel =65000;  // min  
          }
          break;
        case 'decrement':
          TfocusDir = 0;
          Tfocuslevel = Tfocuslevel - 1;
          if (Tfocuslevel < 0) {
            xapi.Command.UserInterface.Extensions.Widget.SetValue({
              WidgetId: 'fspeedmultip',
              Value: '!!MIN!!',
            }); 
            Tfocuslevel =0;  // min  
          }            
          break;
        }  
      //start timer for long press check
      F1timerId = setInterval(F1press, F1seconds);
      F2timerId = setInterval(F2press, F2seconds);
      F3timerId = setInterval(F3press, F3seconds);
      F4timerId = setInterval(F4press, F4seconds);   
      xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'fspeedmultip',
        Value: 'X1',
        });
      xapi.Command.UserInterface.Extensions.Widget.SetValue({
              WidgetId: 'remember',
              Value: 'Please Store your settings on a Preset!!',
        });
      Tfocusstr=`${Tfocuslevel}`;         
      camera1active && xapi.command("Camera PositionSet", {CameraId: CAMERAID_CAMERA_LEFT,Focus:Tfocusstr});
      camera2active && xapi.command("Camera PositionSet", {CameraId: CAMERAID_CAMERA_RIGHT,Focus:Tfocusstr});
      camera3active && xapi.command("Camera PositionSet", {CameraId: CAMERAID_CAMERA_THREE,Focus:Tfocusstr});
    }
    else if(event.Type == 'released'){
      //clear all timers
      clearInterval(F1timerId);  //stop the timer
      clearInterval(F2timerId);  //stop the timer
      clearInterval(F3timerId);  //stop the timer
      clearInterval(F4timerId);  //stop the timer
      //Reset focus stepper
      Tfocusstepper =1;
      // update the value to the Gui
      xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'fspeedmultip',
        Value: 'X1',
        }); 
      xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'widget_30',
        Value: Tfocuslevel,
      });
    }
  }

// handle the longpress Focus from the timer  to max 65535
function F1press (){
  if (TfocusDir)
    if (Tfocuslevel > 65535) {
      xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'fspeedmultip',
        Value: '!!MAX!!',
        });
    Tfocuslevel = 65535;    // max 
    }
    else {
      Tfocuslevel = Tfocuslevel + Tfocusstepper;
    }
  else{
    if (Tfocuslevel < 0) {
      xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'fspeedmultip',
        Value: '!!MIN!!',
        }); 
    Tfocuslevel =0;  // min  
    }
    else {
    Tfocuslevel = Tfocuslevel - Tfocusstepper;
    }
  }
  // update the value to the Gui 
  xapi.Command.UserInterface.Extensions.Widget.SetValue({
    WidgetId: 'widget_30',
    Value: Tfocuslevel,
  });
  Tfocusstr=`${Tfocuslevel}`;
  camera1active && xapi.command("Camera PositionSet", {CameraId: CAMERAID_CAMERA_LEFT,Focus:Tfocusstr});
  camera2active && xapi.command("Camera PositionSet", {CameraId: CAMERAID_CAMERA_RIGHT,Focus:Tfocusstr});
  camera3active && xapi.command("Camera PositionSet", {CameraId: CAMERAID_CAMERA_THREE,Focus:Tfocusstr});
}

function F2press (){
  clearInterval(F2timerId);  //stop the timer
  Tfocusstepper = 10;
  xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'fspeedmultip',
        Value: 'X10',
        }); 
}
function F3press (){
  clearInterval(F3timerId);  //stop the timer
  Tfocusstepper = 100;
  xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'fspeedmultip',
        Value: 'X100',
        }); 
}
function F4press (){
  clearInterval(F3timerId);  //stop the timer
  Tfocusstepper = 1000;
  xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'fspeedmultip',
        Value: 'X1000',
        }); 
}



//________________________________________________________________________
//_______Brightness ______________________________________________________
//________________________________________________________________________

  // Enable disable Brightness
  if(event.WidgetId == 'bright1'){
    if(event.Type == 'changed'){     
      if (event.Value == "on"){
        xapi.config.set('Cameras Camera 1 Brightness Mode','Auto');
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'brtext1',
        Value: 'A',
        });
      } else {
        xapi.config.set('Cameras Camera 1 Brightness Mode','Manual');
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'brtext1',
        Value: Brightval1,
        });
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'brightset1',
        Value: '255',
        });
      }
    }
  }

  if(event.WidgetId == 'bright2'){
    if(event.Type == 'changed'){     
      if (event.Value == "on"){
        xapi.config.set('Cameras Camera 2 Brightness Mode','Auto');
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'brtext2',
        Value: 'A',
        });
      } else {
        xapi.config.set('Cameras Camera 2 Brightness Mode','Manual');
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'brtext2',
        Value: Brightval2,
        });
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'brightset',
        Value: '255',
        });
      }
    }
  } 
 
  if(event.WidgetId == 'bright3'){
    if(event.Type == 'changed'){     
      if (event.Value == "on"){
        xapi.config.set('Cameras Camera 3 Brightness Mode','Auto');
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'brtext3',
        Value: 'A',
        });
      } else {
        xapi.config.set('Cameras Camera 3 Brightness Mode','Manual');
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'brtext3',
        Value: Brightval3,
        });
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'brightset3',
        Value: '255',
        });
      }
    }
  } 

  //set Brightness slider  1  2  3
  if(event.WidgetId == 'brightset1'){
    if(event.Type == 'pressed'){
    //none
    }
    else if(event.Type == 'released'){
      Brightval1 = parseInt(Math.floor((event.Value * 0.121)));
      //console.log('val=' + event.Value + 'Bright=' + Brightval );
      xapi.config.set('Cameras Camera 1 Brightness DefaultLevel',Brightval1);
      // update the value to the Gui
      xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'brtext1',
        Value: Brightval1,
      });
    }
  }

if(event.WidgetId == 'brightset2'){
    if(event.Type == 'pressed'){
    //none
    }
    else if(event.Type == 'released'){
      Brightval2 = parseInt(Math.floor((event.Value * 0.121)));
      //console.log('val=' + event.Value + 'Bright=' + Brightval );
      xapi.config.set('Cameras Camera 2 Brightness DefaultLevel',Brightval2);
      // update the value to the Gui
      xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'brtext2',
        Value: Brightval2,
      });
    }
  }

  if(event.WidgetId == 'brightset3'){
    if(event.Type == 'pressed'){
    //none
    }
    else if(event.Type == 'released'){
      Brightval3 = parseInt(Math.floor((event.Value * 0.121)));
      //console.log('val=' + event.Value + 'Bright=' + Brightval );
      xapi.config.set('Cameras Camera 3 Brightness DefaultLevel',Brightval3); 
      // update the value to the Gui
      xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'brtext3',
        Value: Brightval3,
      });
    }
  }


//________________________________________________________________________
//_______WhiteBalance ____________________________________________________
//________________________________________________________________________
  // Enable disable WhiteBalance
  if(event.WidgetId == 'Whitebalance1'){
    if(event.Type == 'changed'){     
      if (event.Value == "on"){
        xapi.config.set('Cameras Camera 1 Whitebalance Mode','Auto');
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'wbtext1',
        Value: 'A',
      });
      } else {
        xapi.config.set('Cameras Camera 1 Whitebalance Mode','Manual');
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'wbset1',
        Value: '255',
        });
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'wbtext1',
        Value: '7',
        });
      }  
    }
  }

  if(event.WidgetId == 'Whitebalance1'){
    if(event.Type == 'changed'){     
      if (event.Value == "on"){
        xapi.config.set('Cameras Camera 1 Whitebalance Mode','Auto');
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'wbtext1',
        Value: 'A',
      });
      } else {
        xapi.config.set('Cameras Camera 1 Whitebalance Mode','Manual');
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'wbset1',
        Value: '255',
        });
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'wbtext1',
        Value: '7',
        });
      }  
    }
  }
  if(event.WidgetId == 'Whitebalance2'){
    if(event.Type == 'changed'){     
      if (event.Value == "on"){
        xapi.config.set('Cameras Camera 2 Whitebalance Mode','Auto');
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'wbtext2',
        Value: 'A',
      });
      } else {
        xapi.config.set('Cameras Camera 2 Whitebalance Mode','Manual');
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'wbset2',
        Value: '255',
        });
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'wbtext2',
        Value: '7',
        });
      }  
    }
  }if(event.WidgetId == 'Whitebalance3'){
    if(event.Type == 'changed'){     
      if (event.Value == "on"){
        xapi.config.set('Cameras Camera 3 Whitebalance Mode','Auto');
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'wbtext3',
        Value: 'A',
      });
      } else {
        xapi.config.set('Cameras Camera 3 Whitebalance Mode','Manual');
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'wbset3',
        Value: '255',
        });
        xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'wbtext3',
        Value: '7',
        });
      }  
    }
  }

  //set WhiteBalance slider
  if(event.WidgetId == 'wbset1'){
    if(event.Type == 'pressed'){
      //none
    }
    else if(event.Type == 'released'){
      WBval1 = parseInt(Math.floor((event.Value * 0.065)));
      if (WBval1 == 0){
        WBval1 = parseInt(1);
      }
      xapi.config.set('Cameras Camera 1 Whitebalance Level',WBval1);
      // update the value to the Gui   xConfiguration Cameras Camera [n] Whitebalance Level: Level
      xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'wbtext1',
        Value: WBval1,
      });
    }
  }
if(event.WidgetId == 'wbset2'){
    if(event.Type == 'pressed'){
      //none
    }
    else if(event.Type == 'released'){
      WBval2 = parseInt(Math.floor((event.Value * 0.065)));
      if (WBval2 == 0){
        WBval2 = parseInt(1);
      }
      xapi.config.set('Cameras Camera 2 Whitebalance Level',WBval2);
      // update the value to the Gui
      xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'wbtext2',
        Value: WBval2,
      });
    }
  }
if(event.WidgetId == 'wbset3'){
    if(event.Type == 'pressed'){
      //none
    }
    else if(event.Type == 'released'){
      WBval3 = parseInt(Math.floor((event.Value * 0.065)));
      if (WBval3 == 0){
        WBval3 = parseInt(1);
      }
      xapi.config.set('Cameras Camera 3 Whitebalance Level',WBval3);
      // update the value to the Gui
      xapi.Command.UserInterface.Extensions.Widget.SetValue({
        WidgetId: 'wbtext3',
        Value: WBval3,
      });
    }
  }


//_________________________________________________________________________
//_______cam position left right up down___________________________________
//_________________________________________________________________________
if(event.WidgetId == 'NESW'){
    if(event.Type == 'pressed'){
      //start timer for long press check
      //timerId = setInterval(longpress, everysecond); 
      switch(event.Value){
        case 'right':
          if(camera1active && camera2active){
            //noop
          }
          else{
            camera1active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_LEFT,  Pan: 'Right'});
            camera2active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_RIGHT, Pan: 'Right'});
            camera3active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_THREE, Pan: 'Right'});
          }
          break;
        case 'left':
          if(camera1active && camera2active){
            //noop
          }
          else{
            camera1active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_LEFT,  Pan: 'Left'});
            camera2active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_RIGHT, Pan: 'Left'});
            camera3active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_THREE, Pan: 'Left'});
          }
          break;
        case 'up':
          camera1active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_LEFT,  Tilt: 'Up'});
          camera2active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_RIGHT, Tilt: 'Up'});
          camera3active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_THREE, Tilt: 'Up'});
          break;
        case 'down':
          camera1active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_LEFT,  Tilt: 'Down'});
          camera2active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_RIGHT, Tilt: 'Down'});
          camera3active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_THREE, Tilt: 'Down'});
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
        camera3active && xapi.command("Camera Ramp", {CameraId: CAMERAID_CAMERA_THREE,Tilt: 'Stop',Pan: 'Stop'});

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



//_________________________________________________________________________
//_______Active cam Select_________________________________________________
//_________________________________________________________________________ 
    if(event.WidgetId == 'CamSelect'){
      if(event.Type == 'pressed'){
        switch(event.Value){
          case 'Cam1':
            //console.log(`Cam 1 press`);
            if (!Easteregg){
              xapi.command("Video Input SetMainVideoSource", {ConnectorId: CAMERACONNECTORID_CAMERA_LEFT});
            }
            camera1active = true;
            camera2active = false;
            camera3active = false;
            //focus page active camera update
            xapi.Command.UserInterface.Extensions.Widget.SetValue({
              WidgetId: 'activecamnumber',
              Value: 'Active Camera 1',
            });  
            break;
          case 'Cam2':
            //console.log(`Cam2 press`);
            if (!Easteregg){
              xapi.command("Video Input SetMainVideoSource", {ConnectorId: CAMERACONNECTORID_CAMERA_RIGHT});
            }
            camera2active = true;
            camera1active = false;
            camera3active = false;
                        //focus page active camera update
            xapi.Command.UserInterface.Extensions.Widget.SetValue({
              WidgetId: 'activecamnumber',
              Value: 'Active Camera 2',
            }); 
            break;
          case 'Cam3':
            //console.log(`Cam 3 press`);
            if (!Easteregg){
              xapi.command("Video Input SetMainVideoSource", {ConnectorId: CAMERACONNECTORID_CAMERA_THREE});
            }  
            camera3active = true;
            camera2active = false;
            camera1active = false;
            //focus page active camera update
            xapi.Command.UserInterface.Extensions.Widget.SetValue({
              WidgetId: 'activecamnumber',
              Value: 'Active Camera 3',
            }); 
            break;     
          default:
            console.log(`Unhandled Navigation`);
        }
      } 
    }
     
    // Enable Selfview 
    if(event.WidgetId == 'SelfView'){
      if(event.Type == 'changed'){     
        if (event.Value == "on"){
          xapi.config.set('Video Selfview Default Mode:', 'On');
        } else {
          xapi.config.set('Video Selfview Default Mode:', 'Off');
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
          camera3active && xapi.command("Camera Preset Store", {PresetId: event.Value , CameraId: CAMERAID_CAMERA_THREE });
          //alert('', 'Preset position Saved', 3);
          xapi.Command.UserInterface.Extensions.Widget.SetValue({
              WidgetId: 'remember',
              Value: '  ',
        });
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
          alert('', 'Please Activate EasterEgg mode first!!', 3);
        }
      }
    }

    // Enable disable Proximity 
    if(event.WidgetId == 'ultrasonic'){
        if(event.Type == 'changed'){     
          if (event.Value == "on"){
            xapi.config.set('Audio Ultrasound MaxVolume:', '70');
          } else {
            xapi.config.set('Audio Ultrasound MaxVolume:', '0');
          }
        }
      } 


    // Enable disable auto Standby 
    if(event.WidgetId == 'standby'){
        if(event.Type == 'changed'){     
          if (event.Value == "on"){
            xapi.config.set('Standby Control:','On');
            xapi.command('Standby Activate');
            clearInterval(standbyTimer);  //stop the timer
            
          } else {
            xapi.config.set('Standby Control:','Off');
            xapi.command('Standby Deactivate');
            standbyTimer = setInterval(nostandby, everyminute);
            // set timer to activate the machine every minute 
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
  let activecam = "";
  longp =1; // set longpress flag
  if (camera1active){
    activecam = "Preset Camera : " + "1" + " Stored";
  }
  else if (camera2active){
    activecam = "Preset Camera : " + "2" + " Stored";
  } 
  else if (camera3active){
    activecam = "Preset Camera : " + "3" + " Stored";
  } 
  alert("Preset", activecam ,3);
}

//No standby  keep screen on always
function nostandby(){
  xapi.command('Standby Deactivate');
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


