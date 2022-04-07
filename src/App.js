import './App.css';
import React, {useState,useEffect} from 'react'
import io from 'socket.io-client'
import GameBoard from './GameBoard';

const socket = io.connect("https://drawandguessf.herokuapp.com/");

function App() { 
  const [loggedIn , setLoggedIn] = useState(false);
  const [room , setRoom] = useState('');
  const [userName , setUserName] = useState('');
  const [waitingRoom, setWaitingRoom] = useState('true')
  const [playersNumber, setPlayersNumber] = useState(1);


  const connectToRoom=()=>{
    if(userName !== "" && room !== ""){
      var PlayerData = {
        username : userName,
        room: room
      }
      //join the room
      socket.emit('join_room',PlayerData);
      setLoggedIn(true);
      playersNumber ===1 ? setWaitingRoom(true) : setWaitingRoom(false);
  }
}

useEffect(() => {//Update the players number 
  socket.on("players_number", (data) => {
     setPlayersNumber(data)
    });
}, [playersNumber]);


useEffect(() => {//Refresh the page for player2 and send a message for player1 to start the game.
     if(playersNumber===2){
      setWaitingRoom(false)
      socket.emit("start",room);
     }
}, [playersNumber,room]);

useEffect(() => {//Refresh the page for player1.
  socket.on("start_game", () => {
    setWaitingRoom(false)
  });
}, [playersNumber]);


//Check if logged, if not make the player login first.
//If there are 2 players, start the game.
//If there are one player, render the waiting screen until the other player join. 
return (
  <div className="App">
    {loggedIn ? 
    (<div>{waitingRoom ? (<h1>Waiting for the other player....</h1>)
        :(<GameBoard socket = {socket} room = {room} username = {userName}/>)}</div>)
    :(<div className='Login'>
        <div className='Input'>
          <input type="text" placeholder='UserName...' onChange={(e)=>{setUserName(e.target.value)}}></input>
          <input type="text" placeholder='Room...' onChange={(e)=>{setRoom(e.target.value)}}></input>
        </div>
        <button onClick={connectToRoom}>Login</button>
      </div>)
    }
  </div>
);

}

export default App;
