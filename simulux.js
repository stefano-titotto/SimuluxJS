
/*

*/

// valori di default
const parametriDefault = {
    "L": 320,
    "W": 160,
    "DimTesta": 56,
    "Utensile": 15,
    "Uscita": 3,
    "SG": 6,
    "rpmTesta": 330,
    "bpmTrave": 12.5,
    "velNastro": 1.0,
    "Corsa_Y" : 0,
}

const parametriStep = {
    "L": 1,
    "W": 1,
    "DimTesta": 1,
    "Utensile": 1,
    "Uscita": 1,
    "SG": 2,
    "rpmTesta": 1,
    "bpmTrave": .1,
    "velNastro": .05,
    "Corsa_Y": 1,
}

const modiDefault = {
    "oscTrave": "fissa", // otto, ellisse
}

class CParametri {
    constructor (paramDef, modiDef){
        this.params = {};
        for (let key in paramDef){
            this.params[key] = paramDef[key];
        }
        this.modes = {};
        for (let key in modiDef){
            this.modes[key] = modiDef[key];
        }
    }

    aggiorna(formElems) {
        /*
        Leggi i parametri numerici e aggiorna la lista this.params
        */
        for (let k=0; k<formElems.length; k++){
            if (formElems[k].id === ''){continue;} // salta i radio buttons che hanno name e non id
            let val = formElems[k].value;
            val.replace(',','.')
            // inserire controllo numero
            if (isNaN(val)){
                alert("Errore input in "+formElems[k].id);
            }
            this.params[formElems[k].id] = val.indexOf('.') === -1 ? parseInt(val) : parseFloat(val);
        }
        this.modes.oscTrave = this.aggiornaOscTrave();
    }
    aggiornaOscTrave(){
        // leggi radio button oscillazione trave
        // Get all radio buttons with the name "value"
        const radioButtons = document.querySelectorAll('input[name="oscTrave"]');

        let selectedValue = null;
        // Iterate through the radio buttons
        radioButtons.forEach(radioButton => {
            if (radioButton.checked) {
                selectedValue = radioButton.value;
            }
        });
        return selectedValue;
    }
    impostaRadioB(val){
        const valueRadio = document.querySelector('input[value="'+val+'"]');

        // Set the "checked" property to true
        valueRadio.checked = true;
    }

    leggiUrl(){
        /*
        Aggiorna i parametri di simulazione in base alla stringa di sricerca del URL
        */
        let ricerca = window.location.search.substring(1);
        console.log(ricerca);
        for(let elem of ricerca.split('&')){
            let item = elem.split('=');
            let key = item[0];
            let val = item[1];
            console.log(key + ": "+ val);
            // memorizza i valori con il tipo corretto: string, int o float
            if (isNaN(val)){
                this.impostaRadioB(val);
                this.modes[key] = val;
            }
            else {
                this.params[key] = (val.indexOf('.') === -1 ? parseInt(val) : parseFloat(val));
            }
        }
    }

    scriviUrlParams(){
        let stringa = "?";
        for(let key in this.params){
            stringa += key + "=" + this.params[key] + "&";
        }
        for(let key in this.modes){
            stringa += key + "=" + this.modes[key] + "&";
        }
        return stringa.slice(0,-1);
    }
}

function somma( mat1, mat2, x, y, L, W, DimTesta ){

    let s1y = Math.max(0, y);
    let s1x = Math.max (0, x);
    let e1y = Math.min(L, y+DimTesta);
    let e1x = Math.min(W, x+DimTesta);

    let s2y = Math.max(0, s1y - y);
    let s2x = Math.max(0, s1x - x);
    let e2y = Math.min(DimTesta, e1y-y);
    let e2x = Math.min(DimTesta, e1x-x);

    for (let i = 0; i< e2x-s2x; i++){
        for (let j = 0; j < e2y-s2y; j++){
            mat1[s1x+i][s1y+j] += mat2[s2x+i][s2y+j];
        }
    }
}

function lastra_reset(lastra){
    for(let i=0; i < lastra.length; i++){
        lastra[i].fill(0);
    }
}

