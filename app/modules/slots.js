module.exports = {
    reelCount : 3,
    faceCount : 5,

    roll : function() {
        let output = [];
        
        console.log(`Rolling ${this.reelCount} reels between 0 and ${this.faceCount}`)
        for (i = 0; i < this.reelCount; i++) {
            output.push(Math.floor(Math.random() * (this.faceCount + 1)))
        }
        
        console.log(`Result: ${output}`)
        return output;
    }
}