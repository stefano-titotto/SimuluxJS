
// visualizza immagine con cv.imshow
class CParametri {
    constructor (){
        this.L = 0;
        this.W = 0;
        this.DimTesta = 0;
        this.DiamInt = 0;
    }

    aggiorna(formElems) {
        this.L = parseInt(formElems.slabLengthInput.value);
        this.W = parseInt(formElems.slabWidthInput.value);
        this.DimTesta = parseInt(formElems.headSizeInput.value);
        this.DiamInt = parseInt(formElems.diamIntInput.value);
    }
}

const params = new CParametri();

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

function calcola(){
    let myform = document.getElementById("formParametri");
    params.aggiorna(myform.elements);
    let L = params.L;
    let W = params.W;
    let DimTesta = params.DimTesta;
    let DiamInt = params.DiamInt;
    let centro = Math.trunc(DimTesta/2);
    let ut = 3;
    let x0 = -ut ;
    let y0 = -DimTesta; // inizia con la testa tutta fuori dalla lastra
    let Cx = W - DimTesta + 2 * ut;

    // tempo di simulazione
    let sg = 6;
    let rpm = 330;
    let dt = 60 / rpm /sg;

    console.log("Intervallo di simulazione = "+(dt*1000).toFixed(1) + " ms")

    let Vn = 1. *100/60; // Velocità y, velocità nastro in cm/s
 
    // implementazione velocità y
    let dy = Vn * dt; //incremento nel dt

    let bpm = 12; // battute complete al minuto

    let f = bpm/60; // frequenza oscillazione trave

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
    visualizza_mappa(lastra);	
    console.log("calcolato!");
}

function visualizza_mappa(lastra){
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
// Retrieve the container element
  const chartContainer = document.getElementById('mappa');

  // Calculate the new width and height based on the aspect ratio
  const containerWidth = chartContainer.offsetWidth;
  const newHeight = Math.round(containerWidth/ params.L * params.W * 1.2);
  console.log("W = " + containerWidth + ", H = " + newHeight);

  // Update the Plotly chart size
  Plotly.relayout('mappa', {
    width: containerWidth,
    height: newHeight,
  });
};

calcola();