

function save(){

	var http = new XMLHttpRequest();
  	var url = "/submit";
  	var params = buildJSON();
  	http.open("POST", url, true);
  	http.setRequestHeader("Content-type", "application/json");
  	http.send(params);
}

var fpID = 0;
var shotID = 0;

function addFP(){
	fpID += 1;
	var FPC = document.querySelector("#fpContainer");
	var fpDiv = document.createElement('DIV');
	fpDiv.id = 'fp' + fpID;
	FPC.appendChild(fpDiv);
	fpDiv.innerHTML =  	'<div>'+
							'<fieldset>'+
								'<div id="fp">'+
									'<legend>Firing Point' + fpID + '</legend><br>'+
										'Name: <input type="text" name="Name" id="name_firingPoint'+ fpID +'" value="Parking Lot">'+
										'Latitude: <input type="text" name="Lat" id="lat_firingPoint' + fpID + '" value="45.345445">'+
										'Longitude: <input type="text" name="Long" id="long_firingPoint'+ fpID + '" value="-75.345445"><br><br>'+
					
										'Shots:  <button type="button" onclick="addShot()">Add</button>	<br><br>'+
											'<div id="shots"></div>'+
								'</div>'+
							'</fieldset>'+
						'</div>'	
}

function addShot(){
	shotID += 1;
	var FP = document.querySelector("#shots");
	var shotDiv = document.createElement('DIV');
	var first = FP.firstChild;
	FP.insertBefore(shotDiv, first);
	shotDiv.innerHTML = 'Weapon: <select id="fp1Shot' + shotID +'_Weapon">' +
									'<option value="9mm">9mm</option>' +
									'<option value=".40">.40</option>' +
									'<option value=".45">.45</option>' +
								'</select>    ' +

						'Rounds: <select id="fp1Shot'+ shotID +'_Rounds">' +
									'<option value="3">3</option>' +
									'<option value="1">1</option>' +		
								'</select>    ' +

						'TimeStamp: <input type="text" name="TimeStamp" id="fp1Shot'+ shotID +'_TimeStamp">    ' +
						'FlexID: <input type="text" name="FlexID" id="fp1Shot'+ shotID +'_FlexID" value="-9999">    ' +
						'<button type="button" onclick="getTime()">Shot</button><br>  '
}


function buildJSON(){


	var city = document.querySelector("#city").value;
	var date = document.querySelector("#date").value;
	var personnel = document.querySelector("#personnel").value.split(',');
	var comments = document.querySelector("#comment_DQV").value;
	var name = document.querySelector("#name_firingPoint").value;
	var latitude = document.querySelector("#lat_firingPoint").value;
	var longitude = document.querySelector("#long_firingPoint").value;
	var weapon = document.querySelector("#fp1Shot1_Weapon").value;
	var rounds = document.querySelector("#fp1Shot1_Rounds").value;
	var time = document.querySelector("#fp1Shot1_TimeStamp").value;
	var flexID = document.querySelector("#fp1Shot1_FlexID").value;

	var sessionObject = {
		"city": city, 
		"date": date, 
		"personnel": personnel,
		"comments": comments,
		"firingPoints": [{
			"name": name, 
			"latitude": latitude,
			"longitude": longitude,	
			"shots": [{
				"weapon": weapon,
				"rounds": rounds,
				"timestamp": time,
				"flexID": flexID
			}]
		}]
		
	};

	var sessionJSON = JSON.stringify(sessionObject);

	return sessionJSON;

}

function getTime(){
	//TODO:   Query database server time
	var d = new Date();
	var time = d.toTimeString().split(' ')[0];
	document.querySelector('#fp1Shot'+ shotID +'_TimeStamp').value = time;

}