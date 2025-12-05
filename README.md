# n8n-nodes-aisensy

Custom n8n node for Aisensy API campaign operations.

## Features

- **Get Campaign Details**: Fetch campaign information and template details
- **Send Campaign Message**: Send WhatsApp campaign messages via Aisensy API

## Installation

### Local Development

1. Clone or navigate to this directory:
```bash
cd /Users/chetansable/Developer/Personal/n8n-nodes-aisensy
```

2. Install dependencies:
```bash
npm install
```

3. Build the node:
```bash
npm run build
```

4. Link to your local n8n installation:
```bash
npm link
cd /Users/chetansable/Developer/Personal/n8n/n8n-data/.n8n/nodes
npm link n8n-nodes-aisensy
```

5. Start n8n:
```bash
cd /Users/chetansable/Developer/Personal/n8n
npm start
```

## Usage

### Setting Up Credentials

1. Get your API key from Aisensy:
   - Go to AiSensy -> Open your project -> Go to manage page -> Copy API key
   - Reference: https://wiki.aisensy.com/en/articles/11501891-how-to-setup-whatsapp-api-campaigns-in-aisensy

2. In n8n, create new credentials:
   - Select "AiSensy API" credential type
   - Enter your API key

### Get Campaign Details

1. Add the AiSensy node to your workflow
2. Select operation: "Get Campaign Details"
3. Enter the campaign name
4. Execute the node to fetch campaign details and template information

### Send Campaign Message

1. Add the AiSensy node to your workflow
2. Select operation: "Send Message"
3. Configure:
   - Campaign Name
   - Destination (phone number, e.g., 917024124397)
   - Template Parameters (add one for each template parameter)
   - User Name (optional)
   - Source (default: "n8n")
   - Attributes (optional JSON object)
   - Params Fallback Value (optional JSON object)

## API Endpoints

- **Get Campaign Details**: `POST https://backend.aisensy.com/stg/campaign/t1/api/campaign-details`
- **Send Message**: `POST https://backend.aisensy.com/stg/campaign/t1/api/v2`

## Development

### Build
```bash
npm run build
```

### Watch Mode
```bash
npm run dev
```

### Lint
```bash
npm run lint
```

## License

MIT


# n8n-nodes-aisensy
