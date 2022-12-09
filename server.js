
const http=require('http');
const server=http.createServer();
const io=require('socket.io')(server);

const {gameLoop,getUpdatedVelocity,initGame}=require('./game');
const {FRAME_RATE}=require('./constants');
const {makeid}=require('./utils');
const state={};
const clientRooms={};
io.on('connection',client=>{
    
    client.on('keydown',handleKeydown);
    client.on('newGame',handleNewGame);
    client.on('joinGame',handleJoinGame);
    client.on('chat',handlechat);

    function handlechat(msg)
    {
    console.log(msg);
    client.broadcast.emit('broadcast',msg);
    }
  /*  function handleJoinGame(roomName)
    {
    const room=io.sockets.adapter.rooms[roomName];
    let allUsers;
    if(room)
    {
    allUsers=room.sockets;
    }
    let numClients=0;
    if(allUsers)
    {
    numClients=Object.keys(allUsers).length;
    }
    if(numClients===0)
    {
    client.emit('unknowngame');
    return;
    }
    else if(numClients>1)
    {
    client.emit('too many players');
    return;
    }
    clientRooms[client.id]=roomName;
    client.join(roomName);
    client.number=2;
    client.emit('init',2);
    startGameInterval(roomName);
    }
*/  
function handleJoinGame(roomName){
    console.log(roomName);
    const room = io.sockets.adapter.rooms.get(roomName);
    
    let numClients = 0;
    if (room) {
        numClients = room.size;
    }
    console.log(numClients);
    if (numClients === 0) {
        client.emit('unknownGame');
        return;
    } else if (numClients > 1) {
        client.emit('tooManyPlayers');
        return;
    }


    clientRooms[client.id] = roomName;

    client.join(roomName);
    client.number = 2;
    client.emit('init', 2);

    startGameInterval(roomName);
}
    function handleNewGame()
    {
    let roomName=makeid(5);
    clientRooms[client.id]=roomName;
    client.emit('gameCode',roomName);
    state[roomName]=initGame();
    client.join(roomName);
    client.number=1;
    client.emit('init',1);
    }
    function handleKeydown(keyCode)
    {
    const roomName=clientRooms[client.id];
    if(!roomName)
    {
    return;
    }
    try
    {
        keyCode=parseInt(keyCode);
        console.log(keyCode);
    }catch(e)
    {
    console.error(e);
    return;
    }
    const vel=getUpdatedVelocity(keyCode);
    if(vel){
    state[roomName].players[client.number-1].vel=vel;
    }
    }
});
function startGameInterval(roomName)
{
const intervalId=setInterval(()=>{
const winner=gameLoop(state[roomName]);
if(!winner)
{
emitGameState(roomName,state[roomName]);
//client.emit('gameState',JSON.stringify(state));
}
else
{
emitGameOver(roomName,winner);
state[roomName]=null;
clearInterval(intervalId);
}
},1000/FRAME_RATE);
}

function emitGameState(room,gameState)
{
io.sockets.in(room)
    .emit('gameState',JSON.stringify(gameState));
}

function emitGameOver(room,winner)
{
io.sockets.in(room)
   .emit('gameOver',JSON.stringify({winner}));
}
const port=process.env.PORT||3000;
/* io.listen(3000,'0.0.0.0',function(){
    console.log('listening on *:3000');
  }); */
  server.listen(port,'0.0.0.0',()=>{
    console.log('listening on port number'+port)
  });

