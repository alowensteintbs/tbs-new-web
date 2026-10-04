# Order bumps

El panel `/admin/order-bumps` permite crear, editar y desactivar ofertas para un
producto principal. Solo ADMIN y SUPERADMIN pueden administrar las ofertas.
Las páginas, consultas, lista paginada y validación se ejecutan en el servidor;
el formulario de edición y la selección de checkout usan componentes de cliente.

Se reutilizan `OfertaCheckout`, `OfertaCheckoutPrice` y los campos `ofertaId`,
`origen` y `discountAmount` de `OrderItem`. La migración
`20261001120000_ofertas_checkout` se recuperó con el mismo checksum que la base
local. No se recrearon tablas ni se modificó el historial de migraciones.

Una oferta solo aparece si está activa, ambos productos están disponibles y
tiene precio especial en la moneda habilitada del checkout. Un precio vacío
oculta la oferta en esa moneda; cero permite ofrecerla gratis. No se usa el
precio normal del producto adicional como sustituto. Al cambiar de país se
actualizan las ofertas y se limpia la selección. Al recargar se recuperan
únicamente las selecciones que siguen disponibles.

La compra revalida todos los IDs y calcula los importes con Decimal en el
servidor. Rechaza selecciones duplicadas, ofertas ajenas al producto principal,
desactivadas, sin precio o con productos ocultos. Cada artículo guarda una
copia del nombre, SKU, precio y descuento. Cambiar o eliminar una oferta no
modifica esas copias históricas.

Los cupones y sus mínimos se aplican al producto principal. El adicional
conserva su precio especial. Un cupón del 100% deja el pedido pendiente si
todavía hay adicionales que cobrar. Stripe, seQura y Aplazame reciben los
descuentos de cada línea y un total exacto; las líneas gratuitas se conservan
en el pedido pero no se envían como artículos cobrables. Los pedidos antiguos
sin descuentos por línea mantienen el reparto proporcional anterior.
Los reportes de ingresos por formación también respetan el descuento de cada
línea; el panel de pedidos identifica los adicionales.

## Verificación

```powershell
npm test
npx tsc --noEmit --incremental false
npm run lint
npm run build
npx prisma migrate status
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script
```

La prueba de MySQL se habilita explícitamente:

```powershell
$env:ORDER_BUMP_DB_TEST = '1'
node --test tests/order-bumps.db.test.mjs
Remove-Item Env:ORDER_BUMP_DB_TEST
```

Esa prueba usa una transacción que se revierte. Crea productos, oferta, cupón,
cliente y pedido temporales; comprueba importes, edición, historial y rechazo
de ofertas no disponibles. No inicia pagos externos ni envía correos. Verifica
que los productos y el cliente de prueba no permanezcan en la base.
