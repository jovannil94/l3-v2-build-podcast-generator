import React, { useState, useRef, useEffect }  from "react";

const AudioGenerator = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [buttonName, setButtonName] = useState('Select Audio File');
    const [buttonClass, setButtonClass] = useState('primary-button');
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [result, setResult] = useState(null);

    const triggerFileInput = () => {
        document.getElementById('file-input').click();
    };

    const handleFileChange = (e) => {
        e.preventDefault();

        const file = e.target.files[0];
        if(file && file.type.startsWith('audio/')) {
            setSelectedFile(file);
        } else {
            alert('Please select valid audio file');
            setSelectedFile(null);
        }
    };

    const handlePlayPause = () => {
        if(isPlaying) {
            audioRef.current.pause();
            setButtonClass("primary-button");
        } else {
            audioRef.current.play();
            setButtonClass("stop-button");;
        }
        setIsPlaying(!isPlaying);
    }

    const parseLine = (line) => {
        const match = line.match(/\*\*(.*?)\*\*\s*(?:\[(\d{1,2}:\d{2})\]|\s*(\d{1,2}:\d{2}))\s*(.+)/);
        if (!match) return null;
    
        return {
            timestamp: match[2] || match[3],
            speaker: match[1],
            text: match[4],
        };
    };   

    const handleGeneratePodcast = async () => {
        setResult(null);
        if (!selectedFile) return;
    
        setLoading(true);
        const formData = new FormData();
        formData.append("audio", selectedFile);
    
        try {
          const response = await fetch("http://localhost:5000/api/generate-podcast", {
            method: "POST",
            body: formData,
          });
          const result = await response.json();
          if (response.ok) {
            setResult(result.text);
          } else {
            console.error("Error generating podcast:", result.message);
            alert('Error generating podcast');
          }
        } catch (error) {
          console.error("Error:", error);
          alert('There has been an error, we apologize for the inconvenience');
        } finally {
          setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedFile) {
            setAudioUrl(URL.createObjectURL(selectedFile));
            setButtonName(selectedFile.name);
            setResult(null);
        }
        
    }, [selectedFile]);

    return (
        <div className='context-container'>
            <button className="secondary-button" onClick={triggerFileInput}>{buttonName}</button>
            <input id="file-input" type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleFileChange}/>
            {selectedFile ? <button className="primary-button" onClick={handleGeneratePodcast}>Generate Podcast</button> : null}
            {selectedFile ? <button className={buttonClass} onClick={handlePlayPause}>{isPlaying ? "Stop" : "Play Podcast"}</button>: null}
            <audio ref={audioRef} src={audioUrl}/>
            <div>
                {loading && <p>Generating Podcast...</p>}
                {result && (
                    <div>
                        <h2>Generated Script:</h2>
                        {result.map((line, i) => {
                            return (
                                <div key={i} className="script-container">
                                    <span style={{ fontWeight: 'bold', marginRight: '10px' }}>[{line.timestamp}]</span>
                                    <span style={{ fontWeight: 'bold', marginRight: '10px' }}>{line.speaker}:</span>
                                    <span>{line.text}</span>
                                </div>
                            )
                        })}
                    </div>  
                )}
            </div>
        </div>
    )
};

export default AudioGenerator;