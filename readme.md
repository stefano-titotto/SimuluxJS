# test calcoli su array confrontando Numpy/python e Javascript Typed Arrays


Javascript sul vecchio mac di casa è il 17% + veloce di python 3.9.7:

- JS 820 ms
- PY 990 ms

# provare a visualizzare grafici tipo pyplot in JS

https://docs.opencv.org/4.x/d0/d84/tutorial_js_usage.html#:~:text=You%20can%20get%20a%20copy,.0%2Fopencv.js.

https://plotly.com/javascript/heatmaps/#basic-heatmap

realizzato con Plotly!

## rappresentare il grafico in modo che mantenga le propozioni
Ok!


## Inserire un widget per DimTesta
- wdg : test con slider di plotly, ma funziona con un solo slider

Testare form con parametri e bottone calcola.

Rifattorizzare il codice.

oggetto "parametri" che viene aggiornato e passato a calcola alla pressione del bottone.

# Implementare simulux

- (NO) Utilizzare typescript per prevenire bugs. (installazione su mac difficoltosa)
- impostare struttura classi

- default dimensioni lastra
- maschera immissione parametri (wireframe)

## Simulux
### 26/10/2023 
- Sistemato problemi su somma
- testato semplice movimento lineare

- implementare vel_x, vel_y
- calcolare vettore X sinusoidale date le battute al minuto



### 29-10-2023

- creare oggetto con tutti i parametrit
- creazione URL+parametri
- lettura parametri da URL

Quando apro l'url generale, 
se c'è la stringa di ricerca -> leggi i parametri e simula
altrimenti carica i parametri di default e richiama l'url

Poi ad ogni aggiornamento del form richiama l'url aggiornato

### future

implementare tango

strumenti di analisi (media, dev_std, box_plot)
