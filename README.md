# LuanTech 3.0 — Astra 6

Versión completa para Netlify, con catálogo público + panel privado + Netlify Blobs.

## Astra 6
Astra 6 es la capa de experiencia creada para este proyecto: seis principios aplicados al código, sin librerías externas de UI:
1. **Adaptive** — responsive móvil/escritorio.
2. **Smooth Motion** — reveal, hover, scan, floating cards y microinteracciones.
3. **Trust** — estados claros, stock y mensajes de operación.
4. **Rapid** — HTML/CSS/JS ligero y carga del catálogo bajo demanda.
5. **Secure** — contraseña y secreto solo en variables de Netlify; token firmado con caducidad.
6. **6th Sense** — carrito persistente, favoritos, búsqueda, filtros y experiencia contextual.

## Netlify
Variables obligatorias:
- `ADMIN_PASSWORD` → contraseña del administrador.
- `TOKEN_SECRET` → cadena larga y aleatoria.

No pongas estas variables en GitHub.

### Importante
Esta versión usa módulos ES (`type: module`) para evitar el error `ERR_REQUIRE_ESM` que ocurría al cargar `@netlify/blobs` desde CommonJS. También fija Node 22 en `netlify.toml`.

## WhatsApp
Edita `config.js` y cambia:
```js
whatsapp: "573001234567"
```
por tu número en formato internacional, sin `+`, espacios ni guiones.

## Rutas
- `/` — tienda.
- `/admin` — administración.
- `/api/products` — catálogo público.
- `/api/admin?action=login` — autenticación.
- `/api/admin?action=list` — catálogo privado.

## Panel administrador
- Crear, editar, borrar y duplicar productos.
- Precio, stock, categoría, etiqueta, descripción e imagen.
- Imagen por archivo o URL.
- Destacados.
- Búsqueda del inventario.
- Estadísticas.
- Exportar catálogo JSON.
- Importar catálogo JSON.
- Vaciar catálogo.
- Sesión con token firmado y expiración de 12 horas.

## Publicación
1. Sube todos los archivos a GitHub conservando la carpeta `netlify/functions`.
2. En Netlify conecta el repositorio.
3. Haz un nuevo deploy.
4. Configura `ADMIN_PASSWORD` y `TOKEN_SECRET` en Environment variables.
5. Haz **Clear cache and deploy site** si venías de una versión anterior.
6. Abre `/admin` y prueba el acceso.

## Nota sobre imágenes
Las imágenes subidas como archivo se guardan dentro del registro de Netlify Blobs como Base64. Para catálogos muy grandes conviene migrar imágenes a un almacenamiento de objetos/CDN y guardar únicamente la URL.

## Corrección Netlify 3.0.1
Esta versión fija el conflicto `ERR_REQUIRE_ESM` de `@netlify/blobs`: usa `@netlify/blobs` 11.0.2 y Node.js 22.12.0 o superior. Si Netlify conserva una versión anterior, ejecuta un nuevo deploy después de subir los cambios y revisa que `NODE_VERSION` no esté sobrescrito en Project configuration > Environment variables.


## FIX 3.0.2 — Netlify Blobs

Esta versión fija `@netlify/blobs` en `11.0.2` y añade un respaldo explícito para casos en los que Netlify no inyecte automáticamente las credenciales de Blobs en la Function.

Si el log sigue mostrando `MissingBlobsEnvironmentError`, en Netlify crea estas variables para **Functions**:

- `NETLIFY_SITE_ID` = el **Project ID** de tu proyecto.
- `NETLIFY_AUTH_TOKEN` = un **Personal Access Token** de Netlify con acceso al proyecto.

Después haz **Clear cache and deploy site**.

No pongas el token en GitHub ni dentro de los archivos del proyecto.
