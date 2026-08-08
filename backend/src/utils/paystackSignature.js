const crypto = require('crypto');

function isValidPaystackSignature(rawBody, signatureHeader) {
  if (!signatureHeader || !rawBody) return false;
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest('hex');
  return hash === signatureHeader;
}

module.exports = { isValidPaystackSignature };
