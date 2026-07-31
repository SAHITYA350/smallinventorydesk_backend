import test from 'node:test';
import assert from 'node:assert/strict';
import { withServer, fetchJson } from './_server-test-utils.js';

test('comments and activity contract', async () => {
  await withServer(async (base) => {
    const { response, body } = await fetchJson(base, '/api/ping');
    assert.equal(response.status, 200);
    assert.deepEqual(body, { ok: true, message: 'pong' });
  });
});
