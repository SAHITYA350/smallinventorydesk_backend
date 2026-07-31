const assert = require('node:assert/strict');

function failFeatureContractTest(featureKey, guidance) {
  assert.fail(
    '[NIYATI_TEMPLATE_BASELINE] ' + featureKey + ' contract test is not implemented yet. ' + guidance
  );
}

module.exports = { failFeatureContractTest };
