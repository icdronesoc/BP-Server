exports.service_account = {
  "type": "service_account",
  "project_id": "bpelicansender",
  "private_key_id": process.env.FIREBASE_ID,
  "private_key": process.env.FIREBASE_KEY,
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://accounts.google.com/o/oauth2/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": process.env.FIREBASE_CERT_URL
}