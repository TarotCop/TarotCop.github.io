export const BACKEND_URL = (window.location.href.indexOf("localhost") === -1)
    ? `${window.location.protocol.replace("http", "ws")}//${window.location.hostname}${(window.location.port && `:${window.location.port}`)}`
   : "wss://http://pi6tw3.colyseus.de/"
 // : "ws://localhost:2567"
export const BACKEND_HTTP_URL = BACKEND_URL.replace("ws", "http");