Proyecto Next.JS nueva WEB

## Calendly

Las agendas públicas consultan disponibilidad y crean reservas mediante la API
de Calendly, sin iframe ni redirección. Configura el token únicamente en el
servidor:

```dotenv
CALENDLY_API_TOKEN=tu_token_privado
CALENDLY_ORG_URI=https://api.calendly.com/organizations/XXXXXXXXXXXX
```

Las landings incluidas tienen sus eventos de la cuenta `clase-evergreen`
asociados en `src/lib/calendly.ts`. El `.env` contiene únicamente credenciales
y datos privados de conexión. El token debe permitir leer tipos/disponibilidad y crear invitados
(`event_types:read`, `availability:read` y `scheduled_events:write`). La
Scheduling API requiere un plan de Calendly compatible.

## HubSpot

Los formularios de clases gratuitas conservan el diseño de las landings y se
envían desde `POST /api/hubspot/submissions` a HubSpot Forms v3. Configura el
Portal ID en el panel de administración (`hubspot_id`) o en el servidor:

```dotenv
HUBSPOT_PORTAL_ID=12345678
HUBSPOT_ACCESS_TOKEN=tu_service_key_o_token_privado
```

`HUBSPOT_ACCESS_TOKEN` es opcional: si está presente se utiliza el endpoint
seguro autenticado; si no, se utiliza el endpoint público de Forms. Nunca debe
llevar el prefijo `NEXT_PUBLIC_`. Los IDs de los formularios no son secretos y
se mantienen centralizados en `src/lib/hubspot-config.ts`.

La integración toma de la URL de la landing los parámetros `utm_source`,
`utm_medium`, `utm_campaign`, `utm_term` y `utm_content`, y los envía a los
campos ocultos disponibles en cada formulario. También envía la URL completa y
la cookie `hubspotutk` para conservar la atribución de HubSpot.
