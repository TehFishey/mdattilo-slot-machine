const config = require('../config/config.json');
const skin = require('../skins/' + config.slotsSkin);

const reelCount = skin.rouletteReels;
const faceCount = skin.rouletteFaces;
const rollMin = (skin.useWildcardFace === true) ? 0 : 1;

module.exports = {

    template : function() {
        let output = {};

        output.reelCount = reelCount;
        output.resourcesDirectory = skin.resourcesDirectory;
        output.faceMappings = skin.faceMappings;

        return output;
    },

    roll : function(req, rollType) {
        let output = {};
        output.result = [];

        console.log(`Rolling ${reelCount} reels between ${rollMin} and ${faceCount}`)
        for (i = 0; i < reelCount; i++) {
            output.result.push(Math.floor(Math.random() * (faceCount) + rollMin))
        }
        console.log(`Result: ${output.result}`)

        let count = []
        output.result.forEach((x) => {count[x] = (count[x] || 0) + 1;});
        count.forEach((x, i) => {if (i !== 0) count[i] += (count[0] || 0);});
        if (count.some((x) => {return x >= skin.minBigWin})) {
            output.winType = 'bigWin';
            console.log(`Result: Large win (threshold ${skin.minBigWin})`)
        }
        else if (count.some((x) => {return x >= skin.minSmallWin})) {
            output.winType = 'smallWin';
            console.log(`Result: Small win (threshold ${skin.minSmallWin})`)
        }
        else {
            output.winType = 'noWin';
            console.log(`Result: No win`)
        }

        if (rollType !== 'bonus') {
            output.bonus = (Math.random() < skin.bonusOdds);
            if (output.bonus) {
                output.bonusRoll = module.exports.roll(null, 'bonus');
            }
        } 
        else output.bonus = false; 
        return output;
    }
}