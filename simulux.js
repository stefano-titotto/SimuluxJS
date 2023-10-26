
// visualizza immagine con cv.imshow
class CParametri {
    constructor (){
        this.L = 0;
        this.W = 0;
        this.DimTesta = 0;
        this.RaggioInt = 0;
    }

    aggiorna() {
        this.L = document.getElementById("slabLengthInput").value;
        this.W = document.getElementById("slabWidthInput").value;
        this.DimTesta = document.getElementById("headSizeInput").value;
        this.RaggioInt = document.getElementById("raggioIntInput").value;
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

    for (let i = s2x; i< e2x; i++){
        for (let j = s2y; j < e2y; j++){
            mat1[s1x+i][s1y+j] += mat2[i][j];
        }
    }
}

function lastra_reset(lastra){
    for(let i=0; i < lastra.length; i++){
        lastra[i].fill(0);
    }
}

function calcola(){
    params.aggiorna();
    let L = params.L;
    let W = params.W;
    let DimTesta = params.DimTesta;
    let RaggioInt = params.RaggioInt;
    let centro = Math.trunc(DimTesta/2);

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
            testa[i][j] = (((i - centro)**2+(j - centro)**2)>(RaggioInt/2)**2) && (((i - centro)**2+(j - centro)**2) <= (DimTesta/2)**2);
        }
	}


	// start time
	const start = Date.now();
	let cnt = 0;
	for ( let x = 10; x < W-DimTesta-10; x++){
		for (let y =10; y < L-DimTesta-10; y++){
		    somma(lastra, testa, [x, y], DimTesta);
		    cnt++;
		}
        x++;
		for (let y = L-DimTesta-10; y > 10; y--){
		    somma(lastra, testa, x,  y, L, W, DimTesta);
		    cnt++;
		}
	}
	// stop time
	const elapsed = Date.now() - start;

	// visualizza
	console.log('Testa: ', DimTesta, ' cm, Tempo impiegato: '+ elapsed +' ms');

    delete testa;
    visualizza_mappa(lastra);	
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
;}

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

visualizza_mappa();