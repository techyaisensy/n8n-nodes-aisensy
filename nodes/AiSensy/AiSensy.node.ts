import {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  ResourceMapperFields,
  ResourceMapperField,
} from "n8n-workflow";

// Cache to store API responses by campaign name
const campaignDataCache = new Map<string, any>();

export class AiSensy implements INodeType {
  description: INodeTypeDescription = {
    displayName: "AiSensy",
    name: "aiSensy",
    icon: "file:aiSensy.png",
    group: ["transform"],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: "Send WhatsApp campaign messages via Aisensy API",
    defaults: {
      name: "AiSensy",
    },
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      {
        name: "aiSensyApi",
        required: true,
      },
    ],
    properties: [
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        options: [
          {
            name: "Send Message",
            value: "sendMessage",
            description: "Send a campaign message",
            action: "Send a campaign message",
          },
        ],
        default: "sendMessage",
      },
      {
        displayName: "Campaign Name",
        name: "campaignName",
        type: "string",
        default: "",
        required: true,
        displayOptions: {
          show: {
            operation: ["sendMessage"],
          },
        },
      },
      {
        displayName: "Message Data",
        name: "messageData",
        type: "resourceMapper",
        default: {
          mappingMode: "defineBelow",
          value: null,
        },
        required: true,
        typeOptions: {
          loadOptionsDependsOn: ["campaignName"],
          resourceMapper: {
            resourceMapperMethod: "getCampaignRequestSchema",
            mode: "add",
            fieldWords: {
              singular: "field",
              plural: "fields",
            },
            addAllFields: true,
            supportAutoMap: false,
          },
        },
        description:
          'Click "Add field" to load destination and template params based on the Campaign Name above. If you change the Campaign Name, click "Add field" again to refresh the fields.',
        displayOptions: {
          show: {
            operation: ["sendMessage"],
          },
        },
      },
    ],
  };

  methods = {
    resourceMapping: {
      async getCampaignRequestSchema(
        this: ILoadOptionsFunctions
      ): Promise<ResourceMapperFields> {
        try {
          const credentials = await this.getCredentials("aiSensyApi");
          const apiKey = credentials.apiKey as string;

          const campaignName = this.getNodeParameter(
            "campaignName",
            0
          ) as string;

          // Check if there's an existing messageData with a schema
          let existingCampaignName: string | null = null;
          try {
            const existingMessageData = this.getNodeParameter(
              "messageData",
              0
            ) as {
              mappingMode?: string;
              value?: { [key: string]: any } | null;
              schema?: ResourceMapperField[];
            } | null;

            if (
              existingMessageData &&
              existingMessageData.schema &&
              existingMessageData.schema.length > 0
            ) {
              // We'll detect the mismatch after fetching new data
            }
          } catch (e) {
            // No existing messageData, that's fine
          }

          if (!campaignName) {
            return {
              fields: [],
              emptyFieldsNotice: "Please provide a Campaign Name first",
            };
          }

          const options: any = {
            method: "POST",
            url: "https://backend.aisensy.com/campaign/t1/api/campaign-details",
            headers: {
              "Content-Type": "application/json",
            },
            body: {
              apiKey,
              campaignName,
            },
            json: true,
          };

          const responseData = await this.helpers.httpRequest(options);

          // Cache the response data for reuse in getMessageFormatTemplate
          campaignDataCache.set(campaignName, responseData);

          // Check if response is successful
          if (!responseData || !responseData.success) {
            return {
              fields: [],
              emptyFieldsNotice:
                "Failed to load campaign schema. Please check the campaign name and API credentials.",
            };
          }

          // Try to get requestBody from different possible locations
          let requestBody = responseData.requestBody;
          if (!requestBody && responseData.data) {
            requestBody = responseData.data.requestBody;
          }
          if (!requestBody && responseData.campaign) {
            // Sometimes the structure might be nested differently
            requestBody = responseData.campaign.requestBody;
          }

          if (!requestBody) {
            return {
              fields: [],
              emptyFieldsNotice:
                "Failed to load campaign schema. The API response does not contain requestBody. Response: " +
                JSON.stringify(responseData).substring(0, 200),
            };
          }

          const templateParams = requestBody.templateParams || [];

          // Check if there's an existing schema with a different campaign name
          let campaignNameMismatch = false;
          let existingSchemaCampaignName: string | null = null;
          try {
            const existingMessageData = this.getNodeParameter(
              "messageData",
              0
            ) as {
              mappingMode?: string;
              value?: { [key: string]: any } | null;
              schema?: ResourceMapperField[];
            } | null;

            if (
              existingMessageData &&
              existingMessageData.schema &&
              existingMessageData.schema.length > 0
            ) {
              // Look for a hidden field that stores the campaign name
              const campaignNameField = existingMessageData.schema.find(
                (f) => f.id === "__campaignName__"
              );
              if (campaignNameField && campaignNameField.defaultValue) {
                existingSchemaCampaignName = String(
                  campaignNameField.defaultValue
                );

                if (existingSchemaCampaignName !== campaignName) {
                  campaignNameMismatch = true;
                }
              }
            }
          } catch (e) {
            // No existing messageData or error accessing it
          }

          const fields: ResourceMapperField[] = [];

          // Add a hidden field to store the campaign name used for this schema
          // This allows us to detect changes later
          fields.push({
            id: "__campaignName__",
            displayName: "Campaign Name (Internal)",
            type: "string",
            required: false,
            display: false, // Hidden field
            defaultMatch: false,
            defaultValue: campaignName,
          });

          // Always add username field
          fields.push({
            id: "userName",
            displayName: "User Name",
            type: "string",
            required: true,
            display: true,
            defaultMatch: false,
          });

          // Always add destination field
          fields.push({
            id: "destination",
            displayName: "Destination (Phone Number)",
            type: "string",
            required: true,
            display: true,
            defaultMatch: false,
          });

          if (requestBody.media) {
            fields.push({
              id: `templateMediaFileName`,
              displayName: `File Name`,
              type: "string",
              required: true,
              display: true,
              defaultMatch: false,
            });
            fields.push({
              id: `templateMediaURL`,
              displayName: `MediaURL`,
              type: "string",
              required: true,
              display: true,
              defaultMatch: false,
            });
          }

          // Add template parameter fields
          for (let i = 0; i < templateParams.length; i++) {
            fields.push({
              id: `templateParams[${i}]`,
              displayName: `Template Param ${i + 1}`,
              type: "string",
              required: true,
              display: true,
              defaultMatch: false,
            });
          }

          // Always return at least destination field for debugging
          if (fields.length === 0) {
            fields.push({
              id: "destination",
              displayName: "Destination (Phone Number)",
              type: "string",
              required: true,
              display: true,
              defaultMatch: false,
            });
          }

          // If campaign name changed, add a warning notice
          if (campaignNameMismatch && existingSchemaCampaignName) {
            const warningMessage = `⚠️ Warning: The Campaign Name has changed from "${existingSchemaCampaignName}" to "${campaignName}". The fields below have been refreshed for the new campaign. Please review and update your field mappings if needed.`;
            return {
              fields,
              emptyFieldsNotice: warningMessage,
            };
          }

          return {
            fields,
          };
        } catch (error: any) {
          return {
            fields: [],
            emptyFieldsNotice: `Error loading schema: ${error.message}`,
          };
        }
      },
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const operation = this.getNodeParameter("operation", 0) as string;

    const credentials = await this.getCredentials("aiSensyApi");
    const apiKey = credentials.apiKey as string;

    for (let i = 0; i < items.length; i++) {
      try {
        if (operation === "sendMessage") {
          const campaignName = this.getNodeParameter(
            "campaignName",
            i
          ) as string;

          // Get resourceMapper data
          const messageData = this.getNodeParameter("messageData", i, {
            mappingMode: "defineBelow",
            value: null,
          }) as {
            mappingMode: string;
            value: { [key: string]: string | number | boolean | null } | null;
            schema: ResourceMapperField[];
          };

          if (!messageData || !messageData.value) {
            throw new Error(
              "Message Data is required. Please configure the resource mapper."
            );
          }

          const mappedValues = messageData.value;
          const destination = mappedValues.destination as string;
          const userName = mappedValues.userName as string;

          if (!destination) {
            throw new Error("Destination (Phone Number) is required");
          }

          // Extract templateParams from mapped values
          // templateParams come as templateParams[0], templateParams[1], etc.
          const templateParams: string[] = [];
          const templateParamKeys = Object.keys(mappedValues)
            .filter((key) => key.startsWith("templateParams["))
            .sort((a, b) => {
              const indexA = parseInt(a.match(/\[(\d+)\]/)?.[1] || "0");
              const indexB = parseInt(b.match(/\[(\d+)\]/)?.[1] || "0");
              return indexA - indexB;
            });

          for (const key of templateParamKeys) {
            const value = mappedValues[key];
            if (value !== null && value !== undefined) {
              templateParams.push(String(value));
            }
          }

          // Extract media from mapped values if present
          let media: { url: string; filename: string } | undefined;
          const mediaURL = mappedValues.templateMediaURL as string;
          const mediaFileName = mappedValues.templateMediaFileName as string;

          if (mediaURL || mediaFileName) {
            media = {
              url: mediaURL || "",
              filename: mediaFileName || "",
            };
          }

          // Build request body according to specification
          const requestBody: any = {
            campaignName,
            apiKey: "",
            templateParams,
            destination,
            source: "n8n",
            userName,
            attributes: {},
            meta_data: [],
            defaultCountryCode: "IN",
            paramsFallbackValue: {},
          };

          // Add media to request body if present
          if (media) {
            requestBody.media = media;
          }

          // Set apiKey from credentials
          requestBody.apiKey = apiKey;

          const options: any = {
            method: "POST",
            url: "https://backend.aisensy.com/campaign/t1/api/v2",
            headers: {
              "Content-Type": "application/json",
            },
            body: requestBody,
            json: true,
          };

          const responseData = await this.helpers.httpRequest(options);

          returnData.push({
            json: responseData,
            pairedItem: {
              item: i,
            },
          });
        }
      } catch (error: any) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error.message,
            },
            pairedItem: {
              item: i,
            },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
