import CanvasDraw from "react-canvas-draw";
import React, {useRef, useState, useEffect} from 'react'
import './App.css';

function GameBoard(props){
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState("");
  const [turn,setTurn] = useState(false);
  const [word, setWord] = useState("");
  const [words, setWords] = useState([]);
  const [selectedWord, setSelectedword] = useState("");
  const [gamePoints, setGamePoints] = useState("");

  
  const handleDrawingSend = async () => {
    const drawingData = {
      room: props.room,
      username: props.username,
      drawing: drawing,
      selectedWord: selectedWord
    }
    await props.socket.emit("send_drawing",drawingData);
  };


  const handleWordSend = async () => {
    const data = {
      room: props.room,
      username: props.username,
      drawing: drawing,
      selectedWord: selectedWord
    }
    //console.log(word,selectedWord);
    if(word === selectedWord){
      await props.socket.emit("send_success",data);
    }
  };


  useEffect(() => {
    props.socket.on("receive_success", () => {
       props.socket.emit("change_turn");
      });
  }, [props.socket,]);

  
  useEffect(() => {
    props.socket.on("game_points", (data) => {
       setGamePoints(data)
      });
  }, [props.socket,]);


  useEffect(() => {
    props.socket.on("receive_drawing", (data) => {
      canvasRef.current.loadSaveData(data.drawing,false);
      setSelectedword(data.selectedWord)
    });
  }, [props.socket,drawing]);


  useEffect(() => {
    props.socket.emit("turn",props.room);
    props.socket.on("player_turn", (data) => {
    data === props.username ? setTurn(true) : setTurn(false)
    // console.log(data,props.username);
  })
  props.socket.emit("get_words",props.room);
     props.socket.on("receive_words", (data) => {
      setWords(data);
      // console.log(data)
    })
  }, [props.socket,props.username,props.room]);


  const saveDrawing = () => {
    setDrawing(canvasRef.current.getSaveData());
  }

return(
  <div>
    {turn ? ( 
      <div>

      <h2 className="game-header">Draw the Word!!</h2>
      <h5>gamePoints: {gamePoints}</h5>
      <div className="game-radios" >
          <input onChange={()=>{setSelectedword(words[0])}} type="radio" value={words[0]} name="gender" /> {words[0]}
          <input onChange={()=>{setSelectedword(words[1])}} type="radio" value={words[1]} name="gender" /> {words[1]}
          <input onChange={()=>{setSelectedword(words[2])}} type="radio" value={words[2]} name="gender" /> {words[2]}
      </div>
      <button
          className="send-button"
            type="button"
            onClick={handleDrawingSend}
          >
            Send Drawing
          </button>
      <div className="game-canvas-container">
        <CanvasDraw 
        onChange={saveDrawing}
        brushRadius= {3} 
        brushColor= "black"
        hideGrid= {true}
        canvasWidth= {500}
        canvasHeight= {500}
        lazyRadius={0}
        ref={canvasRef}
        />
        </div>

      </div>
      ):(
        <div>
          <h2 className="game-header">Guess The Word!!</h2>
          <div className="game-canvas-container">
            <CanvasDraw
            onChange={saveDrawing}
            brushRadius= {3} 
            brushColor= "black"
            hideGrid= {true}
            canvasWidth= {500}
            canvasHeight= {500}
            lazyRadius={0}
            ref={canvasRef}
            disabled= {true}
            />
          </div>
          <div> 
          <input onChange={(e)=>{setWord(e.target.value)}} placeholder="Guess the word..."></input>
            <button type="button" onClick={handleWordSend}>Send</button>
          </div>
      </div>
      )}
  </div>
)

}

export default GameBoard;
