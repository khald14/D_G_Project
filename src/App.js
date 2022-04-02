import './App.css';
import React, {useState} from 'react'
import io from 'socket.io-client'
import GameBoard from './GameBoard';

const socket = io.connect("http://localhost:3001");

function App() { 
  const [loggedIn , setLoggedIn] = useState(false);
  const [room , setRoom] = useState('');
  const [userName , setUserName] = useState('');


  const connectToRoom=()=>{
    if(userName !== "" && room !== ""){
      var PlayerData = {
        username : userName,
        room: room
      }
      socket.emit('join_room',PlayerData);
      setLoggedIn(true);
  }
}


  return (
    
    <div className="App">
      {loggedIn ? (<GameBoard socket = {socket} room = {room} username = {userName}/>):(
        <div className='Login'>
          <div className='Input'>
            <input type="text" placeholder='UserName...' onChange={(e)=>{setUserName(e.target.value)}}></input>
            <input type="text" placeholder='Room...' onChange={(e)=>{setRoom(e.target.value)}}></input>
          </div>
          <button onClick={connectToRoom}>Login</button>
        </div>
        )}
    </div>
  );
}

export default App;
