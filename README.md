<p align="center">
  <a href="https://builderbot.vercel.app/">
    <picture>
      <img src="https://builderbot.vercel.app/assets/thumbnail-vector.png" height="80">
    </picture>
    <h2 align="center">BuilderBot</h2>
  </a>
</p>

<p align="center">
  <a aria-label="NPM version" href="https://www.npmjs.com/package/@builderbot/bot">
    <img alt="" src="https://img.shields.io/npm/v/@builderbot/bot?color=%2300c200&label=%40bot-whatsapp">
  </a>
  </a>
</p>

## Getting Started

Con esta biblioteca, puede crear flujos de conversación automatizados independientes del proveedor de WhatsApp, configurar respuestas automáticas para preguntas frecuentes, recibir y responder mensajes automáticamente y realizar un seguimiento de las interacciones con los clientes. Además, puede configurar fácilmente activadores para ampliar las funcionalidades de forma ilimitada.

## Scripts

### `npm start`

Ejecuta la aplicación compilada en el entorno de producción. Debe ejecutarse después de compilar el proyecto con `npm run build`.

### `npm run lint`

Lanza el linter ESLint para revisar el código en busca de errores y problemas de estilo, asegurando que todo el código sigue las mejores prácticas y convenciones definidas.

### `npm run dev`

Combina la verificación de lint y el reinicio automático del servidor durante el desarrollo. Útil para obtener retroalimentación inmediata sobre cambios en el código.

### `npm run build`

Compila el proyecto usando Rollup como empaquetador de módulos. Esto prepara la aplicación para su despliegue en producción, optimizando y minificando los archivos.

## Variables de Entorno

- `CHATWOOT_ACCOUNT_ID`: Identificador de la cuenta de Chatwoot.
- `CHATWOOT_TOKEN`: Token de acceso para autenticar con la API de Chatwoot.
- `CHATWOOT_ENDPOINT`: URL de Chatwoot para conectar con la cuenta correspondiente.
- `jwtToken`: Token utilizado para autenticar y autorizar las solicitudes en la aplicación de WhatsApp Meta API.
- `numberId`: Número de teléfono de WhatsApp utilizado para enviar y recibir mensajes.
- `verifyToken`: Token de verificación para la aplicación de WhatsApp Meta API.
- `PORT`: Puerto en el que se ejecutará la aplicación.

Asegúrate de configurar estas variables en tu archivo `.env` antes de iniciar la aplicación.

## Documentation

Visit [builderbot](https://builderbot.vercel.app/) to view the full documentation.
