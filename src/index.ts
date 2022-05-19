import { handleRequest } from './handler';
import { handleOptions } from "./handlerOptions";


addEventListener('fetch', (event) => {
  const request = event.request;

    if (request.method === 'OPTIONS') {
      event.respondWith(handleOptions(request));
    } else if (request.method === 'POST') {
      event.respondWith(handleRequest(request));
    } else {
      event.respondWith(
          new Response(null, {
            status: 405,
            statusText: 'Method Not Allowed',
          })
      );
    }
});
