const box = document.getElementById('slotmachine-box');
const feedback = document.getElementById("feedback-text");
const frame = document.getElementById('slotmachine-frame');
const stage = document.getElementById("slotmachine-stage");
const spinButton = document.getElementById('slotmachine-button');

/*
This module has two functions:

1) It dynamically constructs HTML objects (including an array of 3d 'reels') based on 
the server's slots.template() output.

2) It handles '?spin' requests by the user, and animates & manipulates the view based on the 
server's response.
*/


let reelMap = []; // index == reel number; maps to reel html object
let positionMap = [0,0,0]; // index == reel number, maps to that reel's current rotation (in degrees);

// This global manages information about what images/slots should appear on the reels,
// as well as the rotation degrees associated with each slot. It's used mostly by buildTemplate().
let slotFaces = {
    wildcardOffset : 0,
    imageMap : [],
    degreeMap : []
};


// We start by building the HTML objects. This is done immediately upon page load...
buildTemplate();

// ...we then set up the event listener for the "Spin" button.
spinButton.addEventListener('click', async _=> {
    if (!spinButton.classList.contains("disabled")) {
        try {
            // Fetch the spin-response .json on click...
            const response = await fetch(window.location.href + '?spin');
            const results = await response.json();
            console.log('Recieved response object: ', results);

            // ...do a pretty thing with the UI...
            feedback.innerHTML = 'Rolling!';

            // ...and run the spin function.
            spinSlots(results);
        
        } catch(err) {
            console.error(`Error: ${err}`);
        }
    }
});

/**********************************************
            "SPIN" Feature
***********************************************/

// This function controlls the page's 'Spin' animations.
function spinSlots(json) {
    
    // Start by disabling the 'spin' button. We do this from inside the function so that we don't run into 
    // async issues with the setTimeout()
    spinButton.classList.add("disabled");

    // Make each reel spin for a bit, and then land on the face which matches the server's output.
    for (i = 0; i < json.result.length; i++) {
        
        // Reels will rotate counter-clockwise 6+{reel number} times, and then spin to the proper faces.
        let targetDegrees = -(slotFaces.degreeMap[json.result[i]] + 360*(6+i));
        let time = 3+i; // oops, it should be 3+i*.5. 

        // Set the CSS variables:
        reelMap[i].style.setProperty('--startPos', `${positionMap[i]}deg`)
        reelMap[i].style.setProperty('--targetPos', `${targetDegrees}deg`)
        reelMap[i].style.setProperty('--spinTime', `${time}s`)

        // We use a nifty CSS hack to restart the spin animation:
        // Remove the animation class, trigger a reflow on the object, then add the class again.
        // See: https://css-tricks.com/restart-css-animation/
        reelMap[i].classList.remove("spin-animation");
        void reelMap[i].offsetWidth;
        reelMap[i].classList.add("spin-animation");

        // After the spin, save a normalized value for what face we've landed on.
        // If we saved our actual targetDegrees, the reel wouldn't move much for the next spin.
        positionMap[i] = slotFaces.degreeMap[json.result[i]];
    }
    
    // Set a timeout while the reels spin, then play a little animation when they're done.
    setTimeout( () => {
        switch (json.winType) {
        case 'bigWin':
            frame.style.setProperty('--startColor', '#e0caa8');
            frame.style.setProperty('--flashColor', '#00d655');
            frame.classList.remove("small-flash-animation");
            frame.classList.remove("large-flash-animation");
            void frame.offsetWidth;
            frame.classList.add("large-flash-animation");

            feedback.innerHTML = 'Big Winner!'
            break;
        case 'smallWin':
            frame.style.setProperty('--startColor', '#e0caa8');
            frame.style.setProperty('--flashColor', '#00d655');
            frame.classList.remove("small-flash-animation");
            frame.classList.remove("large-flash-animation");
            void frame.offsetWidth;
            frame.classList.add("small-flash-animation");

            feedback.innerHTML = 'Winner!'
            break;
        case 'noWin':
            frame.style.setProperty('--startColor', '#e0caa8');
            frame.style.setProperty('--flashColor', '#c36363');
            frame.classList.remove("small-flash-animation");
            frame.classList.remove("large-flash-animation");
            void frame.offsetWidth;
            frame.classList.add("small-flash-animation");

            feedback.innerHTML = 'Try Again...'
        break;
        }
        
        // If there's a bonus roll, display feedback to the user and run spinSlots() again (using json.bonusRoll as input)
        // otherwise, re-enable the 'spin' button.
        if (json.bonus) {
            setTimeout( () => {
                feedback.innerHTML = 'Bonus Roll!'
                spinSlots(json.bonusRoll);
            }, 750);
        } else spinButton.classList.remove("disabled");
    }, 3200 + ((json.result.length-1) * 1000));
}

