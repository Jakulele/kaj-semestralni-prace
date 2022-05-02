const submitButton = document.querySelector('#btnSubmit')

submitButton.addEventListener('click', submit)

function submit() {

    const material = document.getElementById('material').value;
    const diameter = document.getElementById('diameter').value;
    const volume = document.getElementById('volume').value;
    // const glycol = document.getElementById('glycol').value;

    findInternalPipeDia(material)

    const velocity = document.getElementById("velocityValue");

    const velocityResult = diameter * volume;

    velocity.textContent = velocityResult.toString();
}

function findInternalPipeDia(material) {

}