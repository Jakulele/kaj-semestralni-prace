import {Calculation} from "./class.js";

// pressing Enter while in form simulates Submit button click
const form = document.querySelector("form")

form.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        submitButton.click();
    }
});

const submitButton = document.querySelector('#btnSubmit')

submitButton.addEventListener('click', submit)

/**
 * Calculates using the user input values
 */
function submit() {
    // user input values
    const material = document.getElementById('material').value;
    const diameter = document.getElementById('diameter').value;
    const diaUnits = document.getElementById('diaUnits').value;
    const volume = document.getElementById('volume').value;
    const volumeUnits = document.getElementById('volumeUnits').value;
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

    let calculation = new Calculation(material, diameter, diaUnits, volume, volumeUnits, glycol);

    // update values to result fields
    velocityEl.textContent = calculation.velocity.toFixed(2).toString();
    prDropEl.textContent = calculation.prDrop.toFixed(0).toString();
    eqLEl.textContent = calculation.eqL.toFixed(1).toString();
    approxSizeEl.textContent = calculation.approxSize.toString();
    const approxSizeMid = (calculation.approxSize.length / 2) | 0;
    drawCircle(calculation.approxSize[approxSizeMid], svgEl);

    saveCalculation(calculation);
    const values = localStorageToArray();
    appendToHistory([values[0]]);
}

const btnClearHistory = document.querySelector("#btnClearHistory")

btnClearHistory.addEventListener("click", function() {
    localStorage.clear();
    const values = localStorageToArray();
    appendToHistory(values);
});

function saveCalculation(c) {
    const keys = Object.keys(localStorage);
    if (keys.length === 10) {
        let lowest = parseInt(keys[0])
        for (let i of keys) {
            if (parseInt(i) < lowest) {
                lowest = parseInt(i);
            }
        }
        localStorage.removeItem(lowest.toString());
    }
    let highest = -1;
    if (keys.length > 0) {
        highest = parseInt(keys[0])
        for (let i of keys) {
            if (parseInt(i) > highest) {
                highest = parseInt(i);
            }
        }
    }
    const calculation = JSON.stringify([c.material, c.diameter, c.diaUnits,
        c.volume, c.volumeUnits, c.glycol, c.velocity.toFixed(2), c.prDrop | 0, c.eqL.toFixed(1), c.approxSize])
    localStorage.setItem((highest + 1).toString(), calculation);
}

window.onload = function () {
    const values = localStorageToArray();
    appendToHistory(values);
}

function localStorageToArray() {
    let values = [];
    const keys = Object.keys(localStorage);
    let highest = -1;
    if (keys.length > 0) {
        highest = parseInt(keys[0])
        for (let i of keys) {
            if (parseInt(i) > highest) {
                highest = parseInt(i);
            }
        }
    }
    if (highest === -1) return [];
    highest++;
    while (highest--) {
        let item = localStorage.getItem(highest.toString())
        if (!item) break;
        values.push(JSON.parse(item));
    }

    return values;
}

function reloadHistory(material, diameter, diaUnits, volume, volumeUnits, glycol) {
    const glycolEl = document.getElementById('glycol');
    document.getElementById('material').value = material;
    document.getElementById('diameter').value = diameter;
    document.getElementById('diaUnits').value = diaUnits;
    document.getElementById('volume').value = volume;
    document.getElementById('volumeUnits').value = volumeUnits;
    glycolEl.value = glycol;

    glycolEl.scrollIntoView(false);
}

function appendToHistory (values) {
    const history = document.querySelector('.history');
    if (values.length === 0) {
        while (history.firstChild) {
            history.removeChild(history.lastChild);
        }
        return
    }
    if (history.children.length === 10) {
        history.removeChild(history.lastChild);
    }
    for (let value of values) {
        const span = document.createElement("span");
        span.className = "history_row";
        span.style.fontWeight = "normal";
        let zeroStripped = value[0].toString().toUpperCase();
        zeroStripped = zeroStripped.replace("_", " ");
        if (zeroStripped === "CU") {
            zeroStripped = "Cu";
        }
        if (zeroStripped === "OTHER") {
            zeroStripped = "Other";
        }
        let fourStripped = "";
        if (value[4] === "ls") {
            fourStripped = "l/s";
        }
        if (value[4] === "kgh") {
            fourStripped = "kg/h";
            value[3] *= 3600;
        }
        if (value[2] === "cm") {
            value[1] /= 10;
        }
        if (value[2] === "dm") {
            value[1] /= 100;
        }
        const text = document.createTextNode(zeroStripped  + ", " + value[1] + "\xa0" + value[2] + ", " +
            value[3] + "\xa0" + fourStripped + ", " + value[5] + "\xa0% = " + value[6] + "\xa0m/s, " + value[7] + "\xa0Pa/m, " +
        value[8] + " m, size: " + value[9]);
        span.appendChild(text);
        span.onclick = function() {reloadHistory(value[0], value[1], value[2], value[3], value[4], value[5])};
        if (history.children.length === 0) {
            history.appendChild(span);
        } else {
            history.insertBefore(span, history.firstChild);
        }
    }
}

/**
 * Checks if user input values are valid for calculations
 * @param diameter must be higher than 0
 * @param volume must be higher than 0
 * @param glycol must be a percentage value (0-100)
 * @returns {boolean} true if valid, false if invalid
 */
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

// clear all input fields on btnClear click
const btnClear = document.querySelector("#btnClear")

btnClear.addEventListener("click", function() {
    const toClear = document.querySelectorAll("input[type='number'], select")
    for (const elem of toClear) {
        elem.value = "0";
        elem.selectedIndex = "0";
    }
});