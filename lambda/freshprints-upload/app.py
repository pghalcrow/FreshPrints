import json
import boto3
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime
import uuid
import requests
import unicodedata
import html

# AWS and env setup
s3_client = boto3.client('s3')
BUCKET_NAME = os.environ.get('BUCKET_NAME')
SENDER = os.environ.get('SENDER')
RECEIVER = os.environ.get('RECEIVER')
GMAIL_PASSWORD = os.environ.get('GMAIL_PASSWORD')
FRONTEND_BASE_URL = os.environ.get('FRONTEND_BASE_URL')
PRESIGNED_EXPIRATION = int(os.environ.get('PRESIGNED_EXPIRATION', 7*24*60*60))
RECAPTCHA_SECRET_KEY = os.environ.get('RECAPTCHA_SECRET_KEY')

# Brand colors
colors = {
    "dark_blue": "#161925",
    "red": "#b9272c",
    "blue": "#235789",
    "yellow": "#f4c430",
    "white": "#fdfffc"
}


def send_email(file_name, file_key, first_name, last_name, company, email, phone, quantity, size):
    """Send an HTML email with Download and View buttons + user info"""
    download_link = f"{FRONTEND_BASE_URL}{file_key}?action=download"
    view_link = f"{FRONTEND_BASE_URL}{file_key}?action=view"
    subject_company = " ".join(str(company or "").split())  # no line breaks in the header
    subject = f"New File Uploaded - {subject_company}" if subject_company else "New File Uploaded"
    # Escape customer-entered values before inserting them into the HTML body
    file_name, first_name, last_name, company, email, phone, quantity, size = (
        html.escape(str(v or "")) for v in (file_name, first_name, last_name, company, email, phone, quantity, size)
    )

    html_body = f"""
    <html>
      <body style="background-color:{colors['dark_blue']}; color:{colors['white']}; font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color:{colors['white']};">📤 New File Uploaded</h2>
        <p style="color:{colors['white']};">A new file has been uploaded. You can view it in your browser or download it directly:</p>
        
        <div style="margin-top: 10px;">
          <a href="{download_link}" 
             download="{file_name}"
             style="
                 display: inline-block;
                 padding: 12px 20px;
                 margin-right: 10px;
                 background-color:{colors['red']};
                 color:{colors['white']};
                 text-decoration: none;
                 border-radius: 5px;
                 font-weight: bold;">
             ⬇️ Download {file_name}
          </a>
          
          <a href="{view_link}" 
             target="_blank"
             style="
                 display: inline-block;
                 padding: 12px 20px;
                 background-color:{colors['blue']};
                 color:{colors['white']};
                 text-decoration: none;
                 border-radius: 5px;
                 font-weight: bold;">
             🖼️ View {file_name}
          </a>
        </div>

        <hr style="margin: 30px 0; border-color: {colors['white']};" />

        <h3 style="color:{colors['yellow']};">Uploader Information</h3>
        <ul style="list-style: none; padding: 0;">
          <li><strong style="color:{colors['white']};">First Name:</strong> {first_name}</li>
          <li><strong style="color:{colors['white']};">Last Name:</strong> {last_name}</li>
          <li><strong style="color:{colors['white']};">Company:</strong> {company}</li>
          <li><strong style="color:{colors['white']};">Email:</strong> {email}</li>
          <li><strong style="color:{colors['white']};">Phone:</strong> {phone}</li>
        </ul>

        <h3 style="color:{colors['yellow']};">Order Specs</h3>
        <ul style="list-style: none; padding: 0;">
          <li><strong style="color:{colors['white']};">Quantity:</strong> {quantity}</li>
          <li><strong style="color:{colors['white']};">Final Size:</strong> {size}</li>
        </ul>
      </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["From"] = SENDER
    msg["To"] = RECEIVER
    msg["Subject"] = subject
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER, GMAIL_PASSWORD)
            server.send_message(msg)
        print("✅ Email sent successfully!")
    except Exception as e:
        print("❌ Error sending email:", e)


def verify_recaptcha(token: str) -> bool:
    """Verify reCAPTCHA token with Google's API, timeout after 3 seconds."""
    if not token:
        print("No reCAPTCHA token provided.")
        return False

    url = "https://www.google.com/recaptcha/api/siteverify"
    payload = {
        'secret': RECAPTCHA_SECRET_KEY,
        'response': token
    }

    try:
        response = requests.post(url, data=payload, timeout=10)
        result = response.json()
        print("reCAPTCHA verification response:", result)
        return result.get("success", False)
    except requests.Timeout:
        print("❌ reCAPTCHA verification timed out")
        return False
    except Exception as e:
        print("❌ Error verifying reCAPTCHA:", e)
        return False


