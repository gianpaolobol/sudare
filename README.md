# Sudare

> **Copyright © 2026 Gian Paolo Franceschini — All rights reserved for original proprietary contributions.** See [LICENSE.md](LICENSE.md). Third-party licenses and GitHub's permitted platform uses remain applicable.


Guida ai locali da ballo nel Comune di Bologna, con mappa OpenStreetMap.
L'interfaccia riprende da ByteBudget la colonna fissa dei filtri, la lista
delle schede, il dettaglio e le tab Scopri e Salvati.

## Avvio

Richiede Node.js 22+ per i test e un server HTTP statico per l'app.

```sh
npm test
python3 -m http.server 8000
```

Apri http://localhost:8000. Per la geolocalizzazione su un dispositivo
usa HTTPS. La posizione è richiesta su comando e usata sul dispositivo
per calcolare le distanze in linea d'aria. Senza posizione, la distanza
è riferita a Piazza Maggiore. I preferiti sono salvati nel browser.

## Catalogo

Il catalogo iniziale è in `catalog.js`. Ogni locale ha una fonte per le
attività di ballo e può appartenere a più categorie. Le coordinate OSM
corrispondono al locale o al civico, quando la mappa identifica il civico.
Per le rassegne stagionali la scheda rimanda alla fonte per il programma.
Le segnalazioni si raccolgono tramite GitHub Issues.

Mappa e coordinate © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright),
dati cartografici sotto ODbL. La mappa usa [Leaflet](https://leafletjs.com/).
Lista, filtri e preferiti restano disponibili se le risorse cartografiche
esterne sono temporaneamente irraggiungibili.

## iPhone

Esegui `npm ci` e `npm run build:ios`, quindi apri
`ios/App/App.xcodeproj` con Xcode. Il workflow **iOS build** compila
il progetto per il simulatore e, all’avvio manuale con l’opzione
`upload`, può firmare e caricare la build su App Store Connect.
Il caricamento richiede un certificato Apple Distribution con chiave
privata, un profilo App Store per `it.gianpaolofranceschini.sudare`
e una chiave App Store Connect. Configurali come segreti Actions con
i nomi dichiarati nel workflow. I test e la pubblicazione si gestiscono
da App Store Connect dopo l’elaborazione della build.
