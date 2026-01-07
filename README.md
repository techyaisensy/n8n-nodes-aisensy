# 🟢 AiSensy for n8n

[![npm version](https://badge.fury.io/js/@aisensy%2Fn8n-nodes-aisensy.svg)](https://www.npmjs.com/package/@aisensy/n8n-nodes-aisensy)

**Official AiSensy Integration**

This is the official n8n node for [AiSensy](https://aisensy.com/), the complete WhatsApp Marketing platform based on the Official WhatsApp Business API.

Use this node to automate sending WhatsApp campaign messages, notifications, and fetching campaign details directly within your n8n workflows.

## ✨ Features

*   **Send WhatsApp Campaigns**: Trigger template messages programmatically via the AiSensy API.
*   **Dynamic Parameters**: Support for variable template parameters (e.g., `{{1}}`, `{{name}}`).
*   **Fetch Metadata**: specific campaign details and template metadata.

## 🚀 Installation

### Option 1: Via n8n Interface (Recommended)
1.  Open your n8n instance.
2.  Go to **Settings** > **Community Nodes**.
3.  Select **Install**.
4.  Enter the package name: `@aisensy/n8n-nodes-aisensy`

### Option 2: Via CLI
If you are running n8n via npm or Docker, you can install it in your n8n root directory (usually `~/.n8n`):

```bash
npm install @aisensy/n8n-nodes-aisensy
```

*Note: Restart n8n after installation.*

## 🔑 Credentials Setup

To use this node, you need an API Key from your AiSensy dashboard.

1.  Log in to [AiSensy](https://aisensy.com/).
2.  Navigate to **Manage** > **API Key** in your project settings.
3.  Copy the API Key.
4.  In n8n, create a new credential of type **AiSensy API**.
5.  Paste your key and click **Save**.

## 🛠️ Usage

Add the **AiSensy** node to your workflow and select one of the following operations:

### 1. Send Message
Send a WhatsApp template message to a user.

*   **Campaign Name**: The exact name of the campaign created in AiSensy.
*   **Destination**: The recipient's phone number (with country code, e.g., `919876543210`).
*   **Template Parameters**: Add one entry for each variable in your template (e.g., Value 1 for `{{1}}`).
*   **Optional Fields**:
    *   **User Name**: Name of the user for dashboard tracking.
    *   **Source**: Defaults to `n8n`.
    *   **Attributes**: JSON object for custom user attributes.

### 2. Get Campaign Details
Retrieve metadata about a specific campaign.

*   **Campaign Name**: The name of the campaign to fetch.
*   **Output**: Returns template status, formatted parameters, and campaign ID.

## 💻 Local Development

If you want to modify or contribute to this node:

1.  **Clone & Install**:
    ```bash
    git clone https://github.com/techyaisensy/n8n-nodes-aisensy.git
    npm install
    ```

2.  **Build & Link**:
    ```bash
    npm run build
    npm link
    ```

3.  **Link to n8n**:
    ```bash
    cd /path/to/your/n8n/installation
    npm link n8n-nodes-aisensy
    ```

4.  **Watch Mode**:
    ```bash
    npm run dev
    ```

## 📄 License
MIT

---

## 🏷️ Keywords
[AiSensy](https://www.npmjs.com/search?q=keywords:aisensy) • [n8n](https://www.npmjs.com/search?q=keywords:n8n) • [WhatsApp](https://www.npmjs.com/search?q=keywords:whatsapp) • [WhatsApp Business](https://www.npmjs.com/search?q=keywords:whatsapp-business) • [Marketing](https://www.npmjs.com/search?q=keywords:marketing) • [Automation](https://www.npmjs.com/search?q=keywords:automation) • [Workflow](https://www.npmjs.com/search?q=keywords:workflow) • [Broadcast](https://www.npmjs.com/search?q=keywords:broadcast) • [Low-code](https://www.npmjs.com/search?q=keywords:low-code)
