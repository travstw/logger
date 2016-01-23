
var dqv = new DQV();

function DQV(){
	
	this.city;
	this.date;
	this.personnel;
	this.comments;

	this.firingPoints = [];
	var self = this;

	this.addFiringPoint = function(){
		
		view.addFiringPointToDom(self.firingPoints.length + 1);
		self.firingPoints.push(new FiringPoint(self.firingPoints.length + 1));
		
	}

	this.addButtonEvent = function(){
		var button = document.getElementById('addFiringPoint');
		button.addEventListener('click', this.addFiringPoint, false);
	}

	this.addButtonEvent();



}


function FiringPoint(fpID){
	
	this.shots = [];

	var self = this;

	this.addShot = function(){

		view.addShotToDom(self.shots.length + 1, fpID);
		self.shots.push(new Shot(self.shots.length + 1, fpID));		
	}

	this.addButtonEvent = function(){
		var button = document.getElementById('addShot' + fpID);
		button.addEventListener('click', this.addShot, false);
	}

	this.addButtonEvent();

}


function Shot(shotID, fpID){
	
	this.weapon;
	this.rounds;
	this.timestamp;
	this.flexID;
	var self = this;

	this.getTime = function(){
		var d = new Date();
		var time = d.toTimeString().split(' ')[0];
		view.addShotTimestamp(shotID, fpID, time);

	}

	this.addTimestampEventListener = function(){
		var button_Timestamp = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_getTime');		
		button_Timestamp.addEventListener('click', this.getTime, false);
	}

	this.addSaveEventListener = function(){
		var button_Save = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_save');
		button_Save.addEventListener('click', this.save, false);
	}

	this.removeSaveEventListener = function(){
		var button_Save = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_save');
		button_Save.removeEventListener('click', this.save, false);

	}

	this.addEditEventListener = function(){
		var button_Save = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_save');
		button_Save.addEventListener('click', this.edit, false);
	}

	this.removeEditEventListener = function(){
		var button_Save = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_save');
		button_Save.removeEventListener('click', this.edit, false);

	}

	this.save = function(){
		self.weapon = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_weapon').value;
		self.rounds = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_rounds').value;
		self.timestamp = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_timeStamp').value;
		self.flexID = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_flexID').value;

		console.log(self.weapon);
		console.log(self.rounds);
		console.log(self.timestamp);
		console.log(self.flexID);

		self.removeSaveEventListener();
		self.addEditEventListener();
		view.disableShotsEditing(shotID, fpID);		
		
	}

	this.edit = function(){
		self.removeEditEventListener();
		self.addSaveEventListener();
		view.enableShotsEditing(shotID, fpID);

	}

	this.addTimestampEventListener();
	this.addSaveEventListener();





}



view = {

	addFiringPointToDom: function(fpID){

		var FPC = document.querySelector("#fpContainer");
		var fpDiv = document.createElement('DIV');
		fpDiv.id = 'fp' + fpID;
		FPC.appendChild(fpDiv);
		fpDiv.innerHTML =  	'<div>'+
		'<fieldset>'+
		'<div id="fp">'+
		'<legend>Firing Point ' + fpID + '</legend><br>'+
		'  Name: <input type="text" name="Name" id="name_firingPoint'+ fpID +'" value="Parking Lot">'+
		'  Latitude: <input type="text" name="Lat" id="lat_firingPoint' + fpID + '" value="45.345445">'+
		'  Longitude: <input type="text" name="Long" id="long_firingPoint'+ fpID + '" value="-75.345445"><br><br>'+
		'Shots:  <button type="button" id="addShot' + fpID + '">Add</button>	<br><br>'+
		'<div id="shots' + fpID + '"></div>'+
		'</div>'+
		'</fieldset>'+
		'</div>'	
	},

	addShotToDom: function(shotID, fpID){

		var shotNumber = (shotID < 10) ? '0' + shotID: shotID;

		var FP = document.querySelector("#shots" + fpID);
		var shotDiv = document.createElement('DIV');
		shotDiv.id = "Shot" + shotID
		var first = FP.firstChild;
		FP.insertBefore(shotDiv, first);
		shotDiv.innerHTML = 'Shot ' + shotNumber + ': Weapon: <select id="fp_' + fpID + '_shot_' + shotID +'_weapon">' +
		'<option value="9mm">9mm</option>' +
		'<option value=".40">.40</option>' +
		'<option value=".45">.45</option>' +
		'</select>    ' +
		'Rounds: <select id="fp_' + fpID + '_shot_'+ shotID +'_rounds">' +
		'<option value="3">3</option>' +
		'<option value="1">1</option>' +		
		'</select>    ' +
		'TimeStamp: <input type="text" name="TimeStamp" id="fp_' + fpID + '_shot_'+ shotID +'_timeStamp" value="">    ' +
		'<button type="button" id="fp_' + fpID + '_shot_' + shotID + '_getTime">Shot</button>  ' +
		'FlexID: <input type="text" name="FlexID" id="fp_' + fpID + '_shot_'+ shotID +'_flexID" value="-9999">   ' +
		'<button type="button" id="fp_' + fpID + '_shot_' + shotID + '_save">Save</button><br><br> ' 
	},

	addShotTimestamp: function(shotID, fpID, time){

		document.getElementById('fp_' + fpID + '_shot_' + shotID + '_timeStamp').value = time;

	},

	disableShotsEditing: function(shotID, fpID){
		document.getElementById('fp_' + fpID + '_shot_' + shotID + '_weapon').disabled = true;
		document.getElementById('fp_' + fpID + '_shot_' + shotID + '_rounds').disabled = true;
		document.getElementById('fp_' + fpID + '_shot_' + shotID + '_timeStamp').readOnly = true;
		document.getElementById('fp_' + fpID + '_shot_' + shotID + '_flexID').readOnly = true;
		document.getElementById('fp_' + fpID + '_shot_' + shotID + '_getTime').disabled = true;
		document.getElementById('fp_' + fpID + '_shot_' + shotID + '_save').innerHTML = "Edit";

	},

	enableShotsEditing:  function(shotID, fpID){
		document.getElementById('fp_' + fpID + '_shot_' + shotID + '_weapon').disabled = false;
		document.getElementById('fp_' + fpID + '_shot_' + shotID + '_rounds').disabled = false;
		document.getElementById('fp_' + fpID + '_shot_' + shotID + '_timeStamp').readOnly = false;
		document.getElementById('fp_' + fpID + '_shot_' + shotID + '_flexID').readOnly = false;
		document.getElementById('fp_' + fpID + '_shot_' + shotID + '_getTime').disabled = false;
		document.getElementById('fp_' + fpID + '_shot_' + shotID + '_save').innerHTML = "Save";

	}




}
