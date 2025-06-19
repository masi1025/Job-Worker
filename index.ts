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
  taskType: 'RisikoBewerten',
  taskHandler: async (job) => {
    console.log('Worker "RisikoBewerten" gestartet');
     let cancelled = false;
    

    const kundenDaten = job.variables;

    // Anfrage an JSON-Server mit allen Daten
    const response = await axios.post('http://localhost:3000/berechneRisiko', kundenDaten);

    const { id, risikokategorie } = response.data;

    console.log("Risikoanalyse abgeschlossen durch JSON Server:", {
      risikokategorie,
      //zinssatz
    });

    // Rückgabe an Camunda
    return job.complete({
      id,
      risikokategorie
    });
  }
});
