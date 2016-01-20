console.log("weeee");

function save(){
	console.log('yup');

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

	var sessionObject = {
		"city": city, 
		"date": date, 
		"personnel": personnel,
		"comments": comments,
		"name": name, 
		"latLong": latLong
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