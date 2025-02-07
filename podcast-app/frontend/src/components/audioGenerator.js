import React, { useState, useRef, useEffect }  from "react";

const AudioGenerator = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [buttonName, setButtonName] = useState('Select Audio File');
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
            setButtonName(file.name);
        } else {
            alert('Please select valid audio file');
            setSelectedFile(null);
        }
    };

    const handlePlayPause = () => {
        if(isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    }

    const handleGeneratePodcast = async () => {
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
            setResult(result);
          } else {
            console.error("Error generating podcast:", result.message);
          }
        } catch (error) {
          console.error("Error:", error);
        } finally {
          setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedFile) {
            setAudioUrl(URL.createObjectURL(selectedFile));
        }
    }, [selectedFile]);

    return (
        <div className='context-container'>
            <button className="secondary-button" onClick={triggerFileInput}>{buttonName}</button>
            <input id="file-input" type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleFileChange}/>
            {selectedFile ? <button className="primary-button" onClick={handleGeneratePodcast}>Generate Podcast</button> : null}
            {selectedFile ? <button className="primary-button" onClick={handlePlayPause}>{isPlaying ? "Stop" : "Play Podcast"}</button>: null}
            <audio ref={audioRef} src={audioUrl}/>
            <div>
                {loading && <p>Generating Podcast...</p>}
                {result && (
                    <div>
                        <h2>Generated Script:</h2>
                        <p>{result.text}</p>
                    </div>  
                )}
            </div>
        </div>
    )
};

export default AudioGenerator;