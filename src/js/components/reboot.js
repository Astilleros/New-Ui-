let app
let counterValue = 0

const V = {
    title:  document.getElementById('PRBO_title'),
    counter: document.getElementById('PRBO_counter'),
    cancel:  document.getElementById('PRBO_cancelreboot'),
    reboot:  document.getElementById('PRBO_fastreboot'),
    spinner:  document.getElementById('PRBO_spinner'),
}

const initForm = [V.counter, V.reboot, V.cancel]

function bindViewControls() {
    V.reboot.addEventListener('click', (e) => {
        counterValue = -1
        reboot()
    });
    V.cancel.addEventListener('click', (e) => {
        counterValue = -1
        hideElements(initForm)
        V.title.innerHTML = 'Stopped!'
    });
}


const initTimedReboot = async () => {
    if(counterValue === 0) return reboot()
    if(counterValue < 0) return
    V.title.innerHTML = 'Are u sure?'
    V.counter.innerHTML = counterValue
    await new Promise(resolve => setTimeout(resolve, 1000));
    counterValue--;
    return await initTimedReboot()
}

const reboot = async () => {
    console.log('reboot');
    V.title.innerHTML = 'Wait until reboot...'
    hideElements(initForm)
    showElements([V.spinner])
    const rebooted = await app.get('/reboot')
    if(!rebooted.ok) {
        alert('Error calling device reboot.')
        return false
    }
    await timedStatusReboot()
    hideElements([V.spinner])

    V.title.innerHTML = 'Reloading app...'
    await app.reboot()
    V.title.innerHTML = 'Device rebooted!'
}

const timedStatusReboot = async () => {
    console.log('timedStatusReboot');
    let notYet = true
    do {
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
            let request = await fetch(app.V.basepath + '/statusflow.html', { signal: AbortSignal.timeout(1000) })
            if (request.ok) {
                notYet = false
                return true
            }
        } catch (error) {
            console.log('Not rebooted yet.')
        }
    } while (notYet);
    return true
}



function init(_app){
    hideElements([V.spinner])
    app = _app
    bindViewControls()
    return true
}

async function focus() {
    showElements(initForm)
    counterValue = 5
    initTimedReboot()
    return true;
}

export default {
    init,
    load: undefined,
    focus
}
