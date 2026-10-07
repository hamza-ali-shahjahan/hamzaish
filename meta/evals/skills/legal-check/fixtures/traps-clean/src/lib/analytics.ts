import posthog from 'posthog-js';
export function init(key: string) { posthog.init(key, { api_host: 'https://us.i.posthog.com', disable_session_recording: true }); }
