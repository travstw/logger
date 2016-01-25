
(function(){

	$(function() {
    		$( "#datepicker" ).datepicker();

  	});

  			

	var dqv = new DQV();

	function DQV(){

		//DQV Session Class
		
		this.city;
		this.date;
		this.personnel;	
		this.comments;
		this.weather;
		this.firingPoints = [];
		this.weapons = [];
		this.session;
		
		var self = this;

		this.addFiringPoint = function(){
			//Instantiates new Firing Point Object, Adds FP object to firingPoints array, adds Firing point HTML to DOM
			
			view.addFiringPointToDom(self.firingPoints.length + 1);
			self.firingPoints.push(new FiringPoint(self.firingPoints.length + 1 , self.weapons));
			
		}

		this.saveSession = function(){

			//Collects data into JSON format, sends to server to be written to file
			
			for (var i = 0; i < self.firingPoints.length; i++){
				self.firingPoints[i].save();
				self.session.firingPoints.push(self.firingPoints[i].JSON);
				for (var j = 0; j < self.firingPoints[i].shots.length; j++){
					self.session.firingPoints[i].shots.push(self.firingPoints[i].shots[j].JSON);
				}	
			}

			var http = new XMLHttpRequest();
  			var url = "/submit";
  			var params = JSON.stringify(self.session);
  			http.open("POST", url, true);
  			http.setRequestHeader("Content-type", "application/json");
  			http.send(params);
			
		}

		this.saveInfo = function(){
			//Saves DQV info, sets weapon options, re-enables add firing point button

			self.city = document.getElementById('city').value;
			self.date = document.getElementById('datepicker').value;
			self.date = $.datepicker.formatDate("yy-mm-dd", new Date(self.date));
			self.personnel = document.getElementById('personnel').value;
			self.comments = document.getElementById('comment_DQV').value;
			self.weather = document.getElementById('weather').value

			self.session = {
				"city": self.city, 
				"date": self.date, 
				"personnel": self.personnel.split(','), 
				"comments" : self.comments,
				"weather": self.weather,
				"firingPoints": []

			}
						
			var nineMM = document.getElementById('9mm');
			var forty = document.getElementById('.40');
			var forty5 = document.getElementById('.45');
			var other = document.getElementById('other');
			
		
			self.weapons.push(nineMM, forty, forty5, other);
			self.removeSaveInfoButtonEvent();
			self.addEditInfoButtonEvent();
			var button = document.getElementById('addFiringPoint').disabled = false;
			view.disableDQVInfoEditing();
		}

		this.editInfo = function(){
			//Toggles button listener from Edit to Save

			self.removeEditInfoButtonEvent();
			self.addSaveInfoButtonEvent();
			view.enableDQVInfoEditing();

		}

		this.addFiringPointButtonEvent = function(){
			//adds listener for add Firing Point button

			var button = document.getElementById('addFiringPoint');
			button.addEventListener('click', this.addFiringPoint, false);
			button.disabled = true;
		}


		this.addSaveSessionButtonEvent = function(){
			//adds listener for save session button

			var saveButton = document.getElementById('saveSession');
			saveButton.addEventListener('click', this.saveSession, false);
		}

		this.addSaveInfoButtonEvent = function(){
			//adds listener for save info button

			var saveButton = document.getElementById('saveInfo');
			saveButton.addEventListener('click', this.saveInfo, false);
		}

		this.removeSaveInfoButtonEvent = function(){
			//removes listener for save info button

			var saveButton = document.getElementById('saveInfo');
			saveButton.removeEventListener('click', this.saveInfo, false);
		}

		this.addEditInfoButtonEvent = function(){
			//adds listener for edit info button

			var saveButton = document.getElementById('saveInfo');
			saveButton.addEventListener('click', this.editInfo, false);
		}

		this.removeEditInfoButtonEvent = function(){
			//removes listener for edit info button

			var saveButton = document.getElementById('saveInfo');
			saveButton.removeEventListener('click', this.editInfo, false);
		}

		//Enables initial event listener states upon DQV object instantiation

		this.addFiringPointButtonEvent();
		this.addSaveSessionButtonEvent();
		this.addSaveInfoButtonEvent();



	}


	function FiringPoint(fpID, weapons){
		//Firing Point Class

		this.fp_Name;
		this.latitude;
		this.longitude;
		this.comments;			
		this.shots = [];
		this.JSON;

		var self = this;

		this.addShot = function(){
			//Adds shot html to DOM, Instantiates new Shot object, pushes shot object to shots array, disables addShot button

			view.addShotToDom(self.shots.length + 1, fpID);
			self.shots.push(new Shot(self.shots.length + 1, fpID, weapons));
			var button = document.getElementById('addShot' + fpID).disabled = true;

		}

		this.save = function(){
			//Saves Dom input values to field variables, formats JSON object

			self.fp_name = document.getElementById('name_firingPoint'+ fpID).value;
			self.latitude = document.getElementById('lat_firingPoint' + fpID).value;
			self.longitude = document.getElementById('long_firingPoint'+ fpID).value;
			self.comments = document.getElementById('FP_comments' + fpID).value;

			self.JSON = {
				"firingPoint": fpID,
				"name": self.fp_name,
				"latitude": self.latitude, 
				"longitude": self.longitude, 
				"comments": self.comments, 
				"shots": []
			}


		}

		this.addShotButtonEvent = function(){
			//adds listener for add shot button

			var button = document.getElementById('addShot' + fpID);
			button.addEventListener('click', this.addShot, false);
		}

		//sets inital listener state upon Firing Point object instantiation
		this.addShotButtonEvent();

	}


	function Shot(shotID, fpID, weapons){
		//Shot class
		
		this.weapon;
		this.rounds;
		this.timestamp;
		this.flexID;
		this.comments;
		this.JSON;
		this.inList = false;
		var self = this;

		this.getTime = function(){
			//Gets system time
			//TODO:  change to db request for db server time

			var d = new Date();
			var time = d.toTimeString().split(' ')[0];
			view.addShotTimestamp(shotID, fpID, time);

		}

		this.addTimestampEventListener = function(){
			//adds listener for timestamp button

			var button_Timestamp = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_getTime');		
			button_Timestamp.addEventListener('click', this.getTime, false);
		}

		this.addSaveEventListener = function(){
			//adds listener for save event button

			var button_Save = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_save');
			button_Save.addEventListener('click', this.save, false);
		}

		this.removeSaveEventListener = function(){
			//removes listener for save event button

			var button_Save = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_save');
			button_Save.removeEventListener('click', this.save, false);

		}

		this.addEditEventListener = function(){
			//adds listener for edit event button

			var button_Save = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_save');
			button_Save.addEventListener('click', this.edit, false);
		}

		this.removeEditEventListener = function(){
			//removes listener for edit event button

			var button_Save = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_save');
			button_Save.removeEventListener('click', this.edit, false);

		}

		this.addDisableNewShotEventListener = function(){
			//adds disable new shot event listener to save button

			var button_Save = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_save');
			button_Save.addEventListener('click', this.disableAddShotButton, false);
		}

		this.removeDisableNewShotEventListener = function(){
			//removes disable new shot event listener to save button

			var button_Save = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_save');
			button_Save.removeEventListener('click', this.disableAddShotButton, false);

		}

		this.disableAddShotButton = function(){
			//diables add shot button and removes event listener for disabling new shot

			view.disableAddShotButton(fpID);
			self.removeDisableNewShotEventListener();


		}

		this.save = function(){
			//saves Dom input info to field variables, formats JSON, handles event listener states

			self.weapon = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_weapon').value;
			self.rounds = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_rounds').value;
			self.timestamp = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_timeStamp').value;
			var ID = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_flexID');
			if (ID.value === ''){
				ID.value = '-9999';
				self.flexID = ID.value;				
			} else {
				self.flexID = ID.value;
			}
			self.comments = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_comments').value;

			self.JSON = {
				// "firingPoint": "Firing Point " + fpID,
				"shot": shotID,
				"weapon": self.weapon, 
				"rounds": self.rounds, 
				"timestamp": self.timestamp, 
				"flexID": self.flexID, 
				"comments": self.comments
			}

			// console.log(self.weapon);
			// console.log(self.rounds);
			// console.log(self.timestamp);
			// console.log(self.flexID);
			// console.log(self.comments);


			document.getElementById('addShot' + fpID).disabled = false;
			self.removeSaveEventListener();
			self.addEditEventListener();
			view.disableShotsEditing(shotID, fpID);	
			if(self.inList === false){
				view.moveShotToList(shotID, fpID);	
				self.inList = true;
			}
			
			
		}

		this.edit = function(){
			//toggles event listeners from edit to save

			self.removeEditEventListener();
			self.addSaveEventListener();
			view.enableShotsEditing(shotID, fpID);

		}

		this.populateWeaponMenu = function(){
			//populates shot menu with DQV info weapon settings


			var x = document.getElementById('fp_' + fpID + '_shot_' + shotID +'_weapon');			

			for (var i = 0; i < weapons.length; i++){
				if (weapons[i].checked){
					var w = document.createElement('option');
					if(weapons[i] === other){
						w.text = document.getElementById('otherWeapon').value;
					} else {
						w.text = weapons[i].value;
					}

					x.add(w);
				}
			}			 			
		}


		//Sets initial event listener states and populates weapon menu

		this.addTimestampEventListener();
		this.addSaveEventListener();
		this.populateWeaponMenu();
	}





	view = {

		//Methods for changing view states 

		addFiringPointToDom: function(fpID){

			//Adds Firing Point HTML to DOM

			var FPC = document.querySelector("#fpContainer");
			var fpDiv = document.createElement('DIV');
			fpDiv.id = 'fp' + fpID;
			FPC.appendChild(fpDiv);
			fpDiv.innerHTML =  	'<div>'+
			'<fieldset>'+
			'<legend>Firing Point ' + fpID + '</legend><br>'+
			'<div id="fp">'+
			
			'  Name: <input type="text" name="Name" id="name_firingPoint'+ fpID +'" value="Parking Lot">'+
			'  Latitude: <input type="text" name="Lat" id="lat_firingPoint' + fpID + '" value="45.345445" style="width:75px">'+
			'  Longitude: <input type="text" name="Long" id="long_firingPoint'+ fpID + '" value="-75.345445" style="width:75px">'+
			'  Comments:  <input type="text" name="FP_Comments" id="FP_comments' + fpID + '"value=""><br><br>' +
			'Shots:  <button type="button" id="addShot' + fpID + '">Add</button>	<br><br>'+
			'<div style="height:20px"><div id="shots' + fpID + '"></div></div><br>Firing Point ' + fpID + ' Shot List:<br><br></div>'+
			
			'<div id="shotList' + fpID + '"></div>' +
			'</fieldset>'+
			'</div><br>'	
		},

		addShotToDom: function(shotID, fpID){

			//Adds Shot HTML to DOM

			var shotNumber = (shotID < 10) ? '0' + shotID: shotID;

			var FP = document.querySelector("#shots" + fpID);
			var shotDiv = document.createElement('DIV');
			shotDiv.id = 'shot' + shotID + 'fp_' + fpID;
			var first = FP.firstChild;
			FP.insertBefore(shotDiv, first);
			shotDiv.innerHTML = 'Shot ' + shotNumber + ': Weapon: <select id="fp_' + fpID + '_shot_' + shotID +'_weapon">' +
			'</select>    ' +
			'Rounds: <select id="fp_' + fpID + '_shot_'+ shotID +'_rounds">' +
			'<option value="3">3</option>' +
			'<option value="1">1</option>' +		
			'</select>    ' +
			'TimeStamp: <input type="text" name="TimeStamp" id="fp_' + fpID + '_shot_'+ shotID +'_timeStamp" value="" style="width:75px">    ' +
			'<button type="button" id="fp_' + fpID + '_shot_' + shotID + '_getTime">Shot</button>  ' +
			'FlexID: <input type="text" name="FlexID" id="fp_' + fpID + '_shot_'+ shotID +'_flexID" value="" style="width:75px">   ' +
			'Comments: <input type="text" name="Comments" id="fp_' + fpID + '_shot_'+ shotID +'_comments" value="">   ' +
			'<button type="button" id="fp_' + fpID + '_shot_' + shotID + '_save">Save</button><br><br> ' 
		},

		addShotTimestamp: function(shotID, fpID, time){
			//Adds shot timestamp info to DOM

			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_timeStamp').value = time;

		},

		disableShotsEditing: function(shotID, fpID){
			//Disables shot editing

			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_weapon').disabled = true;
			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_rounds').disabled = true;
			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_timeStamp').readOnly = true;
			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_flexID').readOnly = true;
			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_getTime').disabled = true;
			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_comments').readOnly = true;
			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_save').innerHTML = "Edit";

		},

		enableShotsEditing:  function(shotID, fpID){
			//Enables shot editing

			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_weapon').disabled = false;
			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_rounds').disabled = false;
			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_timeStamp').readOnly = false;
			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_flexID').readOnly = false;
			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_getTime').disabled = false;
			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_comments').readOnly = false;
			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_save').innerHTML = "Save";

		},

		disableDQVInfoEditing: function(){
			//Disables DQV Info Editing	

			document.getElementById('city').readOnly = true;
			document.getElementById('datepicker').readOnly = true;
			document.getElementById('personnel').readOnly = true;
			document.getElementById('9mm').disabled = true;
			document.getElementById('.40').disabled = true;
			document.getElementById('.45').disabled = true;
			document.getElementById('other').disabled = true;
			document.getElementById('otherWeapon').disabled = true;
			document.getElementById('comment_DQV').readOnly = true;
			document.getElementById('saveInfo').innerHTML = "Edit DQV Info";

		},

		enableDQVInfoEditing: function(){
			//Enables DQV Info Editing

			document.getElementById('city').readOnly = false;
			document.getElementById('datepicker').readOnly = false;
			document.getElementById('personnel').readOnly = false;
			document.getElementById('9mm').disabled = false;
			document.getElementById('.40').disabled = false;
			document.getElementById('.45').disabled = false;
			document.getElementById('other').disabled = false;
			document.getElementById('otherWeapon').disabled = false;
			document.getElementById('comment_DQV').readOnly = false;
			document.getElementById('saveInfo').innerHTML = "Save DQV Info";

		},

		moveShotToList: function(shotID, fpID){
			//Moves shot Div to shot list Div

			var shotList = document.getElementById('shotList' + fpID);
			var shot = document.getElementById('shot' + shotID + 'fp_' + fpID);

			shotList.appendChild(shot);

		},

		disableAddShotButton: function(fpID){
			//disables add shot button

			document.getElementById('addShot' + fpID).disabled = true;
		}

	}

})();
