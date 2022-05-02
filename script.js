function computeSubmit() {

    const diameter = document.getElementById('diameter').value;
    const volume = document.getElementById('volume').value;
    // const glycol = document.getElementById('glycol').value;

    const velocity = document.getElementById("velocityValue");

    const velocityResult = diameter * volume;

    velocity.textContent = velocityResult.toString();
}