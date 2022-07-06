/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import * as coreClient from "@azure/core-client";
import * as coreRestPipeline from "@azure/core-rest-pipeline";
import {
  PipelineRequest,
  PipelineResponse,
  SendRequest
} from "@azure/core-rest-pipeline";
import * as coreAuth from "@azure/core-auth";
import {
  PhpWorkloadsImpl,
  WordpressInstancesImpl,
  SAPVirtualInstancesImpl,
  SAPCentralInstancesImpl,
  SAPDatabaseInstancesImpl,
  SAPApplicationServerInstancesImpl,
  OperationsImpl,
  MonitorsImpl,
  ProviderInstancesImpl,
  SkusImpl
} from "./operations";
import {
  PhpWorkloads,
  WordpressInstances,
  SAPVirtualInstances,
  SAPCentralInstances,
  SAPDatabaseInstances,
  SAPApplicationServerInstances,
  Operations,
  Monitors,
  ProviderInstances,
  Skus
} from "./operationsInterfaces";
import * as Parameters from "./models/parameters";
import * as Mappers from "./models/mappers";
import {
  WorkloadsClientOptionalParams,
  SAPSizingRecommendationsOptionalParams,
  SAPSizingRecommendationsResponse,
  SAPSupportedSkuOptionalParams,
  SAPSupportedSkuResponse,
  SAPDiskConfigurationsOptionalParams,
  SAPDiskConfigurationsResponse,
  SAPAvailabilityZoneDetailsOptionalParams,
  SAPAvailabilityZoneDetailsResponse
} from "./models";

export class WorkloadsClient extends coreClient.ServiceClient {
  $host: string;
  subscriptionId: string;
  apiVersion: string;

  /**
   * Initializes a new instance of the WorkloadsClient class.
   * @param credentials Subscription credentials which uniquely identify client subscription.
   * @param subscriptionId The ID of the target subscription.
   * @param options The parameter options
   */
  constructor(
    credentials: coreAuth.TokenCredential,
    subscriptionId: string,
    options?: WorkloadsClientOptionalParams
  ) {
    if (credentials === undefined) {
      throw new Error("'credentials' cannot be null");
    }
    if (subscriptionId === undefined) {
      throw new Error("'subscriptionId' cannot be null");
    }

    // Initializing default values for options
    if (!options) {
      options = {};
    }
    const defaults: WorkloadsClientOptionalParams = {
      requestContentType: "application/json; charset=utf-8",
      credential: credentials
    };

    const packageDetails = `azsdk-js-arm-workloads/1.0.0-beta.1`;
    const userAgentPrefix =
      options.userAgentOptions && options.userAgentOptions.userAgentPrefix
        ? `${options.userAgentOptions.userAgentPrefix} ${packageDetails}`
        : `${packageDetails}`;

    if (!options.credentialScopes) {
      options.credentialScopes = ["https://management.azure.com/.default"];
    }
    const optionsWithDefaults = {
      ...defaults,
      ...options,
      userAgentOptions: {
        userAgentPrefix
      },
      baseUri:
        options.endpoint ?? options.baseUri ?? "https://management.azure.com"
    };
    super(optionsWithDefaults);

    if (options?.pipeline && options.pipeline.getOrderedPolicies().length > 0) {
      const pipelinePolicies: coreRestPipeline.PipelinePolicy[] = options.pipeline.getOrderedPolicies();
      const bearerTokenAuthenticationPolicyFound = pipelinePolicies.some(
        (pipelinePolicy) =>
          pipelinePolicy.name ===
          coreRestPipeline.bearerTokenAuthenticationPolicyName
      );
      if (!bearerTokenAuthenticationPolicyFound) {
        this.pipeline.removePolicy({
          name: coreRestPipeline.bearerTokenAuthenticationPolicyName
        });
        this.pipeline.addPolicy(
          coreRestPipeline.bearerTokenAuthenticationPolicy({
            scopes: `${optionsWithDefaults.baseUri}/.default`,
            challengeCallbacks: {
              authorizeRequestOnChallenge:
                coreClient.authorizeRequestOnClaimChallenge
            }
          })
        );
      }
    }
    // Parameter assignments
    this.subscriptionId = subscriptionId;

    // Assigning values to Constant parameters
    this.$host = options.$host || "https://management.azure.com";
    this.apiVersion = options.apiVersion || "2021-12-01-preview";
    this.phpWorkloads = new PhpWorkloadsImpl(this);
    this.wordpressInstances = new WordpressInstancesImpl(this);
    this.sAPVirtualInstances = new SAPVirtualInstancesImpl(this);
    this.sAPCentralInstances = new SAPCentralInstancesImpl(this);
    this.sAPDatabaseInstances = new SAPDatabaseInstancesImpl(this);
    this.sAPApplicationServerInstances = new SAPApplicationServerInstancesImpl(
      this
    );
    this.operations = new OperationsImpl(this);
    this.monitors = new MonitorsImpl(this);
    this.providerInstances = new ProviderInstancesImpl(this);
    this.skus = new SkusImpl(this);
    this.addCustomApiVersionPolicy(options.apiVersion);
  }

