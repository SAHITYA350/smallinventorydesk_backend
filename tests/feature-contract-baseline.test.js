import test from 'node:test';
import assert from 'node:assert/strict';
import { withServer, fetchJson } from './_server-test-utils.js';

test('version endpoint advertises starter baseline', async () => {
  await withServer(async (base) => {
    const { response, body } = await fetchJson(base, '/api/version');
    assert.equal(response.status, 200);
    assert.equal(body.runtime, 'node');
  });
});
