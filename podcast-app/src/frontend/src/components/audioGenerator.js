import React, { useState }  from "react";

const AudioGenerator = () => {
    const [selectedFile, setSelectedFile] = useState(null);

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
            selectedFile(null);
        }
    }

    const submitFile = (e) => {
        e.preventDefault();
        // TODO: Submit file to AI for deconstructing
    }

    return (
        <div className='context-container'>
            <button className="secondary-button" onClick={triggerFileInput}>Select Audio File</button>
            <input id="file-input" type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleFileChange}/>
            {selectedFile ? <button className="primary-button" onClick={submitFile}>Generate Podcast</button> : null}
        </div>
    )
};

export default AudioGenerator;