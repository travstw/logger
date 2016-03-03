
(function(){

	$(function() {
    		$( "#datepicker" ).datepicker();
  	});

	mapControl = {
		//controls methods for map

		centerFiringPoint: function(lat, lng){
			//centers map from existing to new coordinates
			map.panTo({lat: lat, lng: lng});			
			map.setZoom(19);
			mapControl.centerCircle(lat, lng);
			mapControl.centerFiringPointMarker();
		},

		centerCircle: function(lat, lng){
			//centers circle to coordinates

			circle.setCenter({lat: lat, lng: lng});
			circle.setVisible(true);
			circle.setMap(map);									
		},

		centerFiringPointMarker: function(){
				
			marker.setPosition(map.center);
			marker.setMap(map);
		},

		addShotMarker: function(marker){	

			marker.setMap(map);
		},

		centerFiringPointFromMenu: function(fpID){
				
			var lat = parseFloat(document.getElementById('lat_firingPoint' + fpID).value);
			var lng = parseFloat(document.getElementById('long_firingPoint' + fpID).value);

			if(lat && lng){
				if(!isNaN(lat) && !isNaN(lng)){
					mapControl.centerFiringPoint(lat, lng);				
				};
			}; 			
		}
		
	};

	var dqv = new DQV();



	function DQV(){

		//DQV Session Class	

		this.dqvname;
		this.city;
		this.date;
		this.personnel;	
		this.comments;
		// this.weather;
		this.firingPoints = [];
		this.weapons = [];
		this.weaponsValues = [];
		this.session;
		this.started = false;
		this.fpID;
		this.detected = 0;
		this.missed = 0;
		this.mislocated = 0;
		this.detectionRate = '';
		
		var self = this;

		this.addFiringPoint = function(){
			//Instantiates new Firing Point Object, Adds FP object to firingPoints array, adds Firing point HTML to DOM
			self.fpID = self.firingPoints.length + 1;
			view.addFiringPointToDom(self.fpID);
			self.firingPoints.push(new FiringPoint(self.fpID , self.weapons));
			view.newFiringPointFocus(self.fpID);
			view.showDetectionRate(self.fpID);						
		};

		this.saveSession = function(){

			//Collects all data from session into JSON format, sends to server to be written to file---  TODO: Database
			
			for (var i = 0; i < self.firingPoints.length; i++){
				self.firingPoints[i].save();
				self.session.firingPoints.push(self.firingPoints[i].JSON);
				for (var j = 0; j < self.firingPoints[i].shots.length; j++){
					self.session.firingPoints[i].shots.push(self.firingPoints[i].shots[j].JSON);
				};	
			};

			var http = new XMLHttpRequest();
  			var url = "/submit";
  			var params = JSON.stringify(self.session);
  			http.open("POST", url, true);
  			http.setRequestHeader("Content-type", "application/json");
  			http.send(params);			
		};

		this.saveInfo = function(){
			//Saves DQV info, sets weapon options, re-enables add firing point button

			self.dqvname = document.getElementById('dqvname').value;
			self.city = document.getElementById('city').value;
			self.date = document.getElementById('datepicker').value;
			self.date = $.datepicker.formatDate("yy-mm-dd", new Date(self.date));
			self.personnel = document.getElementById('personnel').value;
			self.comments = document.getElementById('comment_DQV').value;
			// self.weather = document.getElementById('weather').value

			$('#datepicker').datepicker().datepicker('disable');
			
			var nineMM = document.getElementById('9mm');
			var forty = document.getElementById('.40');
			var forty5 = document.getElementById('.45');
			var thirty8 = document.getElementById('.38');
			var twotwothree = document.getElementById('.223');
			var shotgun = document.getElementById('shotgun');
			var other = document.getElementById('other');
			self.weapons = [];
			self.weaponsValues= [];
			view.weaponList = [];
						
			self.weapons.push(nineMM, forty, forty5, thirty8, twotwothree, shotgun, other);

			for(var x = 0; x < self.weapons.length; x++){
				if(self.weapons[x].checked){
					if(self.weapons[x] === other){
						var otherWeapon = document.getElementById('otherWeapon');
						view.weaponList.push(otherWeapon.value);
						self.weaponsValues.push(otherWeapon.value);
					} else {
						view.weaponList.push(self.weapons[x].value);
						self.weaponsValues.push(self.weapons[x].value);
					}	
				}
			}

			self.session = {
				"name": self.dqvname,
				"city": self.city, 
				"date": self.date, 
				"personnel": self.personnel.split(','), 
				"weapons": self.weaponsValues,
				"comments" : self.comments,
				"detected": self.detected, 
				"missed": self.missed, 
				"mislocated": self.mislocated,
				"detection_rate": self.detectionRate,
				// "weather": self.weather,
				"firingPoints": []
			};
			
			if(self.started === false){
				self.addFiringPoint();
				self.started = true;
			}			
			
			self.removeSaveInfoButtonEvent();
			self.addEditInfoButtonEvent();
			var button = document.getElementById('addFiringPoint').disabled = false;
			view.disableDQVInfoEditing();
		};

		this.calcDetection = function(){

			//calculates overall detectino rate info

			var detected = 0;
			var missed = 0;
			var mislocated = 0;
			
			for(var i = 0; i < self.firingPoints.length; i++){
				for(var j = 0; j < self.firingPoints[i].shots.length; j++){
					if(self.firingPoints[i].shots[j].timestamp){
						if(self.firingPoints[i].shots[j].flexID === "-9999"){
							missed++;
						} else if (self.firingPoints[i].shots[j].distance > 25){
							mislocated++;
						
						} else {
							detected++;
						};
					};
				};
			};

			self.detected = detected;
			self.missed = missed;
			self.mislocated = mislocated;
			self.detectionRate = 100 * (self.detected/(self.detected + self.missed + self.mislocated));			
		};

		this.editInfo = function(){
			//Toggles button listener from Edit to Save

			self.removeEditInfoButtonEvent();
			$('#datepicker').datepicker().datepicker('enable');
			self.addSaveInfoButtonEvent();
			view.enableDQVInfoEditing();
		};

		//Event handlers---------------------------------------------------------

		this.addFiringPointButtonEvent = function(){
			//adds listener for add Firing Point button

			var button = document.getElementById('addFiringPoint');
			button.addEventListener('click', this.addFiringPoint, false);
			button.disabled = true;
		};

		this.addSaveSessionButtonEvent = function(){
			//adds listener for save session button

			var saveButton = document.getElementById('saveSession');
			saveButton.addEventListener('click', this.saveSession, false);
		};

		this.addSaveInfoButtonEvent = function(){
			//adds listener for save info button

			var saveButton = document.getElementById('saveInfo');
			saveButton.addEventListener('click', this.saveInfo, false);
		};

		this.removeSaveInfoButtonEvent = function(){
			//removes listener for save info button

			var saveButton = document.getElementById('saveInfo');
			saveButton.removeEventListener('click', this.saveInfo, false);
		};

		this.addEditInfoButtonEvent = function(){
			//adds listener for edit info button

			var saveButton = document.getElementById('saveInfo');
			saveButton.addEventListener('click', this.editInfo, false);
		};

		this.removeEditInfoButtonEvent = function(){
			//removes listener for edit info button

			var saveButton = document.getElementById('saveInfo');
			saveButton.removeEventListener('click', this.editInfo, false);
		};

		//------------------------------------------------------------------------

		//Enables initial event listener states upon DQV object instantiation

		this.addFiringPointButtonEvent();
		this.addSaveSessionButtonEvent();
		this.addSaveInfoButtonEvent();
	}



	function FiringPoint(fpID, weapons){
		//Firing Point Class

		this.fp_Name;
		this.lat;
		this.lng;
		this.comments;			
		this.shots = [];
		this.JSON;
		this.detected;
		this.missed;
		this.mislocated;
		this.detectionRate;
		this.mapFocused = false;
		this.mapHidden = false;

		var self = this;

		this.addShot = function(){
			//Adds shot html to DOM, Instantiates new Shot object, pushes shot object to shots array, disables addShot button
			
			if(self.mapFocused === false){
				alert('Please enter GPS coordinates and Focus Map');
			} else {
				view.addShotToDom(self.shots.length + 1, fpID);
				self.shots.push(new Shot(self.shots.length + 1, fpID, weapons, self.lat, self.lng));
				document.getElementById('fp_' + fpID + '_shot_' + self.shots.length + '_weapon').selectedIndex = view.currentWeapon;			
				document.getElementById('fp_' + fpID + '_shot_' + self.shots.length + '_rounds').value = view.currentRound;
				var button = document.getElementById('addShot' + fpID).disabled = true;
			};
		};

		this.save = function(){
			//Saves Dom input values to field variables, formats JSON object

			self.fp_name = document.getElementById('name_firingPoint'+ fpID).value;
			self.comments = document.getElementById('FP_comments' + fpID).value;

			self.JSON = {
				"firingPoint": fpID,
				"name": self.fp_name,
				"latitude": self.lat, 
				"longitude": self.lng, 				
				"comments": self.comments, 
				"detected": self.detected,
				"missed": self.missed,
				"mislocated": self.mislocated,
				"detection_rate": self.detectionRate,
				"shots": []
			};
		};

		this.calcDetection = function(){

			//calculate detection rate for firing point

			var detected = 0;
			var missed = 0;
			var mislocated= 0;

			for(var i = 0; i < self.shots.length; i++){

				if(self.shots[i].timestamp){
					if(self.shots[i].flexID === "-9999"){
						missed++;
					} else if(self.shots[i].distance > 25) {
						mislocated++;
					} else {
						detected++;
					};
				};
			};

			self.detected = detected;
			self.missed = missed;
			self.mislocated = mislocated;
			self.detectionRate = 100 * (self.detected/(self.detected + self.missed + self.mislocated));
		}

		this.focusMap = function(){

			//focus map to entered coordinates
			
			self.lat = parseFloat(document.getElementById('lat_firingPoint' + fpID).value);
			self.lng = parseFloat(document.getElementById('long_firingPoint' + fpID).value);
			

			if(isNaN(self.lat) || isNaN(self.lng)){
				alert("Please add GPS coordinates");
				
			} else {
				mapControl.centerFiringPoint(self.lat, self.lng);
				for(var i = 0; i < self.shots.length; i++){
					self.shots[i].calculateDistanceFromFP();
					self.calcDetection();
					view.showFiringPointDetectionRate(fpID);
					view.addLatLongToShot(self.shots[i].shotID, self.shots[i].fpID, self.shots[i].lat, self.shots[i].lng, self.shots[i].distance);
				}
				dqv.calcDetection();
				view.showDetectionRate();
				self.mapFocused = true;

			};
			
		}

		this.mapVisibility = function(){
			if(!self.mapHidden){
				document.getElementById('map').style.height = '0px';
				document.getElementById('hideMap' + fpID).innerHTML = 'Show Map';
				self.mapHidden = true;
				console.log('true');
			} else {
				document.getElementById('map').style.height = '350px';
				document.getElementById('hideMap' + fpID).innerHTML = 'Hide Map';
				self.mapHidden = false;
				console.log('false')
			};
		}

		//Event handlers ---------------------------------------------------------

		this.addShotButtonEvent = function(){
			//adds listener for add shot button

			var button = document.getElementById('addShot' + fpID);
			button.addEventListener('click', this.addShot, false);
		};

		this.focusMapButtonEvent = function(){
			var button = document.getElementById('focusMap' + fpID);
			button.addEventListener('click', this.focusMap, false);
		};

		this.hideMapButtonEvent = function(){
			var button = document.getElementById('hideMap' + fpID);
			button.addEventListener('click', this.mapVisibility, false);
		}



		//------------------------------------------------------------------------

		//sets inital listener state upon Firing Point object instantiation
		this.addShotButtonEvent();
		this.focusMapButtonEvent();
		this.hideMapButtonEvent();
	}


	function Shot(shotID, fpID, weapons){
		//Shot class	

		this.shotID = shotID;	
		this.fpID = fpID;
		this.weapon;
		this.rounds;
		this.timestamp;
		this.flexID;
		this.lat;
		this.lng;
		this.comments = '';
		this.JSON;
		this.inList = false;
		this.weaponList = [];
		this.coordinates;
		this.distance;
		this.marker;
		
		var self = this;

		// this.toString = function(){
		// 	return 'This Shot ID: ' + self.shotID;
		// }

		this.getTime = function(){
			//Gets system time
			//TODO:  change to db request for db server time

			var d = new Date();
			var time = d.toTimeString().split(' ')[0];
			view.addShotTimestamp(self.shotID, fpID, time);
			
			document.getElementById('fp_' + self.fpID + '_shot_' + self.shotID + '_getTime').style.display = 'none';
			document.getElementById('fp_' + self.fpID + '_shot_' + self.shotID + '_timeStamp').readOnly = true;
			// self.save();
			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_save').style.display = "inline";

		};

		//Event handlers -----------------------------------------------------------------------------

		this.addTimestampEventListener = function(){
			//adds listener for timestamp button

			var button_Timestamp = document.getElementById('fp_' + self.fpID + '_shot_' + self.shotID + '_getTime');		
			button_Timestamp.addEventListener('click', this.getTime, false);
		};

		this.addSaveEventListener = function(){
			//adds listener for save event button

			var button_Save = document.getElementById('fp_' + self.fpID + '_shot_' + self.shotID + '_save');
			button_Save.addEventListener('click', this.save, false);
		};

		this.removeSaveEventListener = function(){
			//removes listener for save event button

			var button_Save = document.getElementById('fp_' + self.fpID + '_shot_' + self.shotID + '_save');
			button_Save.removeEventListener('click', this.save, false);
		};

		this.addEditEventListener = function(){
			//adds listener for edit event button

			var button_Save = document.getElementById('fp_' + self.fpID + '_shot_' + self.shotID + '_save');
			button_Save.addEventListener('click', this.edit, false);
		};

		this.removeEditEventListener = function(){
			//removes listener for edit event button

			var button_delete = document.getElementById('fp_' + self.fpID + '_shot_' + self.shotID + '_save');
			button_delete.removeEventListener('click', this.edit, false);
		};

		this.addDeleteEventListener = function(){
			//adds listener for edit event button

			var button_delete = document.getElementById('fp_' + self.fpID + '_shot_' + self.shotID + '_delete');
			button_delete.addEventListener('click', this.deleteShot, false);
		};

		// this.removeDeleteEventListener = function(){
		// 	//removes listener for edit event button

		// 	var button_Save = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_delete');
		// 	button_Save.removeEventListener('click', this.deleteShot, false);
		// };

		this.addDisableNewShotEventListener = function(){
			//adds disable new shot event listener to save button

			var button_Save = document.getElementById('fp_' + self.fpID + '_shot_' + self.shotID + '_save');
			button_Save.addEventListener('click', this.disableAddShotButton, false);
		};

		this.removeDisableNewShotEventListener = function(){
			//removes disable new shot event listener to save button

			var button_Save = document.getElementById('fp_' + self.fpID + '_shot_' + self.shotID + '_save');
			button_Save.removeEventListener('click', this.disableAddShotButton, false);
		};

		this.disableAddShotButton = function(){
			//diables add shot button and removes event listener for disabling new shot

			view.disableAddShotButton(self.fpID);
			self.removeDisableNewShotEventListener();
		};

		//-----------------------------------------------------------------------------------------------

		this.save = function(){
			//saves Dom input info to field variables, formats JSON, handles event listener states

			self.weapon = document.getElementById('fp_' + self.fpID + '_shot_' + self.shotID + '_weapon').value;
			self.rounds = document.getElementById('fp_' + self.fpID + '_shot_' + self.shotID + '_rounds').value;
			self.timestamp = document.getElementById('fp_' + self.fpID + '_shot_' + self.shotID + '_timeStamp').value;

		// Simulation === gets gps coordinates --------------------------------------
			//TODO:  Db query to check for related incidents
			
			// if(self.inList === false){
			// 	self.coordinates = shotSimulation.getGPS();
				
			// 	if(confirm('Flex ID ' + self.coordinates[0] + '?')){
			// 		var shot = document.getElementById('fp_' + self.fpID + '_shot_'+ self.shotID +'_flexID'); 
			// 		shot.value = self.coordinates[0];
			// 		self.flexID = self.coordinates[0];					
			// 		self.lat = self.coordinates[1];
			// 		self.lng = self.coordinates[2];
			// 		self.createMarker();					
			// 	}
				
			// } else {
			// 	self.lat = parseFloat(document.getElementById('fp_' + self.fpID + '_shot_' + self.shotID + '_lat').value);
			// 	self.lng = parseFloat(document.getElementById('fp_' + self.fpID + '_shot_' + self.shotID + '_lng').value);
			// 	self.createMarker();
			// }

			//-----------------------------------------------------------------------
			
			var ID = document.getElementById('fp_' + self.fpID + '_shot_' + self.shotID + '_flexID');

			if (ID.value === ''){

				ID.value = '-9999';
				self.flexID = ID.value;	
				self.lat = '';
				self.lng = '';	

			} else {

				if(ID.value !== '-9999'){
					self.flexID = ID.value;
					self.lat = parseFloat(document.getElementById('fp_' + self.fpID + '_shot_' + self.shotID + '_lat').value);
					self.lng = parseFloat(document.getElementById('fp_' + self.fpID + '_shot_' + self.shotID + '_lng').value);
					if(self.lat && self.lng){
						self.createMarker();
						self.calculateDistanceFromFP();
						view.addLatLongToShot(self.shotID, self.fpID, self.lat, self.lng, self.distance);
					};
				};
			};

			self.comments = document.getElementById('fp_' + self.fpID + '_shot_' + self.shotID + '_comments').value;

			self.JSON = {
				// "firingPoint": "Firing Point " + self.fpID,
				"shot": self.shotID,
				"weapon": self.weapon, 
				"rounds": self.rounds, 
				"timestamp": self.timestamp, 
				"flexID": self.flexID, 
				"lat": self.lat,
				"long": self.lng,
				"distance": self.distance,
				"comments": self.comments
			};

			document.getElementById('addShot' + self.fpID).disabled = false;
			self.removeSaveEventListener();
			self.addEditEventListener();
			view.disableShotsEditing(self.shotID, self.fpID);	
			if(self.inList === false){
				view.moveShotToList(self.shotID, self.fpID);	
				self.inList = true;
			};

			//Calculates Firing point and global detection rates
			dqv.calcDetection();
			dqv.firingPoints[self.fpID - 1].calcDetection();
			view.showDetectionRate();
			view.showFiringPointDetectionRate(self.fpID);
			view.setCurrentWeaponAndRound(fpID, shotID);						
		};

		this.edit = function(){
			//toggles event listeners from edit to save

			self.removeEditEventListener();
			self.addSaveEventListener();
			view.enableShotsEditing(self.shotID, self.fpID);
			self.populateWeaponMenu();
		};

		this.deleteShot = function(){

			//deletes shot and re-renders shot list with corrected shot ID's
			
			if(confirm('Delete shot ' + self.shotID + '?')){
				view.removeShotFromList(self.shotID, self.fpID);	
				
				//removes map marker
				if(self.marker){
					self.marker.setMap(null);
				}


				//removes shot from firing point shots array
				var fpArray = dqv.firingPoints[self.fpID - 1].shots;								
				fpArray.splice(self.shotID - 1, 1);				

				//resets shot ID numbers and re-renders shot to dom shotlist for all shots
				for (var i = 0; i < fpArray.length; i++){
					
					//removes shot from dom
					view.removeShotFromList(fpArray[i].shotID, fpArray[i].fpID);
					
					//sets new shot ID 
					fpArray[i].shotID = i + 1;
					
					//renders shot do dom shotlist					
					view.renderToList(fpArray[i].shotID, fpArray[i].fpID, fpArray[i].timestamp, fpArray[i].flexID, fpArray[i].lat, fpArray[i].lng, fpArray[i].distance, fpArray[i].comments)
					
					//populates weapon select, assigns value to weapon and rounds TODO: refactor
					var x = document.getElementById('fp_' + fpArray[i].fpID + '_shot_' + fpArray[i].shotID +'_weapon');	
					for (var k = 0; k < view.weaponList.length; k++){
				
						var w = document.createElement('option');
						w.text = view.weaponList[k];					
						x.add(w);
					};		 

					x.value = fpArray[i].weapon;
					document.getElementById('fp_' + fpArray[i].fpID + '_shot_' + fpArray[i].shotID + '_rounds').value = fpArray[i].rounds;
					fpArray[i].inList = true;

					//sets event listeners for new dom render
					view.disableShotsEditing(fpArray[i].shotID, fpArray[i].fpID);
					fpArray[i].addEditEventListener();
					fpArray[i].addDeleteEventListener();

				};
				
				//re-Calculates Firing point and global detection rates
				dqv.calcDetection();
				dqv.firingPoints[fpID - 1].calcDetection();
				view.showDetectionRate();
				view.showFiringPointDetectionRate(fpID);		
				
			}

		}

		this.createMarker = function(){
			//removes map marker if it exists, then renders with new coordinates

			if(self.marker){
				self.marker.setMap(null);
			}
			self.marker = new google.maps.Marker({
  					position: {lat: self.lat, lng: self.lng}, 
  					title: self.flexID.toString(),
  					animation: google.maps.Animation.DROP
  				});

			mapControl.addShotMarker(self.marker);
		};

		this.populateWeaponMenu = function(){
			//populates shot menu with DQV info weapon settings

			var x = document.getElementById('fp_' + self.fpID + '_shot_' + self.shotID +'_weapon');			

			for (var i = 0; i < view.weaponList.length; i++){
				
				if (self.weaponList.indexOf(view.weaponList[i]) === -1){
					self.weaponList.push(view.weaponList[i]);
					var w = document.createElement('option');
					w.text = view.weaponList[i];					
					x.add(w);
				};
			};			 			
		};

		this.calculateDistanceFromFP = function(){
			//Calculates distance in meters from Firing Point coordinates
			
			if(self.lat && self.lng){

				var R = 6371000;
				var radLat1 = toRad(dqv.firingPoints[fpID - 1].lat);
				var radLat2 = toRad(self.lat);
				var radLatDiff = toRad(self.lat - dqv.firingPoints[fpID -1].lat);
				var radLngDiff = toRad(dqv.firingPoints[fpID - 1].lng - self.lng);
				
				var a = Math.sin(radLatDiff/2) * Math.sin(radLatDiff/2) +
						Math.cos(radLat1) * Math.cos(radLat2) *
						Math.sin(radLngDiff/2) * Math.sin(radLngDiff/2);

				var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
				var d = R * c;

				self.distance = d;	
			};		
		}

		//Sets initial event listener states and populates weapon menu

		this.addTimestampEventListener();
		this.addSaveEventListener();
		this.addDeleteEventListener();
		this.populateWeaponMenu();
	}

//------------------------------------------------------------
	function toRad(degrees){
		// Helper function to convert degrees to radians
		return degrees * Math.PI/180;
	}

//------------------------------------------------------------

	view = {

		//Methods for changing view states 

		addFiringPointToDom: function(fpID){

			//Adds Firing Point HTML to DOM

			var ul = document.getElementById('nav');
			var li = document.createElement('li');
			li.classList.add('menu');
			li.innerHTML = '<a href="#fp' + fpID + '">Firing Point ' + fpID + '</a>';
			ul.appendChild(li);
			setClicks();

			var FPC = document.querySelector("#tab-content");
			var fpDiv = document.createElement('DIV');
			fpDiv.id = 'fp' + fpID;
			fpDiv.classList.add('tab');
			// fpDiv.classList.add('active-tab');
			FPC.appendChild(fpDiv);
			fpDiv.innerHTML =  	'<div>'+
				'<fieldset class="fieldSet">'+
				'<legend> Firing Point ' + fpID + ' </legend>'+
				'<div id="fp">'+		
				'  Name: <input class="inputs" type="text" name="Name" id="name_firingPoint'+ fpID +'" value="">'+
				'  Lat: <input class="inputs" type="text" name="Lat" id="lat_firingPoint' + fpID + '" value="" style="width:75px">'+
				'  Long: <input class="inputs" type="text" name="Long" id="long_firingPoint'+ fpID + '" value="" style="width:75px">'+
				' <button class="pure-button button" type="button" id="focusMap' + fpID + '"><i class="fa fa-map-marker"></i> Focus Map </button>' +
				' <button class="pure-button button" type="button" id="hideMap' + fpID + '"><i class="fa fa-map-marker"></i> Hide Map </button>' +
				'  Comments:  <input class="inputs" type="text" name="FP_Comments" id="FP_comments' + fpID + '"value=""> ' +
				' Detection Rate: <input class="inputs type="text" style="width:50px" name="det rate" id="detRate' + fpID + '"" readOnly><br><br> ' +
				'Shots:  <button class="pure-button button" type="button" id="addShot' + fpID + '"><i class="fa fa-plus-circle"></i> Add</button><br>'+
				'<div id="spacer" style="height:20px"> ' +
				'<div id="shots' + fpID + '"></div> ' +
				'</div> ' +
				'<br><br> '+
				'</div>'+
				'<div class="shotList" id="shotList' + fpID + '"></div>' +
				'</fieldset>'+
				'</div><br>'
		},

		addShotToDom: function(shotID, fpID){

			//Adds Shot HTML to DOM

			var shotNumber = (shotID < 10) ? '0' + shotID: shotID;

			var FP = document.querySelector("#shots" + fpID);
			var shotDiv = document.createElement('DIV');
			shotDiv.id = 'shot' + shotID + 'fp_' + fpID;
			shotDiv.className = 'shots';
						
			if(shotID % 2 !== 0){
				shotDiv.style.backgroundColor = "#e5f0ff";
			}
			var first = FP.firstChild;
			FP.insertBefore(shotDiv, first);
			shotDiv.innerHTML = shotNumber + ': Weapon: <select id="fp_' + fpID + '_shot_' + shotID +'_weapon">' +
				'</select>    ' +
				'Rounds: <select id="fp_' + fpID + '_shot_'+ shotID +'_rounds">' +
				'<option value="1">1</option>' +
				'<option value="2">2</option>' +
				'<option value="3">3</option>' +
				'<option value="4">4</option>' +	
				'<option value="5">5</option>' +
				'<option value="6">6</option>' +			
				'</select>    ' +
				'TimeStamp: <input class="inputs" type="text" name="TimeStamp" id="fp_' + fpID + '_shot_'+ shotID +'_timeStamp" value="" style="width:50px">    ' +
				'ID: <input class="inputs" type="text" name="FlexID" id="fp_' + fpID + '_shot_'+ shotID +'_flexID" value="" style="width:45px; display:inline">   ' +
				'Lat: <input class="inputs" type="text" name="lat" id="fp_' + fpID + '_shot_' + shotID + '_lat" value="" style="width:65px; display:inline"> ' +
				'Lng: <input class="inputs" type="text" name="long" id="fp_' + fpID + '_shot_' + shotID + '_lng" value="" style="width:65px; display:inline"> ' +
				'Dist: <input class="inputs" type="text" name="dist" id="fp_' + fpID + '_shot_' + shotID + '_dist" value="" style="width:45px; display:inline" readonly> ' +
				'Comments: <input class="inputs" type="text" name="Comments" id="fp_' + fpID + '_shot_'+ shotID +'_comments" value="" style="width:75px">   ' +
				'<button class="pure-button" type="button" id="fp_' + fpID + '_shot_' + shotID + '_getTime"><i class="fa fa-dot-circle-o"></i> Shot </button>  ' +			
				'<button class="pure-button" type="button" id="fp_' + fpID + '_shot_' + shotID + '_save" style="display: none"><i class="fa fa-floppy-o"></i> Save </button> ' +
				'<button class="pure-button" type="button" id="fp_' + fpID + '_shot_' + shotID + '_delete" style="display: none"><i class="fa fa-minus-circle"></i> Delete </button><br><br> ' 
			
			

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
			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_lat').readOnly = true;
			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_lng').readOnly = true;
			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_comments').readOnly = true;
			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_save').innerHTML = '<i class="fa fa-pencil-square-o"></i> Edit ';
			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_delete').style.display = "none";
		},

		enableShotsEditing:  function(shotID, fpID){
			//Enables shot editing

			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_weapon').disabled = false;
			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_rounds').disabled = false;
			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_timeStamp').readOnly = false;
			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_flexID').readOnly = false;
			//document.getElementById('fp_' + fpID + '_shot_' + shotID + '_getTime').disabled = false;
			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_lat').readOnly = false;
			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_lng').readOnly = false;

			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_comments').readOnly = false;
			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_save').innerHTML = '<i class="fa fa-floppy-o"></i> Save ';
			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_delete').style.display = "inline";

		},

		disableDQVInfoEditing: function(){
			//Disables DQV Info Editing	

			document.getElementById('dqvname').readOnly = true;
			document.getElementById('city').readOnly = true;
			document.getElementById('datepicker').readOnly = true;
			document.getElementById('personnel').readOnly = true;
			document.getElementById('9mm').disabled = true;
			document.getElementById('.40').disabled = true;
			document.getElementById('.45').disabled = true;
			document.getElementById('other').disabled = true;
			document.getElementById('otherWeapon').disabled = true;
			document.getElementById('comment_DQV').readOnly = true;
			document.getElementById('saveInfo').innerHTML = '<i class="fa fa-pencil-square-o"></i> Edit DQV Info ';
		},

		enableDQVInfoEditing: function(){
			//Enables DQV Info Editing

			document.getElementById('dqvname').readOnly = false;
			document.getElementById('city').readOnly = false;
			document.getElementById('datepicker').readOnly = false;
			document.getElementById('personnel').readOnly = false;
			document.getElementById('9mm').disabled = false;
			document.getElementById('.40').disabled = false;
			document.getElementById('.45').disabled = false;
			document.getElementById('other').disabled = false;
			document.getElementById('otherWeapon').disabled = false;
			document.getElementById('comment_DQV').readOnly = false;
			document.getElementById('saveInfo').innerHTML = '<i class="fa fa-floppy-o"></i> Save DQV Info';
		},

		moveShotToList: function(shotID, fpID){
			//Moves shot Div to shot list Div			
			var shotList = document.getElementById('shotList' + fpID);
			var shot = document.getElementById('shot' + shotID + 'fp_' + fpID);
			// document.getElementById('fp_' + fpID + '_shot_' + shotID + '_save').style.display = "inline";
			// document.getElementById('fp_' + fpID + '_shot_' + shotID + '_flexID').style.display = "inline";

			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_getTime').style.display = "none";
			var lat = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_lat');
			// lat.style.display = "inline";
			lat.readOnly = true;
			var lng = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_lng');
			// lng.style.display = "inline";
			lng.readOnly = true;

			var dist = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_dist');
			// dist.style.display = "inline";
			dist.readOnly = true;

			

			shotList.appendChild(shot);
		},

		removeShotFromList: function(shotID, fpID){
			var SL = document.querySelector("#shotList" + fpID);
			
			var shotDiv = document.getElementById('shot' + shotID + 'fp_' + fpID);
			SL.removeChild(shotDiv);

		},

		renderToList: function(shotID, fpID, timestamp, flexID, lat, lng, dist, comments){
			
			//renders completed shot to shotlist .... need to re-use/re-factor for loading session as well

			var dist = (dist) ? dist.toFixed(2) : '';
			var shotNumber = (shotID < 10) ? '0' + shotID: shotID;

			var FP = document.querySelector("#shotList" + fpID);
			var shotDiv = document.createElement('DIV');
			shotDiv.id = 'shot' + shotID + 'fp_' + fpID;
			shotDiv.className = 'shots';
						
			if(shotID % 2 !== 0){
				shotDiv.style.backgroundColor = "#e5f0ff";
			}
			// var first = FP.firstChild;
			FP.appendChild(shotDiv);
			shotDiv.innerHTML = shotNumber + ': Weapon: <select id="fp_' + fpID + '_shot_' + shotID +'_weapon"> ' +
			'</select>    ' +
			'Rounds: <select id="fp_' + fpID + '_shot_'+ shotID +'_rounds">' +
			'<option value="1">1</option>' +
			'<option value="2">2</option>' +
			'<option value="3">3</option>' +
			'<option value="4">4</option>' +	
			'</select>    ' +
			'TimeStamp: <input class="inputs" type="text" name="TimeStamp" id="fp_' + fpID + '_shot_'+ shotID +'_timeStamp" value="'+ timestamp + ' "style="width:60px">    ' +
			'<input class="inputs" type="text" name="FlexID" id="fp_' + fpID + '_shot_'+ shotID +'_flexID" value="' + flexID + '" style="width:60px; display:none">   ' +
			'<input class="inputs" type="text" name="lat" id="fp_' + fpID + '_shot_' + shotID + '_lat" value="'+ lat + '" style="width:75px; display:none"> ' +
			'<input class="inputs" type="text" name="long" id="fp_' + fpID + '_shot_' + shotID + '_lng" value="' + lng + '" style="width:75px; display:none"> ' +
			'<input class="inputs" type="text" name="dist" id="fp_' + fpID + '_shot_' + shotID + '_dist" value="' + dist + '" style="width:50px; display:none"> ' +
			'Comments: <input class="inputs" type="text" name="Comments" id="fp_' + fpID + '_shot_'+ shotID +'_comments" value="' + comments + '">   ' +
			'<button class="pure-button" type="button" id="fp_' + fpID + '_shot_' + shotID + '_getTime"><i class="fa fa-dot-circle-o"></i> Shot </button>  ' +			
			'<button class="pure-button" type="button" id="fp_' + fpID + '_shot_' + shotID + '_save" style="display: none"><i class="fa fa-floppy-o"></i> Save </button> ' +
			'<button class="pure-button" type="button" id="fp_' + fpID + '_shot_' + shotID + '_delete" style="display: none"><i class="fa fa-minus-circle"></i> Delete </button><br><br> ' 
			
			
			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_save').style.display = "inline";
			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_flexID').style.display = "inline";

			document.getElementById('fp_' + fpID + '_shot_' + shotID + '_getTime').style.display = "none";
			var lat = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_lat');
			lat.style.display = "inline";
			lat.readOnly = true;
			var lng = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_lng');
			lng.style.display = "inline";
			lng.readOnly = true;

			var dist = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_dist');
			dist.style.display = "inline";
			dist.readOnly = true;
			



		},


		disableAddShotButton: function(fpID){
			//disables add shot button

			document.getElementById('addShot' + fpID).disabled = true;
		},

		// Global weaponlist TODO: do something else here
		weaponList: [],

		currentWeapon: 0, 
		currentRound: '1',

		setCurrentWeaponAndRound: function(fpID, shotID){
			
			view.currentWeapon = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_weapon').selectedIndex;							
			view.currentRound = document.getElementById('fp_' + fpID + '_shot_' + shotID + '_rounds').value;

			// console.log(view.currentWeapon + ' ' + view.currentRound);
			
		},

		addLatLongToShot: function(shotID, fpID, lat, lng, dist){

			//populates lat, long, and distance input fields for shot
			if(lat && lng && dist){
				if(!isNaN(lat) && !isNaN(lng) && !isNaN(dist)){
					document.getElementById('fp_' + fpID + '_shot_' + shotID + '_lat').value = lat;
					document.getElementById('fp_' + fpID + '_shot_' + shotID + '_lng').value = lng;
					document.getElementById('fp_' + fpID + '_shot_' + shotID + '_dist').value = dist.toFixed(2);
				};
			};
		},

		newFiringPointFocus: function(fpID){
			//sets focus to new firing point when added
			$('#fp' + fpID).addClass('active-tab').siblings().removeClass('active-tab');			
		}, 

		showFiringPointDetectionRate: function(fpID){

			//populates firing point detection rate field
			var detRate = Math.round(dqv.firingPoints[fpID -1].detectionRate);

			if(!isNaN(detRate)){
				document.getElementById('detRate' + fpID).value =  detRate +  '%';			
			};
		},

		showDetectionRate: function(){
			//populates global detection rate fields

			var detRate = Math.round(dqv.detectionRate);

			if(!isNaN(detRate)){
				document.getElementById('detection_rate').value = Math.round(dqv.detectionRate) +  '%';
			};
			document.getElementById('detected').value = dqv.detected;
			document.getElementById('missed').value = dqv.missed;
			document.getElementById('mislocated').value = dqv.mislocated;
		}
	};

	//Simulation of matching incidents from database---------------------------------------------------
	shotSimulation = {

		gps: [[3000, 44.776158, -68.765924], [3001, 44.776088, -68.766101], [3002, 44.776061, -68.766019], [3003, 44.776046, -68.766071], [3004, 44.775873, -68.766139]],

		getGPS: function(){
			randomNumber = Math.floor((Math.random() * shotSimulation.gps.length));
			return shotSimulation.gps[randomNumber];
		}
	};

	//Sets event handlers for menu------------------------------------------------------------------------

	function setClicks(){
   		$('.tabs .tab-links a').on('click', function(e)  {
        	var currentAttrValue = jQuery(this).attr('href');
	      
		        // Show/Hide Tabs
	    	$(currentAttrValue).addClass('active-tab').siblings().removeClass('active-tab');

	    	if(currentAttrValue !== "#dqvinfo"){
	    		mapControl.centerFiringPointFromMenu(currentAttrValue.split('p')[1]);
	    	}		 
		        
        	e.preventDefault();
	    });
   	}

   	setClicks();

})();
