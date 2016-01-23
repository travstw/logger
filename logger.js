
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

	this.getTime = function(){
		var d = new Date();
		var time = d.toTimeString().split(' ')[0];
		view.addShotTimestamp(shotID, fpID, time);

	}

	this.addTimeStampButtonEvent = function(){
		var button = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_getTime');
		button.addEventListener('click', this.getTime, false);

	}

	this.addTimeStampButtonEvent();





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

		var FP = document.querySelector("#shots" + fpID);
		var shotDiv = document.createElement('DIV');
		shotDiv.id = "Shot" + shotID
		var first = FP.firstChild;
		FP.insertBefore(shotDiv, first);
		shotDiv.innerHTML = 'Shot ' + shotID + ': Weapon: <select id="fp_' + fpID + '_shot_' + shotID +'_weapon">' +
									'<option value="9mm">9mm</option>' +
									'<option value=".40">.40</option>' +
									'<option value=".45">.45</option>' +
								'</select>    ' +

						'Rounds: <select id="fp_' + fpID + '_shot_'+ shotID +'_rounds">' +
									'<option value="3">3</option>' +
									'<option value="1">1</option>' +		
								'</select>    ' +

						'TimeStamp: <input type="text" name="TimeStamp" id="fp_' + fpID + '_shot_'+ shotID +'_timeStamp">    ' +
						'FlexID: <input type="text" name="FlexID" id="fp_' + fpID + '_shot_'+ shotID +'_flexID" value="-9999">    ' +
						'<button type="button" id="fp_' + fpID + '_shot_' + shotID + '_getTime">Shot</button><br><br>  '


	},

	addShotTimestamp: function(shotID, fpID, time){
		console.log(shotID);
		console.log(fpID);
		console.log(time);

		document.getElementById('fp_' + fpID + '_shot_' + shotID + '_timeStamp').value = time;


	}


}