function calcola(params, modes){
    let L = params.L;
    let W = params.W;
    let DimTesta = params.DimTesta;
    let DiamInt = DimTesta - 2 * params.Utensile;
    let centro = Math.trunc(DimTesta/2);
    let ut = params.Uscita;
    let x0 = -ut ;
    let y0 = -DimTesta; // inizia con la testa tutta fuori dalla lastra
    let Cx = W - DimTesta + 2 * ut;

    // tempo di simulazione
    let dt = 60 / params.rpmTesta /params.SG;

    console.log("Intervallo di simulazione = "+(dt*1000).toFixed(1) + " ms")

    let Vn = params.velNastro *100/60; // Velocità y, velocità nastro m/min -> cm/s
 
    // implementazione velocità y
    let dy = Vn * dt; //incremento nel dt

    let f = params.bpmTrave/60; // frequenza oscillazione trave

    // Crea nuova lastra
    const lastra = new Array(W);

    for (let i = 0; i<W; i++){
	    lastra[i] = new Uint16Array(L);
	    lastra[i].fill(0);
	}
	// lastra_reset(lastra);
    console.log(W + ' x ' + L);

    // crea modello testa
	const testa = new Array(DimTesta);
	for (let i =0; i< DimTesta; i++){
	    testa[i] = new Uint16Array(DimTesta);
	    for(let j=0; j < DimTesta; j++){
            testa[i][j] = (((i - centro)**2+(j - centro)**2)>(DiamInt/2)**2) && (((i - centro)**2+(j - centro)**2) <= (DimTesta/2)**2);
        }
	}

    // implementazione velocità x a rampa sinusoidale
    let X = [];

    let n = Math.round(1/f/dt); // lunghezza del vettore di posizione x
    for (let k = 0; k < n; k++) {
        X.push( x0 + Math.round(Cx/2 * (1 - Math.cos(2*Math.PI*f*k*dt))));
    }
    console.log(X.length);

    /*  implementazione Tango
        costruisco un array Y[] che contiene il movimento longitudinale sinusoidale
        da aggiungere a dy il movimento del nastro
    */
    let Y = new Float32Array(n);
    switch (modes.oscTrave){
        case "fissa":
            for (let k =0; k<n; k++){
                Y[k] = 0.0;
            }
            break;
        case "otto":
            for (let k = 0; k < n; k++){
                Y[k] = params.Corsa_Y /2 * Math.sin(4*Math.PI*f*k*dt);
            };
            break;
        case "ellisse":
            for (let k = 0; k< n; k++){
                Y[k] = params.Corsa_Y / 2 * Math.sin(2*Math.PI*f*k*dt);
            }
            break;
        default:
            alert("Modalità di oscillazione sconosciuta: " + modes.oscTrave)
    }


    // simulazione
	// start time
	const start = Date.now();
	let cnt = 0;
    let x = X[0];
    let y = y0;

    
    for (let k=0; y < L; k = (k+1) % X.length){ //y < L+DimTesta
        //console.log("k = "+k+", x = "+ x + ", y = "+y)
        somma(lastra, testa, x, Math.round(y+Y[k]), L, W, DimTesta );
        x = X[k];
        y += dy;
        cnt++;
    }
	const elapsed = Date.now() - start;

	// visualizza
	console.log('Tempo impiegato: '+ elapsed +' ms');
    console.log('N. cicli di simulazione: '+ cnt +' cicli');
    console.log('Performance : '+ Math.round(cnt*1000/elapsed) + ' cicli/s');

    delete testa;
    visualizza_mappa(lastra,params.L, params.W);	
    console.log("calcolato!");
}

function visualizza_mappa(lastra, L, W){
    MAPPA = document.getElementById("mappa");

    var dati = [
        {
            z: lastra,
            type: 'heatmap',
            colorscale: 'Hot',
        }
    ];

    Plotly.newPlot(MAPPA, dati);
    proporziona_finestra();
    console.log("visualizzato!");
}

window.addEventListener('resize', proporziona_finestra);

function proporziona_finestra(){
    let L = Parametri.params.L;
    let W = Parametri.params.W;
// Retrieve the container element
  const chartContainer = document.getElementById('mappa');

  // Calculate the new width and height based on the aspect ratio
  const containerWidth = chartContainer.offsetWidth;
  const newHeight = Math.round(containerWidth/ L * W * 1.2);
  console.log("W = " + containerWidth + ", H = " + newHeight);

  // Update the Plotly chart size
  Plotly.relayout('mappa', {
    width: containerWidth,
    height: newHeight,
  });
};

function costruisciForm(params){
    let TableBody = document.getElementById("tableBody");
    for (let key in params){
        let riga = TableBody.insertRow();
        let cella = riga.insertCell();
        cella.innerHTML = key;
        cella = riga.insertCell();
        cella.innerHTML = '<input type=\"number\" id=\"'+key+'\" value=\"'+params[key]+'\" step=\"'+parametriStep[key]+'\"></input>';
    }
}

document.getElementById("formParametri").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission
    Parametri.aggiorna(this.elements);
    let searchString = Parametri.scriviUrlParams();
    window.location.search = searchString;
});
/* 
area che viene eseguita all'apertura della pagina

Quando apro l'url generale, 
se non c'è la stringa di ricerca -> carica i parametri di default e richiama l'url
altrimenti -> leggi i parametri e simula

Poi ad ogni aggiornamento del form aggiorna Url search e simulazione.
*/
var Parametri = new CParametri({},{});

if (window.location.search === ''){
    Parametri = new CParametri(parametriDefault, modiDefault);
    let searchString = Parametri.scriviUrlParams();
    window.location.search = searchString;
}
else{
    Parametri.leggiUrl();
    costruisciForm(Parametri.params);
    calcola(Parametri.params, Parametri.modes);
}