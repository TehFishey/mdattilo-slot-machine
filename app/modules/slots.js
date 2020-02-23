const config = require('../config/config.json');
const skin = require('../skins/' + config.skin);

module.exports = {
    reelCount : skin.rouletteReels,
    faceCount : skin.rouletteFaces,
    rollMin : (skin.useWildcardFace === true) ? 0 : 1,

    roll : function() {
        let output = [];
        
        console.log(`Rolling ${this.reelCount} reels between ${this.rollMin} and ${this.faceCount}`)
        for (i = this.rollMin; i < this.reelCount; i++) {
            output.push(Math.floor(Math.random() * (this.faceCount) + this.rollMin))
        }
        console.log(`Result: ${output}`)

        return output;
    }
}