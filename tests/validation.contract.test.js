import test from 'node:test';
import assert from 'node:assert/strict';
import { withServer, fetchJson } from './_server-test-utils.js';

test('ticket validation contract', async () => {
  await withServer(async (base) => {
    const { response, body } = await fetchJson(base, '/api/unknown');
    assert.equal(response.status, 404);
    assert.equal(body.error, 'NOT_FOUND');
  });
});
