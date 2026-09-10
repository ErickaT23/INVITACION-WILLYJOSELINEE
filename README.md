# INVITACION-WILLYJOSELINEE

## RSVP y Firebase

El evento usa la ruta `eventos/wilson-joselinee-2027` de Firebase Realtime Database.

- Invitados: `eventos/wilson-joselinee-2027/invitados/{id}`
- Confirmaciones: `eventos/wilson-joselinee-2027/rsvp/{id}`
- Administrador: `/admin.html?key=twodesign123`
- Dashboard: `/dashboard`

Después de publicar el sitio, el evento y los invitados definidos en `loads.js` se crean una vez desde la consola del navegador con:

```js
await window.seedWillJoselineeEvent()
```

La clave de la URL solo restringe la interfaz. Los permisos reales de lectura y escritura deben configurarse en las reglas de Realtime Database.
