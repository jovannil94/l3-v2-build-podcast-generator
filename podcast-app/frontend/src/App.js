import React, { useState }  from 'react';
import './App.css';
import AudioGenerator from './components/audioGenerator';
import TranscriptGenerator from './components/transcriptGenerator';

function App() {
  const [activeButton, setActiveButton] = useState('audio');

  const handleActiveButton = (type) => {
    setActiveButton(type)
  }
  return (
    <div className='app-container'>
      <h1>Podcast Generator</h1>
      <div className='button-container'>
        <button className={activeButton === 'audio' ? 'primary-button' : 'secondary-button'} onClick={() => handleActiveButton('audio')}>Upload Audio</button>
        <button className={activeButton === 'transcript' ? 'primary-button' : 'secondary-button'} onClick={() => handleActiveButton('transcript')}>Enter Transcript</button>
      </div>
      <div className='context-container'>
        {activeButton === 'audio' ? <AudioGenerator/> : <TranscriptGenerator/>}
      </div>
    </div>
  );
}

export default App;
