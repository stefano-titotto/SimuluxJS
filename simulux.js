
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
}

class CParametri {
    constructor (def){
        this.params = {};
        for (let key in def){
            this.params[key] = def[key];
        }
    }

    aggiorna(formElems) {
        for (let k=0; k<formElems.length; k++){
            if (formElems[k].id === ''){continue;}
            let val = formElems[k].value;
            val.replace(',','.')
            // inserire controllo numero
            if (isNaN(val)){
                alert("Errore input in "+formElems[k].id);
            }
            this.params[formElems[k].id] = val.indexOf('.') === -1 ? parseInt(val) : parseFloat(val);
        }

    }
    leggiUrl(){
        let ricerca = window.location.search.substring(1);
        console.log(ricerca);
        for(let elem of ricerca.split('&')){
            let item = elem.split('=');
            let key = item[0];
            let val = item[1];
            console.log(key + ": "+ val);
            // memorizza i valori con il tipo corretto: string, int o float
            this.params[key] = isNaN(val) ? val : (val.indexOf('.') === -1 ? parseInt(val) : parseFloat(val));

        }
        return this.params
    }
    scriviUrlParams(){
        let stringa = "?";
        for(let key in this.params){
            stringa += key + "=" + this.params[key] + "&";
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

function calcola(params){
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

    // simulazione
	// start time
	const start = Date.now();
	let cnt = 0;
    let x = X[0];
    let y = y0;

    
    for (let k=0; y < L; k = (k+1) % X.length){ //y < L+DimTesta
        //console.log("k = "+k+", x = "+ x + ", y = "+y)
        somma(lastra, testa, x, Math.round(y), L, W, DimTesta );
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
    proporziona_finestra(L,W);
    console.log("visualizzato!");
}

window.addEventListener('resize', proporziona_finestra);

function proporziona_finestra(L, W){
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
var Parametri = new CParametri({});

if (window.location.search === ''){
    Parametri = new CParametri(parametriDefault);
    let searchString = Parametri.scriviUrlParams();
    window.location.search = searchString;
}
else{
    Parametri.leggiUrl();
    costruisciForm(Parametri.params);
    calcola(Parametri.params);
}