/**********************************************
        "buildTemplate" Function
***********************************************/

async function buildTemplate() {
    try {
        // Fetch the template .json from the server on page load
        const response = await fetch(window.location.href + '?template');
        const json = await response.json();
        
        // If wildcards are turned off in the config, we're going to need to hide them our mappings.
        // We still want to map the wildcard as face 0 (so that our array indicies line up with the server's inputs),
        // but we don't want to actually use it.
        slotFaces.wildcardOffset = json.usingWildcard ? 0 : 1;

        let allFaceCount = json.faceCount + 1;
        let facesPerReel = allFaceCount - slotFaces.wildcardOffset;

        // Here we set up our mappings:
        for (i = slotFaces.wildcardOffset; i < allFaceCount; i++) {
            
            // Map the images to be displayed on each reel face. 
            if (json.faceMappings[i] !== undefined)
                slotFaces.imageMap[i] = 'resources/' + json.resourcesDirectory + '/' + json.faceMappings[i];

            // Map the rotation position associated with each reel face.
            slotFaces.degreeMap[i] = (360/(facesPerReel)) * i;
        };
        
        // Each reel is essentially a circle constructed out of {facesPerReel} lines which are tangential to the circle's circumference. 
        // To find how far each line must be from the circle's center, we need to first find the circle's radius (r=c/2pi) and work in reverse.
        // Formula taken from https://codepen.io/mops/pen/pKYOqW, because I'm terrible at trig :(
        let zOffset = Math.round((115/2)/Math.tan(Math.PI/facesPerReel)); 

        // Set various style elements based on how many reels we have and how large each reel is.
        stage.setAttribute("style", 
            `width: ${175*json.reelCount}px;
            -webkit-perspective: ${200*facesPerReel}; 
            -perspective: ${200*facesPerReel};`)
        if (json.reelCount > 3) box.setAttribute("style", `width: ${800+(json.reelCount-3) * 175}px`)

        // Create i reels, where i is defined by the slots config/template json.
        for (i=0; i < json.reelCount; i++) {
            let slotReel = document.createElement('div');
            slotReel.setAttribute("class", "reel");
            
            // For each reel, create n faces, and apply proper transforms to each of them.
            for (n=slotFaces.wildcardOffset; n < allFaceCount; n++) {
                let reelFace = document.createElement('div');
                reelFace.setAttribute("class", "reel-face");
                reelFace.setAttribute("style", 
                    `-webkit-transform: rotateX(${slotFaces.degreeMap[n]}deg) translateZ(${zOffset}px);
                    -transform: rotateX(${slotFaces.degreeMap[n]}deg) translateZ(${zOffset}px);`);
                
                // Place the proper image element into each reel face.
                reelFace.appendChild(slotImage(n));
                slotReel.appendChild(reelFace);
            }

            reelMap[i] = slotReel
            stage.appendChild(slotReel);
        }
        
    } catch(err) {
        console.error(`Error: ${err}`);
    }
};

// Simple helper function for finding image paths based on skin configs.
// In cases where the config doesn't define an image, it'll return a number instead.
function slotImage(index) {
    if (slotFaces.imageMap[index] !== undefined) {
        img = document.createElement("IMG");
        img.setAttribute("src", slotFaces.imageMap[index]);
        img.setAttribute("alt", index);
        img.setAttribute("class", "reel-img");
        return img;
    }
    else {
        num = document.createElement("A");
        num.innerHTML = index;
        return num;
    }
};