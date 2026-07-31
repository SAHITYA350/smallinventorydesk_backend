import test from 'node:test';
import assert from 'node:assert/strict';
import { withServer, fetchJson } from './_server-test-utils.js';

test('ticket CRUD contract', async () => {
  await withServer(async (base) => {
    const { response, body } = await fetchJson(base, '/api/ping');
    assert.equal(response.status, 200);
    assert.equal(body.message, 'pong');
  });
});
