import {Calculation} from "./class.js";

const submitButton = document.querySelector('#btnSubmit')

submitButton.addEventListener('click', submit)

const form = document.querySelector("form")

form.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        submitButton.click();
    }
});

function submit() {
    // user input values
    const material = document.getElementById('material').value;
    let diameter = document.getElementById('diameter').value;
    diameter = convertDiameterUnits(diameter);
    let volume = document.getElementById('volume').value;
    volume = convertVolumeUnits(volume);
    const glycol = document.getElementById('glycol').value;

    // selecting result fields
    const velocityEl = document.getElementById("velocityValue");
    const prDropEl = document.getElementById("dropValue");
    const eqLEl = document.getElementById("eqValue");
    const approxSizeEl = document.getElementById("approxSize");
    const svgEl = document.querySelector('svg');

    // check if input is valid
    const valid = checkInput(diameter, volume, glycol)
    if (!valid) {
        velocityEl.textContent = "0";
        prDropEl.textContent = "0";
        eqLEl.textContent = "0";
        approxSizeEl.textContent = "0";
        svgEl.innerHTML = "";
        return
    }

    let calculation = new Calculation(material, diameter, volume, glycol);

    // update values to result fields
    velocityEl.textContent = calculation.velocity.toFixed(2).toString();
    prDropEl.textContent = calculation.prDrop.toFixed(0).toString();
    eqLEl.textContent = calculation.eqL.toFixed(1).toString();
    approxSizeEl.textContent = calculation.approxSize.toString();
    const approxSizeMid = (calculation.approxSize.length / 2) | 0;
    drawCircle(calculation.approxSize[approxSizeMid], svgEl);
}

function convertDiameterUnits(diameter) {
    const diameterUnits = document.getElementById('diaUnits');
    if (diameterUnits.value === "cm") {
        return diameter * 10;
    }
    if (diameterUnits.value === "dm") {
        return diameter * 100;
    }
    return diameter
}

function convertVolumeUnits(volume) {
    const volumeUnits = document.getElementById('volumeUnits');
    if (volumeUnits.value === "kgh") {
        return volume / 3600;
    }
    return volume
}

function checkInput(diameter, volume, glycol) {
    let valid = true;
    const diameterError = document.getElementById("diameterError");
    const volumeError = document.getElementById("volumeError");
    const percentageError = document.getElementById("percentageError");
    diameterError.textContent = "";
    volumeError.textContent = "";
    percentageError.textContent = "";
    if (!(diameter > 0)) {
        valid = false;
        diameterError.textContent = "Value must be greater than 0";
    }
    if (!(volume > 0)) {
        valid = false;
        volumeError.textContent = "Value must be greater than 0";
    }
    if (!(glycol >= 0 && glycol <= 100)) {
        valid = false;
        percentageError.textContent = "Invalid value";
    }
    return valid;
}

function drawCircle(r, svg) {
    svg.innerHTML = "";
    if (isNaN(r)) {
        return
    }
    if (r > 50) {
        r = 50
    }
    const outer = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    outer.setAttributeNS(null, "cx", "50");
    outer.setAttributeNS(null, "cy", "50");
    outer.setAttributeNS(null, "r", r);
    outer.setAttributeNS(null, "fill", "grey");
    svg.appendChild(outer);
    const rs = r - r / 50;
    const inner = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    inner.setAttributeNS(null, "cx", "50");
    inner.setAttributeNS(null, "cy", "50");
    inner.setAttributeNS(null, "r", rs.toString());
    inner.setAttributeNS(null, "fill", "darkgrey");
    svg.appendChild(inner);
}

