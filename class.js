export function Calculation (material, diameter, diaUnits, volume, volumeUnits, glycol) {
    this.material = material;
    this.diaUnits = diaUnits;
    this.diameter = this.convertDiameterUnits(diameter);
    this.volumeUnits = volumeUnits;
    this.volume = this.convertVolumeUnits(volume);
    this.glycol = glycol;
    this.flow_temperature = 16;
    this.internalDiameter = this.calculateInternalPipeDia(this.material, this.diameter);
    this.velocity = this.calculateVelocity(this.volume, this.internalDiameter);
    this.relativeDensity = this.calculateRelativeDensity(this.glycol);
    this.kinematicViscosity = this.calculateKinematicViscosity(this.glycol);
    this.absoluteViscosity = this.calculateAbsoluteViscosity(this.relativeDensity, this.kinematicViscosity);
    this.reynoldsNumber = this.calculateReynoldsNumber(this.velocity, this.internalDiameter, this.relativeDensity, this.absoluteViscosity);
    this.approxSize = this.approximateSize(this.volume);
    this.prDrop = this.calculatePrDrop(this.relativeDensity, this.velocity, this.reynoldsNumber, this.internalDiameter, this.material);
    this.eqL = this.calculateEqL(this.relativeDensity, this.velocity, this.prDrop);

}

Calculation.prototype.calculateInternalPipeDia = function (material, diameter) {
    let index = 0;
    for (let i = 0; i < head.length; i++) {
        if (head[i] <= diameter) {
            index = i;
        }
    }
    const arr = values[material]
    return arr[index]
}

Calculation.prototype.calculateVelocity = function (volume, internalDiameter) {
    return (volume / 1000) / (3.14159 * Math.pow((internalDiameter / 2000), 2))
}

Calculation.prototype.calculateRelativeDensity = function (glycol) {
    return 1 - ((this.flow_temperature / 94266) * Math.pow(this.flow_temperature, 0.8)) + (glycol / 636) * (1 - (this.flow_temperature / 235))
}

Calculation.prototype.calculateKinematicViscosity = function (glycol) {
    return 309 * Math.pow((1 - Math.pow(Math.E, (-0.111 * (37 + this.flow_temperature)))) / (37 + this.flow_temperature), 1.42) * Math.pow(Math.E, (1.1 * glycol * (256 - this.flow_temperature) * Math.pow(10, -4)))
}

Calculation.prototype.calculateAbsoluteViscosity = function (relativeDensity, kinematicViscosity) {
    return (1000 * relativeDensity) * kinematicViscosity
}

Calculation.prototype.calculateReynoldsNumber = function (velocity, internalDiameter, relativeDensity, absoluteViscosity) {
    return ((velocity * internalDiameter * (1000 * relativeDensity)) / absoluteViscosity) * 1000
}

Calculation.prototype.approximateSize = function (volume) {
    let n = 0;
    let results = [];
    for (let size of approx_size) {
        n = (volume / 1000) / (3.14159 * Math.pow(size / 2000, 2))
        if (size === 15) {
            if (n > 0.65 && n < 1.5) {
                results.push(size);
            }
            continue
        }
        if (size <= 50) {
            if (n > 0.75 && n < 1.5) {
                results.push(size);
            }
            continue
        }
        if (size <= 65) {
            if (n > 0.85 && n < 3) {
                results.push(size);
            }
            continue
        }
        if (size > 65) {
            if (n > 1.25 && n < 3) {
                results.push(size);
            }
        }
    }
    if (results.length === 0) {
        results.push("Undefined")
    }
    return results;
}

Calculation.prototype.calculatePrDrop = function (relativeDensity, velocity, reynoldsNumber, internalDiameter, material) {
    if (reynoldsNumber < 2300) {
        return this.calculateLaminarDarcy(relativeDensity, velocity, reynoldsNumber, internalDiameter);
    } else if (reynoldsNumber < 3500) {
        return this.calculateIntermediateDarcy(reynoldsNumber, relativeDensity, velocity, internalDiameter, material);
    } else {
        return this.calculateTurbulentDarcy(reynoldsNumber, relativeDensity, velocity, internalDiameter, material);
    }
}

