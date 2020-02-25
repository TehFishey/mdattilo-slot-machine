const config = require('../config/config.json');
const skin = require('../skins/' + config.slotsSkin);

const reelCount = skin.rouletteReels;
const faceCount = skin.rouletteFaces;
const bonusOdds = skin.bonusOdds;
const rollMin = (skin.useWildcardFace === true) ? 0 : 1;

exports.template = function() {
    let output = {};

    output.reelCount = reelCount;
    output.faceCount = faceCount;
    output.resourcesDirectory = skin.resourcesDirectory;
    output.faceMappings = skin.faceMappings;
    output.usingWildcard = skin.useWildcardFace;

    return output;
},

exports.spin = function(req, isBonus) {
    let output = {};
    
    output.result = spinReels(rollMin, faceCount, reelCount);
    output.winType = calcWin(output.result);

    if (!isBonus) {
        output.bonus = (Math.random() < bonusOdds);
        if (output.bonus) {
            output.bonusRoll = exports.spin(null, true);
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
