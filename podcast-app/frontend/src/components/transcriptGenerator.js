import React, { useState }  from "react";

const TranscriptGenerator = () => {
    const [transcriptContext, setTranscriptContext] = useState('');

    const handleTextChange = (e) => {
        e.preventDefault();
        setTranscriptContext(e.target.value)
    }

    const submitTranscript = (e) => {
        e.preventDefault();
        //TODO: Submit file to AI for deconstructing
    }

    return (
        <div className='context-container'>
            <textarea rows="10" cols="50" placeholder='Paste your transcript here...' onChange={handleTextChange}></textarea>
            {transcriptContext !== '' ? <button className="primary-button" onClick={submitTranscript}>Generate Podcast</button> : null}
        </div>
    )
};

export default TranscriptGenerator