const head = [10, 15, 20, 25, 32, 40, 50, 65, 80, 100, 150, 200, 250, 300, 350, 400, 450, 600]
const values = {
    "hg_bms": [11.2, 14.9, 20.4, 25.7, 34.3, 40.2, 51.3, 67, 79, 103.3, 154.3, 206.5, 258.8, 304.8, 336.6, 387.4, 438, 590],
    "mg_bms": [12.4, 16.2, 21.6, 27.3, 35.9, 41.9, 53, 68.7, 80.7, 105.1, 155.3, 208.3, 260.4, 309.6, 339.6, 390.4, 438, 590],
    "gms": [11.2, 14.9, 20.4, 25.7, 34.3, 40.2, 51.3, 67, 79, 103.3, 154.3, 206.5, 258.8, 304.8, 336.6, 387.4, 438, 590],
    "cu": [10.8, 13.6, 20.2, 26.2, 32.6, 39.6, 51.6, 64.3, 73.2, 105.1, 155.4, 0, 0, 0, 0, 0, 0, 0],
    "other": [10.8, 13.6, 20.2, 26.2, 32.6, 39.6, 51.6, 64.3, 73.2, 105.1, 155.4, 206.5, 258.8, 304, 336, 387, 438, 590]
}
const FLOW_TEMPERATURE = 16

const submitButton = document.querySelector('#btnSubmit')

submitButton.addEventListener('click', submit)

function submit() {

    const material = document.getElementById('material').value;
    const diameter = document.getElementById('diameter').value;
    let volume = document.getElementById('volume').value;
    // volume = volume / 3600 nakonec, prevod na kg/h
    const glycol = document.getElementById('glycol').value;
    const velocity = document.getElementById("velocityValue");
    const prDrop = document.getElementById("dropValue");
    const eqL = document.getElementById("eqValue");

    const internalDiameter = findInternalPipeDia(material, diameter);

    let velocityResult = calculateVelocity(volume, internalDiameter);

    const relativeDensity = calculateRelativeDensity(glycol);
    const kinematicViscosity = calculateKinematicViscosity(glycol);
    const absoluteViscosity = calculateAbsoluteViscosity(relativeDensity, kinematicViscosity);
    const reynoldsNumber = calculateReynoldsNumber(velocityResult, internalDiameter, relativeDensity, absoluteViscosity);

    let prDropValue = calculatePrDrop(relativeDensity, velocityResult, reynoldsNumber, internalDiameter, material);

    let eqLValue = calculateEqL(relativeDensity, velocityResult, prDropValue);

    velocity.textContent = velocityResult.toFixed(2).toString();
    prDrop.textContent = prDropValue.toFixed(0).toString();
    eqL.textContent = eqLValue.toFixed(1).toString();
}

function findInternalPipeDia(material, diameter) {
    const index = head.indexOf(parseInt(diameter))
    const arr = values[material]
    return arr[index]
}

function calculateReynoldsNumber(velocity, internalDiameter, relativeDensity, absoluteViscosity) {
    return ((velocity * internalDiameter * (1000 * relativeDensity)) / absoluteViscosity) * 1000
}

function calculateRelativeDensity(glycol) {
    return 1 - ((FLOW_TEMPERATURE / 94266) * Math.pow(FLOW_TEMPERATURE, 0.8)) + (glycol / 636) * (1 - (FLOW_TEMPERATURE / 235))
}

function calculateAbsoluteViscosity(relativeDensity, kinematicViscosity) {
    return (1000 * relativeDensity) * kinematicViscosity
}

function calculateKinematicViscosity(glycol) {
    return 309 * Math.pow((1 - Math.pow(Math.E, (-0.111 * (37 + FLOW_TEMPERATURE)))) / (37 + FLOW_TEMPERATURE), 1.42) * Math.pow(Math.E, (1.1 * glycol * (256 - FLOW_TEMPERATURE) * Math.pow(10, -4)))
}

function calculateVelocity(volume, internalDiameter) {
    return (volume / 1000) / (3.14159 * Math.pow((internalDiameter / 2000), 2))
}

function calculateAbsoluteRoughness(material) {
    if (material === "hg_bms") {
        return 0.046;
    }
    if (material === "mg_bms") {
        return 0.046;
    }
    if (material === "gms") {
        return 0.15;
    }
    if (material === "cu") {
        return 0.0015;
    }
    if (material === "other") {
        return 0.02;
    }
}

function calculateRelativeRoughness(internalDiameter, material) {
    const absoluteRoughness = calculateAbsoluteRoughness(material);
    return absoluteRoughness / internalDiameter;
}

function calculateTurbulentFactor(reynoldsNumber, internalDiameter, material) {
    const relativeRoughness = calculateRelativeRoughness(internalDiameter, material);
    return (1 / (Math.pow(2 * Math.log10(3.715 / relativeRoughness), 2))) + (Math.pow(0.938 / Math.log10(reynoldsNumber), 2.393)) * Math.pow(Math.E, -0.44 * Math.pow(reynoldsNumber * relativeRoughness, 0.33));
}

function calculateIntermediateFactor (reynoldsNumber, internalDiameter, material) {
    const turbulentFactor = calculateTurbulentFactor(reynoldsNumber, internalDiameter, material);
    return (((64 * (3500 - reynoldsNumber)) / 2300) + turbulentFactor * (reynoldsNumber - 2300)) / 1200;
}

function calculateLaminarDarcy(relativeDensity, velocity, reynoldsNumber, internalDiameter) {
    return ((5 * relativeDensity * Math.pow(velocity, 2) * (64 / reynoldsNumber)) / internalDiameter) * 100000
}

function calculateIntermediateDarcy(reynoldsNumber, relativeDensity, velocity, internalDiameter, material) {
    const intermediateFactor = calculateIntermediateFactor(reynoldsNumber, internalDiameter, material);
    return ((5 * relativeDensity * Math.pow(velocity, 2) * intermediateFactor))
}

function calculateTurbulentDarcy(reynoldsNumber, relativeDensity, velocity, internalDiameter, material) {
    const turbulentFactor = calculateTurbulentFactor(reynoldsNumber, internalDiameter, material);
    return ((5 * relativeDensity * Math.pow(velocity, 2) * turbulentFactor) / internalDiameter) * 100000
}

function calculatePrDrop(relativeDensity, velocity, reynoldsNumber, internalDiameter, material) {
    if (reynoldsNumber < 2300) {
        return calculateLaminarDarcy(relativeDensity, velocity, reynoldsNumber, internalDiameter);
    } else if (reynoldsNumber < 3500) {
        return calculateIntermediateDarcy(reynoldsNumber, relativeDensity, velocity, internalDiameter, material);
    } else {
        return calculateTurbulentDarcy(reynoldsNumber, relativeDensity, velocity, internalDiameter, material);
    }
}

function calculateEqL(relativeDensity, velocity, prDrop) {
    return (0.5 * relativeDensity * 1000 * Math.pow(velocity, 2)) / prDrop;
}
