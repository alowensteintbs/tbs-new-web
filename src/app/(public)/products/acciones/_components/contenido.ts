export const cursoAcciones = {
  nombre: "Curso de Acciones",
  mensual: "73€",
  completo: "950€",
};

export const incluyeAcciones = [
  "Aula virtual de por vida",
  "Clases grupales en directo",
  "3 meses de tutorías",
  "Fiscalidad con TaxDown",
  "Asistente de IA",
  "Acompañamiento y soporte",
];


export const razonesAcciones = [
  {
    "titulo": "Porque te enseña a mirar la empresa que hay detrás de una acción.",
    "texto": "Sus datos, resultados y situación importan tanto como el precio.",
    "icono": "/products/acciones/programa/building.svg"
  },
  {
    "titulo": "Porque combina análisis de empresas y de gráficos.",
    "texto": "Para que puedas tomar decisiones desde más de una perspectiva.",
    "icono": "/products/acciones/programa/chart-line.svg"
  },
  {
    "titulo": "Porque no existe una única forma de invertir en cripto.",
    "texto": "Aprendes a adaptar tus estrategias según tus objetivos, plazo y lo que esté ocurriendo con el precio.",
    "icono": "/products/acciones/programa/bitcoin.svg"
  },
  {
    "titulo": "Porque va de elegir una acción a construir una cartera.",
    "texto": "Diversificación, riesgo y seguimiento forman parte de la misma decisión.",
    "icono": "/products/acciones/programa/briefcase.svg"
  },
  {
    "titulo": "Porque incorpora distintas formas de invertir pensando en el largo plazo.",
    "texto": "Dividendos, ETFs, fondos indexados, renta fija y carteras automatizadas.",
    "icono": "/products/acciones/programa/sparkles.svg"
  },
  {
    "titulo": "Porque aprendes la parte práctica que suele generar dudas al empezar.",
    "texto": "Cómo elegir un bróker, qué costes mirar y cómo realizar y seguir tus inversiones.",
    "icono": "/products/acciones/programa/graduation-cap.svg"
  }
] as const;

export const aprendizajesAcciones = [
  {
    "titulo": "Entender qué estás comprando cuando inviertes en una empresa",
    "texto": "Interpretando su negocio, su situación financiera y los factores que pueden influir en su evolución."
  },
  {
    "titulo": "Analizar empresas para tomar decisiones con criterio",
    "texto": "Combinando información fundamental, valoración y contexto de mercado."
  },
  {
    "titulo": "Leer gráficos e identificar tendencias y zonas relevantes",
    "texto": "Utilizando el análisis técnico como apoyo para mejorar momentos de entrada y salida."
  },
  {
    "titulo": "Encontrar acciones que encajen con tu estrategia",
    "texto": "Utilizando filtros y herramientas de selección para detectar oportunidades de inversión a medio largo plazo."
  },
  {
    "titulo": "Construir una cartera adaptada a tus objetivos y diversificada",
    "texto": "Repartiendo el capital entre distintos activos y gestionando correctamente el riesgo."
  },
  {
    "titulo": "Invertir a largo plazo",
    "texto": "Utilizando ETFs, carteras automatizadas, acciones, renta fija, dividendos y fondos indexados. Vas a entender qué papel puede cumplir cada producto en la estrategia."
  },
  {
    "titulo": "Medir y revisar el rendimiento de tus inversiones",
    "texto": "Analizando resultados, rentabilidad, riesgo y evolución de la cartera para saber cuándo mantener, ajustar o replantear una posición."
  },
  {
    "titulo": "Gestionar la parte operativa y fiscal de tus inversiones",
    "texto": "Eligiendo brókers según seguridad, costes y condiciones, y entendiendo cómo tributan acciones, dividendos y plusvalías."
  }
] as const;

export const objetivosAcciones = [
  {
    "icono": "/products/acciones/programa/chart-no-axes-column.svg",
    "texto": "La capacidad de analizar una empresa antes de invertir."
  },
  {
    "icono": "/products/acciones/programa/trending-up.svg",
    "texto": "La capacidad de interpretar gráficos y movimientos del precio."
  },
  {
    "icono": "/products/acciones/programa/search.svg",
    "texto": "La capacidad de encontrar acciones que respondan a tus propios criterios."
  },
  {
    "icono": "/products/acciones/programa/target.svg",
    "texto": "La capacidad de adaptar una estrategia según tus objetivos y el escenario."
  },
  {
    "icono": "/products/acciones/programa/layers.svg",
    "texto": "La capacidad de utilizar dividendos, ETFs, fondos indexados y otras alternativas."
  },
  {
    "icono": "/products/acciones/programa/circle-check.svg",
    "texto": "La capacidad de elegir un bróker con más criterio."
  },
  {
    "icono": "/products/acciones/programa/grid-3x3.svg",
    "texto": "La capacidad de construir y gestionar una cartera diversificada."
  },
  {
    "icono": "/products/acciones/programa/ruler.svg",
    "texto": "La capacidad de medir tus resultados y revisar tus inversiones."
  }
] as const;

export const beneficiosAcciones = [
  {
    titulo: "Feedback para mejorar",
    imagen: "tutorias.png",
    tipo: "tutorias",
    puntos: [
      "3 meses de tutorías.",
      "Corrección de prácticas.",
      "Feedback personalizado.",
    ],
  },
  {
    titulo: "Invierte sin vivir pendiente",
    imagen: "/products/acciones/beneficios/invertir.png",
    tipo: "invertir",
    puntos: [
      "Estrategias de largo plazo.",
      "Menos decisiones diarias.",
      "Seguimiento estructurado.",
    ],
  },
  {
    titulo: "Tu asistente, disponible 24/7",
    imagen: "asistente.png",
    tipo: "asistente",
    puntos: [
      "Pregunta cuando quieras.",
      "Sube ejercicios y tareas.",
      "Apoyo dentro del aula.",
    ],
  },
  {
    titulo: "Aprende viendo cómo se invierte",
    imagen: "/products/acciones/beneficios/operativa-v2.png",
    tipo: "operativa",
    puntos: [
      "Clases grupales en directo.",
      "Análisis de inversiones en vivo.",
      "Preguntas al profesor.",
    ],
  },
  {
    titulo: "Entiende también tus impuestos",
    imagen: "/products/trading/beneficios/impuestos.png",
    tipo: "fondeo",
    puntos: [
      "Fiscalidad aplicada a inversiones.",
      "Contenido especial de TaxDown.",
      "Impuestos llevados a la práctica.",
    ],
  },
  {
    titulo: "Todo, siempre disponible",
    imagen: "/products/cripto/beneficios/aula.png",
    tipo: "impuestos",
    puntos: [
      "Aula virtual de por vida.",
      "Accede cuando quieras.",
      "Repasa cualquier formación.",
    ],
  },
  {
    titulo: "Siempre tienes a quién preguntar",
    imagen: "soporte.png",
    tipo: "soporte",
    puntos: [
      "Soporte por WhatsApp y email.",
      "Dudas durante la formación.",
      "Asistente de IA 24/7.",
    ],
  },
] as const;
