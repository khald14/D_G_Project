import CanvasDraw from "react-canvas-draw";
import React, {useRef, useState, useEffect} from 'react'
import './App.css';

function GameBoard(props){
  //Hooks.
  const canvasRef = useRef(null);//Ref to canvas.
  const [drawing, setDrawing] = useState("");//Drawing state.
  const [turn,setTurn] = useState(false);//Player turn, which player is drawing and which player is guessing.
  const [guessedWord, setGuessedWord] = useState("");//The guessed word.
  const [words, setWords] = useState([]);//The random words.
  const [selectedWord, setSelectedword] = useState("");//The selected word.
  const [gamePoints, setGamePoints] = useState("");//The game points.
  const [roundPoints, setRoundPoints] = useState(0);//easy=1,medium=3,hard=5.

  //Send the drawing to the other client.
  const handleDrawingSend = async () => {
    const drawingData = {
      room: props.room,
      username: props.username,
      drawing: drawing,
      selectedWord: selectedWord,
      roundPoints: roundPoints
    }
    await props.socket.emit("send_drawing",drawingData);
  };

  const deletePlace =()=>{
    document.getElementById("guess_input").placeholder("Guess the word...");
    document.getElementById("guess_input").value("");
  }

  //save the drawing 
  const saveDrawing = () => {
    setDrawing(canvasRef.current.getSaveData());
  }

  //Send the word to the other client 
  const handleWordSend = async () => {
    const data = {
      room: props.room,
      roundPoints: roundPoints
    }
    if(guessedWord === selectedWord){
      await props.socket.emit("send_success",data);
    }
    deletePlace();
  };

  //Receive the drawing from the other client.
  useEffect(() => {
    props.socket.on("receive_drawing", (data) => {
      canvasRef.current.loadSaveData(data.drawing,false);//Get the saved canvas state.
      setSelectedword(data.selectedWord)
      setRoundPoints(data.roundPoints);
    });
  }, [props.socket,drawing]);


  useEffect(() => {
    props.socket.on("receive_success", () => {
       props.socket.emit("change_turn");
      });
  }, [props.socket,]);

  //get the game points to view it on the screen.
  useEffect(() => {
    props.socket.on("game_points", (data) => {
       setGamePoints(data)
      });
  }, [props.socket,]);


  //check whos turn is it and give the drawer the random words.
  useEffect(() => {
    props.socket.emit("turn",props.room);
    props.socket.on("player_turn", (data) => {
    data === props.username ? setTurn(true) : setTurn(false)
  })
  props.socket.emit("get_words",props.room);
     props.socket.on("receive_words", (data) => {
      setWords(data);
    })
  }, [props.socket,props.username,props.room]);

  //Render the right view depend on the turn of the player.
  //If the turn for the player1 then render the canvas and the words for him.
  //Else render the guessing view.
return(
  <div>
    {turn ? ( 
      <div>
      <h2 className="game-header">Draw the Word!!</h2>
      <h5>gamePoints: {gamePoints}</h5>
      <div className="game-radios" >
          <input onChange={()=>{setSelectedword(words[0]);setRoundPoints(1)}} type="radio" /> {words[0]}
          <input onChange={()=>{setSelectedword(words[1]);setRoundPoints(3)}} type="radio" /> {words[1]}
          <input onChange={()=>{setSelectedword(words[2]);setRoundPoints(5)}} type="radio" /> {words[2]}
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
        canvasHeight= {500} canvasWidth= {500}
        brushRadius= {3} lazyRadius={0}
        brushColor= "black"
        hideGrid= {true}
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
            canvasHeight= {500} canvasWidth= {500}
            brushRadius= {3} lazyRadius={0}
            brushColor= "black"
            hideGrid= {true}
            ref={canvasRef}
            disabled= {true}
            />
          </div>
          <div> 
          <input onChange={(e)=>{setGuessedWord(e.target.value);}} placeholder="Guess the word..."></input>
            <button type="button" onClick={handleWordSend}>Send</button>
          </div>
      </div>
      )}
  </div>
)

}

export default GameBoard;
