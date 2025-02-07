const generateTranscript = async (req, res, next) => {
    try {
        let posts = await db.any(`SELECT * FROM posts`);
        res.status(200).json({
            status: "Success",
            message: "all posts",
            payload: posts
        })
    } catch (err){
        res.status(400).json({
            status: "Error",
            message: "Couldn't get all posts",
            payload: err
        })
        next()
    }
}

module.exports = { generateTranscript };