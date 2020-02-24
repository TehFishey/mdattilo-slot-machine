const config = require('../config/config.json');
const skin = require('../skins/' + config.slotsSkin);

const reelCount = skin.rouletteReels;
const faceCount = skin.rouletteFaces;
const rollMin = (skin.useWildcardFace === true) ? 0 : 1;

exports.template = function() {
    let output = {};

    output.reelCount = reelCount;
    output.resourcesDirectory = skin.resourcesDirectory;
    output.faceMappings = skin.faceMappings;

    return output;
},

exports.roll = function(req, isBonus) {
    let output = {};
    
    output.result = spinReels(rollMin, faceCount, reelCount);
    output.winType = calcWin(output.result);

    if (!isBonus) {
        output.bonus = (Math.random() < skin.bonusOdds);
        if (output.bonus) {
            output.bonusRoll = exports.roll(null, true);
        }
    } else output.bonus = false; 

    return output;
}

function spinReels(min, max, number) {
    result = []
    
    console.log(`Rolling ${number} reels between ${min} and ${max}`)
    min = Math.ceil(rollMin);
    max = Math.floor(faceCount);
    for (i = 0; i < number; i++) {
        result.push(Math.floor(Math.random() * (max - min + 1) + min))
    }
    console.log(`Result: ${result}`)

    return result;
}

function calcWin(result) {
    let count = []
    
    result.forEach((x) => {count[x] = (count[x] || 0) + 1;});
    count.forEach((x, i) => {if (i !== 0) count[i] += (count[0] || 0);});

    if (count.some((x) => {return x >= skin.minBigWin})) {
        console.log(`Result: Large win (threshold ${skin.minBigWin})`)
        return'bigWin';
    }
    else if (count.some((x) => {return x >= skin.minSmallWin})) {
        console.log(`Result: Small win (threshold ${skin.minSmallWin})`)
        return'smallWin';
    }
    else {
        console.log(`Result: No win`)
        return'noWin';
    }
}
