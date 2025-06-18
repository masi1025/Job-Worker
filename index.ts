import { Camunda8 } from "@camunda8/sdk";
import axios from 'axios';
const camunda = new Camunda8({
  CAMUNDA_OAUTH_URL: "https://login.cloud.camunda.io/oauth/token",
  CAMUNDA_CONSOLE_CLIENT_ID: "HAoRlBLf-vGfb82MdY0lA5-fuLaoe2bL",
  CAMUNDA_CONSOLE_CLIENT_SECRET: "u.wKMQE9mhk93gYWs_dObszK_rfWu6LRUj-w~QgdFOHyX92xkPd8wqhDRLp0tfYY",
  ZEEBE_ADDRESS: "487e2664-45fe-4a21-9e53-860eddc37e5e.bru-2.zeebe.camunda.io:443",
  ZEEBE_CLIENT_ID: "HAoRlBLf-vGfb82MdY0lA5-fuLaoe2bL",
  ZEEBE_CLIENT_SECRET: "u.wKMQE9mhk93gYWs_dObszK_rfWu6LRUj-w~QgdFOHyX92xkPd8wqhDRLp0tfYY",
  CAMUNDA_SECURE_CONNECTION: true
});
const zeebe = camunda.getZeebeGrpcApiClient({
});
 zeebe.createWorker({
  taskType: 'RisikoBewerten', // Task-Type wie im BPMN-Modell
  taskHandler: async (job) => {
    console.log('Worker "RisikoBewerten" gestartet');
    const axios = require('axios');


const id = job.variables.id;

const response = await axios.get(`http://localhost:3000/Kunden/${id}`);
const risikoDaten = response.data;
     
     
   const insolvenz = Boolean(risikoDaten.insolvenz);
   const schufaScore = Number(risikoDaten.schufaScore);
   const name=  String(risikoDaten.name);
   const einkommen= Number(risikoDaten.einkommen);
   const kreditsumme= Number(risikoDaten.kreditsumme);
   const vermoegen= Number(risikoDaten.vermoegen);
   const verbindlichkeiten = Number(risikoDaten.verbindlichkeiten);


    // --- 1. Risikoanalyse 
    // Je mehr Vermögen, desto besser. Je mehr Schulden, desto schlechter.
    // Je höher das Einkommen, desto niedriger das Risiko.

    const nettovermoegen = Number(vermoegen) - Number(verbindlichkeiten);
    const einkommensquote = Number(einkommen) / Number(kreditsumme); // Je höher desto besser
    const risikoWert = (Number(kreditsumme) / (nettovermoegen + 1)) + (1 / (einkommensquote + 1));

    let risikokategorie: 'Niedrig' | 'Mittel' | 'Hoch';

     if (risikoWert < 0.5 && !insolvenz && schufaScore > 80) {
      risikokategorie = 'Niedrig';
     } else if (risikoWert < 1.2 && schufaScore > 60) {
      risikokategorie = 'Mittel';
    } else {
      risikokategorie = 'Hoch';
    }

    // --- 2. Zinssatzberechnung (automatisiert) ---
    let zinssatz: number;

    switch (risikokategorie) {
      case 'Niedrig':
        zinssatz = 2.5;
        break;
      case 'Mittel':
        zinssatz = 4.0;
        break;
      case 'Hoch':
        zinssatz = 6.5;
        break;
    }

    // Ausgabe und Rückgabe der neuen Variablen
    const neueVariablen = {
      id ,
      risikokategorie,
      zinssatz
    };

    console.log("Risikoanalyse abgeschlossen:", {
      risikokategorie,
      risikoWert: risikoWert.toFixed(2),
      zinssatz: zinssatz.toFixed(2)
    });

    return job.complete(neueVariablen);
  },
});




