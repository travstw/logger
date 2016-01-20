var http = require('http');
var fs = require('fs');
var querystring = require('querystring');
var url = require('url');
// var db = require('./db.js');

//Server delivers static files and responds to http get requests 
http.createServer(function (req, res) {
	//Sends objects to router
		router(req, res);
 	
	}).listen(3000, 'localhost');
  // }).listen(3000, 'localhost');
console.log('Server running at http://127.0.0.1:3000/');

//Router
function router(req, res){
  reqObj = url.parse(req.url, false);
  // console.log(reqObj);
    
	if(reqObj.pathname === '/'){
      res.writeHead(200, {'Content-Type': 'text/html'});
        var file = fs.createReadStream('./index.html');
        
        file.on('readable', function(){
          this.pipe(res);
        });
        file.on('end', function(){
          res.end();
        });
  		
  	} else if(reqObj.pathname === '/logger.js'){
    		res.writeHead(200, {'Content-Type': 'application/javascript'});
    		var jsFile = fs.createReadStream('./logger.js');
    		
    		jsFile.on('readable', function(){
    			this.pipe(res);
    		});

    		jsFile.on('end', function(){
    			res.end();
    		});
  	
    } else if(reqObj.pathname === '/submit'){

          var dqvString ='';  

        req.on('data', function (data) {
          console.log(data.toString());
          dqvString += data;
        });  
        
        req.on('end', function(){
          
          console.log(dqvString);
          res.end();
        });
          
    }

} 