def lambda_handler(event, context):
    print("Event received:", json.dumps(event))

    body = {}
    if "body" in event:
        try:
            body = json.loads(event.get("body") or "{}")
        except json.JSONDecodeError:
            print("❌ Failed to parse body as JSON")
            return {"statusCode": 400, "body": json.dumps({"message": "Invalid JSON body"})}
    else:
        body = event

    action = body.get("action", "upload")

    if action == "upload":
        # --- Upload workflow ---
        recaptcha_token = body.get("recaptchaToken", "")
        if not verify_recaptcha(recaptcha_token):
            print("❌ reCAPTCHA failed")

        file_name = body.get("fileName")
        file_type = body.get("fileType", "application/octet-stream")
        first_name = body.get("firstName", "")
        last_name = body.get("lastName", "")
        company = body.get("company", "")
        quantity = body.get("quantity", "")
        size = body.get("size", "")
        email = body.get("email", "")
        phone = body.get("phone", "")

        if not file_name:
            return {"statusCode": 400, "body": json.dumps({"message": "fileName is required"})}

        # Generate unique file key
        ext = os.path.splitext(file_name)[1]
        unique_name = f"{datetime.utcnow().strftime('%Y%m%dT%H%M%S')}_{uuid.uuid4().hex}{ext}"

        # Presigned PUT URL for frontend upload
        try:
            put_url = s3_client.generate_presigned_url(
                'put_object',
                Params={'Bucket': BUCKET_NAME, 'Key': unique_name, 'ContentType': file_type},
                ExpiresIn=900  # short-lived PUT URL
            )
        except Exception as e:
            print("❌ PUT URL error:", e)
            put_url = None

        # Send email to owner with frontend links (no presigned URL in email)
        send_email(file_name, unique_name, first_name, last_name, company, email, phone, quantity, size)

        return {
            "statusCode": 200,
            "body": json.dumps({
                "uploadUrl": put_url,
                "fileKey": unique_name
            })
        }

    elif action == "generate_link":
        # --- Generate presigned URL workflow ---
        file_key = body.get("fileKey")
        link_type = body.get("type")  # "download" or "view"

        if not file_key or link_type not in ["download", "view"]:
            return {"statusCode": 400, "body": json.dumps({"message": "fileKey and valid type are required"})}

        params = {'Bucket': BUCKET_NAME, 'Key': file_key}
        if link_type == "download":
            # Set download filename for attachment
            safe_file_name = unicodedata.normalize('NFKD', file_key).encode('ascii', 'ignore').decode('ascii')
            params['ResponseContentDisposition'] = f'attachment; filename="{safe_file_name}"'

        try:
            url = s3_client.generate_presigned_url(
                'get_object',
                Params=params,
                ExpiresIn=PRESIGNED_EXPIRATION
            )
        except Exception as e:
            print("❌ Presigned URL error:", e)
            return {"statusCode": 500, "body": json.dumps({"message": "Failed to generate URL"})}

        return {"statusCode": 200, "body": json.dumps({"url": url})}

    else:
        return {"statusCode": 400, "body": json.dumps({"message": "Invalid action"})}



