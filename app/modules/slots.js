const config = require('../config/config.json');
const skin = require('../skins/' + config.skin);

const reelCount = skin.rouletteReels;
const faceCount = skin.rouletteFaces;
const rollMin = (skin.useWildcardFace === true) ? 0 : 1;

module.exports = {

    template : function() {
        let output = {};

        output.reelCount = reelCount;

        return output;
    },

    roll : function() {
        let output = {};
        output.result = [];

        console.log(`Rolling ${reelCount} reels between ${rollMin} and ${faceCount}`)
        for (i = rollMin; i < reelCount; i++) {
            output.result.push(Math.floor(Math.random() * (faceCount) + rollMin))
        }
        console.log(`Result: ${output.result}`)

        return output;
    }
}