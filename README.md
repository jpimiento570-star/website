# JIP Telecomunicaciones · Sitio web

Sitio estático (HTML, CSS y JavaScript sin dependencias). Se puede publicar en cualquier hosting: Cloudflare Pages, Netlify, Vercel o el hosting actual.

## Estructura

```
index.html          Página principal
privacidad.html     Política de tratamiento de datos (plantilla para completar)
styles.css          Estilos
config.js           ← ÚNICO archivo que hay que editar
main.js             Interacciones, calculadoras y envío del formulario
*.webp, *.jpg, *.mp4 Imágenes y video optimizados
```

## Conectar el formulario con LeadFlow

1. En el panel de LeadFlow → Ajustes → Formulario del sitio, copia el **Endpoint** y la **form_key**.
2. Pégalos en `config.js` (`leadflowEndpoint` y `formKey`).
3. En Ajustes → Servicios, crea los servicios con **exactamente** estos identificadores:

| Identificador | Servicio |
| --- | --- |
| `fibra-optica` | Internet por fibra óptica |
| `internet-rural` | Internet rural (radioenlace) |
| `cctv` | Cámaras de seguridad |
| `energia-solar` | Energía solar |
| `instalaciones-electricas` | Instalaciones eléctricas |

Mientras `config.js` tenga los valores de ejemplo, el formulario abre WhatsApp con los datos de la solicitud, así que el sitio se puede publicar antes de tener LeadFlow listo.

### Qué envía el formulario

| Campo | Valor |
| --- | --- |
| `type` | `cotizacion`, `mantenimiento_correctivo`, `mantenimiento_preventivo` o `pqr` |
| `service` | Uno de los identificadores de arriba |
| `name`, `email`, `phone`, `message`, `opt_in` | Campos estándar de LeadFlow |
| `plan`, `barrio`, `direccion`, `origen` | Campos extra: quedan en `contacts.custom` y se pueden usar en los flujos como `{{contact.custom.plan}}` |

Las solicitudes de soporte y las quejas crean un radicado en LeadFlow, y el sitio lo muestra al cliente al enviar.

## Editar contenido sin tocar el diseño

En `config.js`:
- **Planes y precios** de fibra: se actualizan a la vez en la sección de planes, el asesor de velocidad y el formulario.
- **Zonas de cobertura** con su tecnología (`fibra`, `radio` o `mixta`): alimentan el verificador del inicio y la lista de cobertura.
- **WhatsApp** y **redes sociales** (los íconos solo aparecen si hay enlace).

## Antes de publicar

- [ ] Completar `privacidad.html` con razón social, NIT, correo y fecha, y hacerla revisar.
- [ ] Revisar los supuestos de la calculadora solar (tarifa de 950 COP/kWh y 4,5 horas de sol pico); se pueden ajustar en el propio sitio o en los valores por defecto de `index.html`.
- [ ] Confirmar qué zonas de la lista tienen fibra y cuáles radio (hoy varias están como `mixta`).
- [ ] Reemplazar `rural.webp` por una foto real de una instalación rural cuando la tengan.
