//The application dependencies
var fs = require("fs");
var http = require("http");
var express = require("express");

//The notifications file identifier variable
var n = "notifications.json";

//Initializing express
var app = express();

//Setting up configuration middleware
//Serve files from the current directory
app.use( express.static( __dirname + "/") );

//create a write stream to the notifications file
var val = fs.readFileSync(n);
var nVal = JSON.parse(val);

//LISTEN TO THE BROWSER'S CALL
app.route("/").all(function(request, response){
    response.sendFile( __dirname + "/chatForm.html");
})

//LISTEN TO THE BROWSER at the route '/addNote'
app.route("/addNote")
    .get( function(request, response ){
       fs.readFile(n, function(err, data){
           if(!err){
               response.json( JSON.parse(data) ); 
           }else{
               response.json([{"sender": "admin", "message": "Connection Error"}]);
           }
       })
    });

var server = http.createServer(app);

//Create a socket connection
var io = require("socket.io").listen(server);
io.sockets.on("connection", function(socket){
    
    socket.on("addNotification", function(notificationData){
       nVal.push((notificationData));
        console.log(nVal);
        //console.log(notificationData);
        var ki = fs.createWriteStream(n);
        ki.write(JSON.stringify(nVal));
        ki.close();
        io.sockets.emit("update",notificationData);            
        
    });
    
    socket.on("getNotifications", function(){
        console.log("notification update tried");
        socket.emit("notifications", nVal);
    });
    
});

server.listen(1234, function(){
    console.log("Listening on port 1234");
});