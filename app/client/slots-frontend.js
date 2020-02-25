const box = document.getElementById('slotmachine-box');
const feedback = document.getElementById("feedback-text");
const frame = document.getElementById('slotmachine-frame');
const stage = document.getElementById("slotmachine-stage");
const spinButton = document.getElementById('slotmachine-button');

let reelMap = []; // takes index == reel number, outputs that reel object
let positionMap = [0,0,0]; // takes index == reel number, output that reel's current rotation (in degrees);

let slotFaces = {
    wildcardOffset : 0,
    imageMap : [],
    degreeMap : []
};

buildTemplate();

spinButton.addEventListener('click', async _=> {
    if (!spinButton.classList.contains("disabled")) {
        try {
            const response = await fetch(window.location.href + '?spin');
            const results = await response.json();

            console.log('Recieved response object: ', results);
            feedback.innerHTML = 'Rolling!';
            spinSlots(results);
        
        } catch(err) {
            console.error(`Error: ${err}`);
        }
    }
});

function spinSlots(json) {
    spinButton.classList.add("disabled");

    for (i = 0; i < json.result.length; i++) {
        let targetDegrees = -(slotFaces.degreeMap[json.result[i]] + 360*(6+i));
        let time = 3+i;

        reelMap[i].style.setProperty('--startPos', `${positionMap[i]}deg`)
        reelMap[i].style.setProperty('--targetPos', `${targetDegrees}deg`)
        reelMap[i].style.setProperty('--spinTime', `${time}s`)

        reelMap[i].classList.remove("spin-animation");
        void reelMap[i].offsetWidth;
        reelMap[i].classList.add("spin-animation");

        positionMap[i] = slotFaces.degreeMap[json.result[i]];
    }
    
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
    
        if (json.bonus) {
            setTimeout( () => {
                feedback.innerHTML = 'Bonus Roll!'
                spinSlots(json.bonusRoll);
            }, 750);
        } else spinButton.classList.remove("disabled");
    }, 3200 + ((json.result.length-1) * 1000));
}

async function buildTemplate() {
    try {
        const response = await fetch(window.location.href + '?template');
        const json = await response.json();

        slotFaces.wildcardOffset = json.usingWildcard ? 0 : 1;

        let allFaceCount = json.faceCount + 1;
        let facesPerReel = allFaceCount - slotFaces.wildcardOffset;

        for (i = slotFaces.wildcardOffset; i < allFaceCount; i++) {
            if (json.faceMappings[i] !== undefined)
                slotFaces.imageMap[i] = 'resources/' + json.resourcesDirectory + '/' + json.faceMappings[i];
            slotFaces.degreeMap[i] = (360/(facesPerReel)) * i;
        };
        
        let zOffset = Math.round((115/2)/Math.tan(Math.PI/facesPerReel)); 
        stage.setAttribute("style", `-webkit-perspective: ${200*facesPerReel}; width: ${175*json.reelCount}px;`)
        if (json.reelCount > 3) box.setAttribute("style", `width: ${800+(json.reelCount-3) * 175}px`)

        for (i=0; i < json.reelCount; i++) {
            let slotReel = document.createElement('div');
            slotReel.setAttribute("class", "reel");
            
            for (n=slotFaces.wildcardOffset; n < allFaceCount; n++) {
            //Create reel faces, with proper transforms, in the reel div.
                let reelFace = document.createElement('div');
                reelFace.setAttribute("class", "reel-face");
                reelFace.setAttribute("style", `-webkit-transform: rotateX(${slotFaces.degreeMap[n]}deg) translateZ(${zOffset}px);`);
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