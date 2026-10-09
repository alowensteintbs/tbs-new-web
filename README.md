Proyecto Next.JS nueva WEB

## Inscripción en TBS Academy

Configurar únicamente en el servidor (también en producción de Vercel):

```dotenv
TBS_ACADEMY_API_URL=https://academia.tradersbusinessschool.com/api/woocommerce/enroll
TBS_ACADEMY_API_KEY=tu_clave_privada
```

Antes de desplegar, aplicar las migraciones con `npx prisma migrate deploy`
usando la conexión de producción. La migración `20261009120000_inscripcion_academia`
forma parte del historial aplicado. La migración `20261009150000_academia_en_pedido`
traslada el seguimiento y la instantánea de entrega a `Order` y retira la tabla
auxiliar anterior después de copiar sus datos. El historial se guarda en
`OrderEvent`; no se mantiene una tabla adicional de alumnos ni inscripciones.
No ejecutar `migrate reset` ni `migrate dev` contra producción.

En cada producto, guardar los slugs reales de los cursos separados por comas.
Al comprar se guardan los cursos y los datos del comprador como instantánea.
Webhooks de pago, confirmaciones de transferencia y pedidos gratuitos disparan
la inscripción. Solo se marca `FULFILLED` cuando todos los cursos están confirmados.
Un fallo mantiene el pago confirmado y queda visible en el pedido, con botón de
reintento. Un bloqueo temporal evita llamadas simultáneas; pedidos completados
no vuelven a llamar a la API. Tras una respuesta parcial o timeout, la API debe
aceptar cursos ya otorgados con estado `already_enrolled`, como contempla el plugin.
No hay reintentos automáticos programados: el admin puede reintentar y también
se reintenta ante otra notificación válida de pago. No se guardan contraseñas
temporales ni respuestas completas de la academia.

La comprobación de acceso anterior al pago consulta todos los cursos seleccionados.
Si esa consulta falla, se permite continuar, igual que en el plugin anterior.
El endpoint utilizado y el esquema de respuestas se toman del plugin WordPress;
validar con un pedido de prueba antes de habilitarlo en producción. Reembolsar
un pedido no revoca accesos: el plugin no define una API para esa operación.

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
