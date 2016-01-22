

function save(){

	var http = new XMLHttpRequest();
  	var url = "/submit";
  	var params = buildJSON();
  	http.open("POST", url, true);
  	http.setRequestHeader("Content-type", "application/json");
  	http.send(params);
}


function buildJSON(){


	var city = document.querySelector("#city").value;
	var date = document.querySelector("#date").value;
	var personnel = document.querySelector("#personnel").value.split(',');
	var comments = document.querySelector("#comment_DQV").value;
	var name = document.querySelector("#name_firingPoint").value;
	var latLong = document.querySelector("#latLong_firingPoint").value;
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
			"latLong": latLong,	
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
	document.querySelector('#fp1Shot1_TimeStamp').value = time;

}