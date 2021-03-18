# InRoomCameraPresetControls xapi
<h2>Webex device InRoom Camera Preset Controls</h2>

<p>This script can store up to 8 camera presets.</p>
<p>Presets will be assigned to the active camera and stores Pan Tilt Zoom and focus values.</p>
<p>Additionally Focus, Brightness, White Balance can be manually set.</p>
<p>SpeakerTrack will always be Deactivated and Proximity and AutoStandBy can manually be Deactivated.</p>

<p>My attempt to create a usable camera presets page. Created with a smile.</p>

<p>History:</p>
<p>2021-030-18</p>
<p>MultiPresets3.js and roomcontrolconfig3.xml is the 3 camera version.</p>
<p>Also Proximity and standby control are added.</p>

<h2>How to Install :</h2>
<p>Open the Webex device webpage</p> 
<p>- goto the 'UI extentions editor'  Upload the MultiPresetsroom.xml</p>
<p>- goto the 'macro editor'  and Upload the MultiPresets.js</p>

Depending on where your device is registered you can access the internal webpage.
Please see this link for details : <br>
https://help.webex.com/en-us/n5pqqcm/Device-Configurations-for-Room-and-Desk-Devices-and-Webex-Boards#task_i1d_g55_cz


<h2>Some manual :</h2>

On entering this page the Speakertrack function will be de-activate and does STAY de-activated!

<p>Select the camera and change it to the desired position and zoom level.</p>
<p>A Longpress a one of the eight numbers does store the current active camera position , focus and zoom.</p>
<p>Focus, WhiteBalance and Brightness can be adjusted via the tab pages. These will NOT be stored.</p>
<p>A shortpress on the one of the eight numbers will recall the stored position. If the preset is of the 'other'</p>
<p>camera you need to activate that camera to view the selected position. In this sequence you can avoid moving camera's</p>

<h2>Settings tab:</h2> 

<p>Here you can enable or disable the Selfview screen and the Auto standby function</p>
<p>Clear all presets will........clear all presets :-)</p>


<h2>EasterEgg:</h2> 

<p>Press the Smiley button. On the Right bottom you see the text EggM which indicates EasterEggMode.</p>
<p>Position the camera's for a wide view. If you have no clue how to start, goto the settings tab and press the</p>  
<p>Cam Suggest button.</p>
<p>Longpress the Smiley to store the positions.</p>
<p>You can leave the EasterEggMode by pressing the Smiley button again. (mind the text on the right bottom corner)</p>


<p><img style="margin: 0 0 5px 20px; float: right;" src="https://github.com/freijn/InRoomCameraPresetControls-xapi/blob/main/camera_gui.JPG" alt="CameraGUI" width="300" height="300" /></p>
