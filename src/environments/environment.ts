export const environment = {
  recaptchaSiteKey: '6LfBvMYrAAAAAO-6S_HRw_CKr8HsgnmtB2xt6MWT',

  // First-party traffic analytics (backend/analytics). Values come from `npm run deploy:analytics`.
  analytics: {
    apiUrl: 'https://2g6crt6w41.execute-api.us-east-2.amazonaws.com',
    collectUrl: 'https://d2bwrq4eyiszct.cloudfront.net/collect', // CloudFront adds visitor location
    region: 'us-east-2',
    userPoolClientId: '73fqpi378iimuqg38v2cdi1rjs'
  }
};
