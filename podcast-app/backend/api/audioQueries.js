const fs = require("fs");
const path = require("path");
const { GoogleAIFileManager, FileState } = require("@google/generative-ai/server");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { resourceUsage } = require("process");

const generatePodcast = async (req, res) => {
    if (!req.files || !req.files.audio) {
        return res.status(400).json({ success: false, message: "No audio file uploaded." });
    }
    const audioFile = req.files.audio;
    const tempFilePath = path.join(__dirname, "temp", audioFile.name);
    
    try {
        if (!fs.existsSync(path.join(__dirname, "temp"))) {
            fs.mkdirSync(path.join(__dirname, "temp"));
        }

        fs.writeFileSync(tempFilePath, audioFile.data);

        const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
        const uploadResult = await fileManager.uploadFile(tempFilePath, {
            mimeType: audioFile.mimetype,
            displayName: audioFile.name,
        });
        let file = await fileManager.getFile(uploadResult.file.name);
        while (file.state === FileState.PROCESSING) {
            process.stdout.write(".");
            await new Promise((resolve) => setTimeout(resolve, 10_000));
            file = await fileManager.getFile(uploadResult.file.name);
        }
          
        if (file.state === FileState.FAILED) {
            throw new Error("Audio processing failed.");
        }
          
        console.log(
            `Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`,
        );
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent([
            {
              fileData: {
                mimeType: uploadResult.file.mimeType,
                fileUri: uploadResult.file.uri
              }
            },
            { text: "Please provide a detailed transcription of this audio file, identifying each speaker of the podcast with labels ('Speaker 1', 'Speaker 2', etc.) and including timestamps for each spoken phrase.  Use a consistent format like **Speaker 1 [00:02]** Hey this happens all the time." },
        ]);
        fs.unlinkSync(tempFilePath);

        let transcript = [];
        console.log(result.response.text())
        if(result.response.text()) {
            transcript = result.response.text()
            .trim()
            .split("\n")
            .map(line => {
                //NOTICE: Gemini is a bit inconsitent with its output, this regex and parsing is meant to give frontend consistent formatting
                const match = line.match(/^\*\*Speaker\s+(\d+)\s*\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\*\*\s*(.+)$/);
                if(match) {
                    return {
                        speaker: `Speaker ${match[1]}`,
                        timestamp: match[2] || null,
                        text: match[3].trim(),
                    };
                } else {
                    return null
                }
            })
            .filter(parsed => parsed !== null);
        }
        
        return res.status(200).json({
            success: true,
            status: "Success transcribed audio file",
            text: transcript,
        });
    } catch (error){
        console.error("Error with Gemini:", error);
        fs.unlinkSync(tempFilePath);
        return res.status(500).json({ 
            success : false,
            message: "Error generating with Gemini"
        })
    }
}

module.exports = { generatePodcast };