# freshprints-upload Lambda

Backend for the `/upload` page. Source of truth for the `freshprints-upload` (prod)
and `freshprints-upload-dev` Lambda functions in us-east-2 (Python, handler `app.lambda_handler`).

It verifies reCAPTCHA, returns a presigned S3 PUT URL, and emails the upload details
to the `RECEIVER` address. Any field added to the upload form must also be read in
`lambda_handler` and added to `send_email`, or it will be dropped from the email.

Config comes from environment variables set on the function (no secrets in this repo):
`BUCKET_NAME`, `SENDER`, `RECEIVER`, `GMAIL_PASSWORD`, `FRONTEND_BASE_URL`,
`PRESIGNED_EXPIRATION`, `RECAPTCHA_SECRET_KEY`.

## Deploying

The deployed package also bundles `requests`/`boto3` dependencies, which are not in
this repo. To deploy a change, download the current package, swap in `app.py`, and upload:

```bash
aws lambda get-function --function-name freshprints-upload --region us-east-2 --query Code.Location --output text
# download that URL to package.zip, replace app.py inside it, then:
aws lambda update-function-code --function-name freshprints-upload --region us-east-2 --zip-file fileb://package.zip
```
