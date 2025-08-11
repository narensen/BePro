# Email Service API

This API provides email functionality using Gmail SMTP for the BePro application.

## Configuration

- **Host**: smtp.gmail.com
- **Port**: 587
- **Username**: bepro.sunday@gmail.com
- **Authentication**: App password configured

## Endpoints

### GET /api/email

Test the email service configuration.

**Response:**
```json
{
  "success": true,
  "message": "Email service is configured and ready"
}
```

### POST /api/email

Send an email.

**Request Body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "text": "Plain text content",
  "html": "<p>HTML content (optional)</p>"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "unique-message-id",
  "message": "Email sent successfully"
}
```

## Usage Example

```javascript
const response = await fetch('/api/email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: 'user@example.com',
    subject: 'Welcome to BePro',
    text: 'Welcome to BePro! Your account has been created successfully.',
    html: '<p>Welcome to BePro! Your account has been created successfully.</p>'
  })
});

const result = await response.json();
console.log(result);
```