Calculation.prototype.calculateEqL = function (relativeDensity, velocity, prDrop) {
    return (0.5 * relativeDensity * 1000 * Math.pow(velocity, 2)) / prDrop;
}

Calculation.prototype.calculateLaminarDarcy = function (relativeDensity, velocity, reynoldsNumber, internalDiameter) {
    return ((5 * relativeDensity * Math.pow(velocity, 2) * (64 / reynoldsNumber)) / internalDiameter) * 100000
}

Calculation.prototype.calculateIntermediateDarcy = function (reynoldsNumber, relativeDensity, velocity, internalDiameter, material) {
    const intermediateFactor = this.calculateIntermediateFactor(reynoldsNumber, internalDiameter, material);
    return ((5 * relativeDensity * Math.pow(velocity, 2) * intermediateFactor))
}

Calculation.prototype.calculateTurbulentDarcy = function (reynoldsNumber, relativeDensity, velocity, internalDiameter, material) {
    const turbulentFactor = this.calculateTurbulentFactor(reynoldsNumber, internalDiameter, material);
    return ((5 * relativeDensity * Math.pow(velocity, 2) * turbulentFactor) / internalDiameter) * 100000
}

Calculation.prototype.calculateIntermediateFactor = function (reynoldsNumber, internalDiameter, material) {
    const turbulentFactor = this.calculateTurbulentFactor(reynoldsNumber, internalDiameter, material);
    return (((64 * (3500 - reynoldsNumber)) / 2300) + turbulentFactor * (reynoldsNumber - 2300)) / 1200;
}

Calculation.prototype.calculateTurbulentFactor = function (reynoldsNumber, internalDiameter, material) {
    const relativeRoughness = this.calculateRelativeRoughness(internalDiameter, material);
    return (1 / (Math.pow(2 * Math.log10(3.715 / relativeRoughness), 2))) + (Math.pow(0.938 / Math.log10(reynoldsNumber), 2.393)) * Math.pow(Math.E, -0.44 * Math.pow(reynoldsNumber * relativeRoughness, 0.33));
}

Calculation.prototype.calculateRelativeRoughness = function (internalDiameter, material) {
    const absoluteRoughness = this.calculateAbsoluteRoughness(material);
    return absoluteRoughness / internalDiameter;
}

Calculation.prototype.calculateAbsoluteRoughness = function (material) {
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

Calculation.prototype.convertDiameterUnits = function (diameter) {
    if (this.diaUnits === "cm") {
        return diameter * 10;
    }
    if (this.diaUnits === "dm") {
        return diameter * 100;
    }
    return diameter
}

Calculation.prototype.convertVolumeUnits = function (volume) {
    if (this.volumeUnits === "kgh") {
        return volume / 3600;
    }
    return volume
}

// calculations' support values
const head = [10, 15, 20, 25, 32, 40, 50, 65, 80, 100, 150, 200, 250, 300, 350, 400, 450, 600];
const values = {
    "hg_bms": [11.2, 14.9, 20.4, 25.7, 34.3, 40.2, 51.3, 67, 79, 103.3, 154.3, 206.5, 258.8, 304.8, 336.6, 387.4, 438, 590],
    "mg_bms": [12.4, 16.2, 21.6, 27.3, 35.9, 41.9, 53, 68.7, 80.7, 105.1, 155.3, 208.3, 260.4, 309.6, 339.6, 390.4, 438, 590],
    "gms": [11.2, 14.9, 20.4, 25.7, 34.3, 40.2, 51.3, 67, 79, 103.3, 154.3, 206.5, 258.8, 304.8, 336.6, 387.4, 438, 590],
    "cu": [10.8, 13.6, 20.2, 26.2, 32.6, 39.6, 51.6, 64.3, 73.2, 105.1, 155.4, 0, 0, 0, 0, 0, 0, 0],
    "other": [10.8, 13.6, 20.2, 26.2, 32.6, 39.6, 51.6, 64.3, 73.2, 105.1, 155.4, 206.5, 258.8, 304, 336, 387, 438, 590]
};
const approx_size = [10, 15, 20, 25, 32, 40, 50, 65, 80, 100, 125, 150, 200, 250, 300, 350, 400, 450, 600];