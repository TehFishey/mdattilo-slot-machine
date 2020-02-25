const config = require('../config/config.json');
const skin = require('../skins/' + config.slotsskin);

const reelCount = skin.rouletteReels;
const faceCount = skin.rouletteFaces;
const bonusOdds = skin.bonusOdds;
const rollMin = (skin.useWildcardFace === true) ? 0 : 1;

/*
Primary backend script for slots game. It's designed to be configurable/skinnable - value changes in the 'skin' json
defined by config.slotsSkin can adjust the numbers of slot reels & faces as well as other constants. This way, the gameplay can be 
customized without changing the actual code.

This module is able to respond to two AJAX queries: ?template and ?spin. ?template is called on page load, and feeds the view
information that's needed to dynamically construct its slot-machine elements. ?spin is called when the player requests a slot spin:
it generates random numbers, calculates wins/losses, rolls for the bonus (and recurrs in case there is one), and then feeds all results back
to the view. If else something backend- or database-related were to happen after a spin (adding or deducting 'coins' to a user, for example),
it would happen here.
*/

exports.template = function() {
    let output = {};

    //All of this information is needed for the View to construct a matching reel object & output appropriate data.
    output.reelCount = reelCount;
    output.faceCount = faceCount;
    output.resourcesDirectory = skin.resourcesDirectory;
    output.faceMappings = skin.faceMappings;
    output.usingWildcard = skin.useWildcardFace;

    return output;
},

exports.spin = function(req, isBonus) {
    let output = {};
    
    //I like subfunctions.

    //Generate a random number. 0 = a wildcard face. 
    //If wildcards are disabled in the config, it will return a minimum of 1.
    output.result = spinReels(rollMin, faceCount, reelCount);

    //Calcuate if the number outputs are a Big Win, Small Win, or Loss based 
    //on thresholds defined in the config.
    output.winType = calcWin(output.result);

    //Roll for the bonus. If there is one, the bonus' output json will be packaged together with this one.
    //Bonus rolls call spin() with a special flag. Right now, this is only used to keep bonii fron chaining,
    //but it could also be checked for other back-end purposes (such as making a bonus roll not cost the user coins.)
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
    
    //Just some random numbers.
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
    
    //Count the occurances of each number in the output array... 
    result.forEach((x) => {count[x] = (count[x] || 0) + 1;});
    //...then add the number of wildcard occurances to all of them (except the wildcards).
    count.forEach((x, i) => {if (i !== 0) count[i] += (count[0] || 0);});

    //Return/log output based on pre-defined win thresholds.
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
