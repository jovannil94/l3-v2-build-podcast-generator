const fs = require("fs");
const path = require("path");
const { GoogleAIFileManager, FileState } = require("@google/generative-ai/server");
const { GoogleGenerativeAI } = require("@google/generative-ai");

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
          
        // View the response.
        console.log(
            `Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`,
        );
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent([
            {
              fileData: {
                mimeType: uploadResult.file.mimeType,
                fileUri: uploadResult.file.uri
              }
            },
            { text: "Generate a transcript of a podcast,highlight different commentators with timestamps during the conversation." },
        ]);
        fs.unlinkSync(tempFilePath);
        return res.status(200).json({
            success: true,
            status: "Success transcribed audio file",
            text: result.response.text(),
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