  /** A function that adds a policy that sets the api-version (or equivalent) to reflect the library version. */
  private addCustomApiVersionPolicy(apiVersion?: string) {
    if (!apiVersion) {
      return;
    }
    const apiVersionPolicy = {
      name: "CustomApiVersionPolicy",
      async sendRequest(
        request: PipelineRequest,
        next: SendRequest
      ): Promise<PipelineResponse> {
        const param = request.url.split("?");
        if (param.length > 1) {
          const newParams = param[1].split("&").map((item) => {
            if (item.indexOf("api-version") > -1) {
              return item.replace(/(?<==).*$/, apiVersion);
            } else {
              return item;
            }
          });
          request.url = param[0] + "?" + newParams.join("&");
        }
        return next(request);
      }
    };
    this.pipeline.addPolicy(apiVersionPolicy);
  }

  /**
   * Get SAP sizing recommendations.
   * @param location The name of Azure region.
   * @param options The options parameters.
   */
  sAPSizingRecommendations(
    location: string,
    options?: SAPSizingRecommendationsOptionalParams
  ): Promise<SAPSizingRecommendationsResponse> {
    return this.sendOperationRequest(
      { location, options },
      sAPSizingRecommendationsOperationSpec
    );
  }

  /**
   * Get SAP supported SKUs.
   * @param location The name of Azure region.
   * @param options The options parameters.
   */
  sAPSupportedSku(
    location: string,
    options?: SAPSupportedSkuOptionalParams
  ): Promise<SAPSupportedSkuResponse> {
    return this.sendOperationRequest(
      { location, options },
      sAPSupportedSkuOperationSpec
    );
  }

  /**
   * Get SAP Disk Configurations.
   * @param location The name of Azure region.
   * @param options The options parameters.
   */
  sAPDiskConfigurations(
    location: string,
    options?: SAPDiskConfigurationsOptionalParams
  ): Promise<SAPDiskConfigurationsResponse> {
    return this.sendOperationRequest(
      { location, options },
      sAPDiskConfigurationsOperationSpec
    );
  }

  /**
   * Get SAP Availability Zone Details.
   * @param location The name of Azure region.
   * @param options The options parameters.
   */
  sAPAvailabilityZoneDetails(
    location: string,
    options?: SAPAvailabilityZoneDetailsOptionalParams
  ): Promise<SAPAvailabilityZoneDetailsResponse> {
    return this.sendOperationRequest(
      { location, options },
      sAPAvailabilityZoneDetailsOperationSpec
    );
  }

  phpWorkloads: PhpWorkloads;
  wordpressInstances: WordpressInstances;
  sAPVirtualInstances: SAPVirtualInstances;
  sAPCentralInstances: SAPCentralInstances;
  sAPDatabaseInstances: SAPDatabaseInstances;
  sAPApplicationServerInstances: SAPApplicationServerInstances;
  operations: Operations;
  monitors: Monitors;
  providerInstances: ProviderInstances;
  skus: Skus;
}
// Operation Specifications
const serializer = coreClient.createSerializer(Mappers, /* isXml */ false);

const sAPSizingRecommendationsOperationSpec: coreClient.OperationSpec = {
  path:
    "/subscriptions/{subscriptionId}/providers/Microsoft.Workloads/locations/{location}/sapVirtualInstanceMetadata/default/getSizingRecommendations",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.SAPSizingRecommendationResult
    },
    default: {
      bodyMapper: Mappers.ErrorResponse
    }
  },
  requestBody: Parameters.sAPSizingRecommendation,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.location
  ],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const sAPSupportedSkuOperationSpec: coreClient.OperationSpec = {
  path:
    "/subscriptions/{subscriptionId}/providers/Microsoft.Workloads/locations/{location}/sapVirtualInstanceMetadata/default/getSapSupportedSku",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.SAPSupportedResourceSkusResult
    },
    default: {
      bodyMapper: Mappers.ErrorResponse
    }
  },
  requestBody: Parameters.sAPSupportedSku,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.location
  ],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const sAPDiskConfigurationsOperationSpec: coreClient.OperationSpec = {
  path:
    "/subscriptions/{subscriptionId}/providers/Microsoft.Workloads/locations/{location}/sapVirtualInstanceMetadata/default/getDiskConfigurations",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.SAPDiskConfigurationsResult
    },
    default: {
      bodyMapper: Mappers.ErrorResponse
    }
  },
  requestBody: Parameters.sAPDiskConfigurations,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.location
  ],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const sAPAvailabilityZoneDetailsOperationSpec: coreClient.OperationSpec = {
  path:
    "/subscriptions/{subscriptionId}/providers/Microsoft.Workloads/locations/{location}/sapVirtualInstanceMetadata/default/getAvailabilityZoneDetails",
  httpMethod: "POST",
  responses: {
    200: {
      bodyMapper: Mappers.SAPAvailabilityZoneDetailsResult
    },
    default: {
      bodyMapper: Mappers.ErrorResponse
    }
  },
  requestBody: Parameters.sAPAvailabilityZoneDetails,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.location
  ],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};