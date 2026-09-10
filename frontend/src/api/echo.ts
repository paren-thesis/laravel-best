import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<any>;
  }
}

window.Pusher = Pusher;

// pusher-js validates `cluster` before it reads `wsHost` and throws when it is
// missing. The value itself is unused when pointing at a self-hosted Soketi server.
const createEcho = (): Echo<any> | null => {
  try {
    return new Echo({
      broadcaster: 'pusher',
      key: 'fyp_app_key',
      cluster: 'mt1',
      wsHost: window.location.hostname,
      wsPort: 6001,
      forceTLS: false,
      disableStats: true,
      enabledTransports: ['ws', 'wss'],
    });
  } catch (error) {
    // A websocket failure must never stop the dashboard from rendering.
    console.error('Real-time notifications unavailable:', error);
    return null;
  }
};

export const echo = createEcho();
