import {
  ICredentialType,
  INodeProperties,
  ICredentialTestRequest,
} from "n8n-workflow";

export class AiSensyApi implements ICredentialType {
  name = "aiSensyApi";
  displayName = "AiSensy API";
  documentationUrl =
    "https://wiki.aisensy.com/en/articles/11501891-how-to-setup-whatsapp-api-campaigns-in-aisensy";
  properties: INodeProperties[] = [
    {
      displayName: "API Key",
      name: "apiKey",
      type: "string",
      typeOptions: {
        password: true,
      },
      default: "",
      description:
        "Your AiSensy API key. Get it from AiSensy -> Open your project -> Go to manage page -> Copy API key",
      required: true,
    },
  ];

  test: ICredentialTestRequest = {
    request: {
      baseURL: "https://backend.aisensy.com",
      url: "/campaign/t1/api/campaign-details",
      method: "POST",
      json: true,
      body: {
        apiKey: "={{$credentials.apiKey}}",
        campaignName: "test",
      },
    },
  };
}
