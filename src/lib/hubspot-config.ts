export const HUBSPOT_FORMS = {
  trading: {
    id: "424f25f6-5eb4-4d73-a59e-53abc91840fc",
    name: "Clase gratuita de Trading",
    utmContent: true,
  },
  criptomonedas: {
    id: "ec8fad33-99ae-4848-bcc4-b3bdf7cd7131",
    name: "Clase gratuita de Criptomonedas",
    utmContent: true,
  },
  "trading-algoritmico": {
    id: "1e1137d2-73a2-4634-8237-f0a06d746132",
    name: "Clase gratuita de Trading Algorítmico",
    utmContent: true,
  },
  acciones: {
    id: "76f3aecb-3937-4892-b881-51c53b4055ba",
    name: "Clase gratuita de Acciones",
    utmContent: true,
  },
  "finanzas-personales": {
    id: "34476174-6c26-4af8-b59b-21d1a4f4a4c1",
    name: "Clase gratuita de Finanzas Personales",
    utmContent: false,
  },
  "inversor-inteligente": {
    id: "3b1cda11-2d75-4c42-8950-6916a2b56429",
    name: "Clase gratuita de Inversor Inteligente",
    utmContent: true,
  },
} as const;

export const HUBSPOT_FORM_KEYS = Object.keys(HUBSPOT_FORMS) as [
  HubSpotFormKey,
  ...HubSpotFormKey[],
];

export type HubSpotFormKey = keyof typeof HUBSPOT_FORMS;
