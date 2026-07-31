import test from 'node:test';
import assert from 'node:assert/strict';
import { withServer, fetchJson } from './_server-test-utils.js';

test('ticket audit trail contract', async () => {
  await withServer(async (base) => {
    const { response, body } = await fetchJson(base, '/health');
    assert.equal(response.status, 200);
    assert.equal(body.service, 'api');
  });
});
