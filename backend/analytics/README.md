# Traffic analytics backend

First-party visit tracking for realfreshprints.com, viewed at **realfreshprints.com/admin**.
Everything is in one CloudFormation stack, `freshprints-analytics` (us-east-2).

## How it works

```
browser (traffic.service.ts) ──sendBeacon──▶ CloudFront ──▶ HTTP API POST /collect ──▶ collect Lambda ──▶ DynamoDB
/admin dashboard ──Cognito sign-in──▶ HTTP API GET /stats, /users (JWT) ──▶ api Lambda ──▶ DynamoDB / Cognito
```

- **CloudFront** exists only to add the visitor's approximate location (country, state, city,
  metro code) as request headers. The IP address is never stored.
- **DynamoDB** `freshprints-analytics-pageviews`: page views under `D#<day>`, actions (phone
  clicks, file uploads) under `E#<day>`. Days are Pacific time. Items expire after 396 days (13 months).
- **Cognito** pool `freshprints-analytics-admins`: admins only, no self sign-up. Invites and
  password resets are emailed by Cognito (`no-reply@verificationemail.com`, about 50 emails/day).
- No cookies. A random visit ID lives in `sessionStorage` and ends after 30 idle minutes.
  Signed-in admins' browsers set `fp_ignore_traffic` in `localStorage` and are not counted.

## Deploying

```bash
npm run deploy:analytics
```

This updates the stack, uploads the Lambda code from `src/`, and prints the values that belong in
`src/environments/environment.ts`. It uses the `freshprints` AWS CLI profile
(IAM user `freshprints-deploy`, policy in `iam/freshprints-deployer-policy.json`).

Deploying the website (`npm run deploy:aws`) does **not** deploy this backend, and vice versa.

## Local preview

On localhost the dashboard has a **Sample data** checkbox that shows generated numbers instead of
real ones. Localhost visits are never tracked.

## Notes

- The table and user pool have `DeletionPolicy: Retain`, so deleting the stack keeps the data.
  A failed *first* create leaves them behind too; delete them before redeploying.
- Bots are filtered by user agent and by `navigator.webdriver`.
