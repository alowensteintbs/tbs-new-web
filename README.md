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
