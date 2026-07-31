import { createServer } from '../server.js';

export async function withServer(run) {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    await run('http://127.0.0.1:' + port);
  } finally {
    await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
  }
}

export async function fetchJson(base, path) {
  const response = await fetch(base + path);
  return { response, body: await response.json() };
}
