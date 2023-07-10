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
  GlobalRulestackImpl,
  CertificateObjectGlobalRulestackImpl,
  FqdnListGlobalRulestackImpl,
  PostRulesImpl,
  PrefixListGlobalRulestackImpl,
  PreRulesImpl,
  OperationsImpl,
  FirewallsImpl,
  LocalRulestacksImpl,
  FirewallStatusImpl,
  CertificateObjectLocalRulestackImpl,
  FqdnListLocalRulestackImpl,
  LocalRulesImpl,
  PrefixListLocalRulestackImpl
} from "./operations";
import {
  GlobalRulestack,
  CertificateObjectGlobalRulestack,
  FqdnListGlobalRulestack,
  PostRules,
  PrefixListGlobalRulestack,
  PreRules,
  Operations,
  Firewalls,
  LocalRulestacks,
  FirewallStatus,
  CertificateObjectLocalRulestack,
  FqdnListLocalRulestack,
  LocalRules,
  PrefixListLocalRulestack
} from "./operationsInterfaces";
import { PaloAltoNetworksCloudngfwOptionalParams } from "./models";

export class PaloAltoNetworksCloudngfw extends coreClient.ServiceClient {
  $host: string;
  apiVersion: string;
  subscriptionId?: string;

  /**
   * Initializes a new instance of the PaloAltoNetworksCloudngfw class.
   * @param credentials Subscription credentials which uniquely identify client subscription.
   * @param subscriptionId The ID of the target subscription.
   * @param options The parameter options
   */
  constructor(
    credentials: coreAuth.TokenCredential,
    subscriptionId: string,
    options?: PaloAltoNetworksCloudngfwOptionalParams
  );
  constructor(
    credentials: coreAuth.TokenCredential,
    options?: PaloAltoNetworksCloudngfwOptionalParams
  );
  constructor(
    credentials: coreAuth.TokenCredential,
    subscriptionIdOrOptions?: PaloAltoNetworksCloudngfwOptionalParams | string,
    options?: PaloAltoNetworksCloudngfwOptionalParams
  ) {
    if (credentials === undefined) {
      throw new Error("'credentials' cannot be null");
    }

    let subscriptionId: string | undefined;

    if (typeof subscriptionIdOrOptions === "string") {
      subscriptionId = subscriptionIdOrOptions;
    } else if (typeof subscriptionIdOrOptions === "object") {
      options = subscriptionIdOrOptions;
    }

    // Initializing default values for options
    if (!options) {
      options = {};
    }
    const defaults: PaloAltoNetworksCloudngfwOptionalParams = {
      requestContentType: "application/json; charset=utf-8",
      credential: credentials
    };

    const packageDetails = `azsdk-js-arm-paloaltonetworksngfw/1.0.0`;
    const userAgentPrefix =
      options.userAgentOptions && options.userAgentOptions.userAgentPrefix
        ? `${options.userAgentOptions.userAgentPrefix} ${packageDetails}`
        : `${packageDetails}`;

    const optionsWithDefaults = {
      ...defaults,
      ...options,
      userAgentOptions: {
        userAgentPrefix
      },
      endpoint:
        options.endpoint ?? options.baseUri ?? "https://management.azure.com"
    };
    super(optionsWithDefaults);

    let bearerTokenAuthenticationPolicyFound: boolean = false;
    if (options?.pipeline && options.pipeline.getOrderedPolicies().length > 0) {
      const pipelinePolicies: coreRestPipeline.PipelinePolicy[] = options.pipeline.getOrderedPolicies();
      bearerTokenAuthenticationPolicyFound = pipelinePolicies.some(
        (pipelinePolicy) =>
          pipelinePolicy.name ===
          coreRestPipeline.bearerTokenAuthenticationPolicyName
      );
    }
    if (
      !options ||
      !options.pipeline ||
      options.pipeline.getOrderedPolicies().length == 0 ||
      !bearerTokenAuthenticationPolicyFound
    ) {
      this.pipeline.removePolicy({
        name: coreRestPipeline.bearerTokenAuthenticationPolicyName
      });
      this.pipeline.addPolicy(
        coreRestPipeline.bearerTokenAuthenticationPolicy({
          credential: credentials,
          scopes:
            optionsWithDefaults.credentialScopes ??
            `${optionsWithDefaults.endpoint}/.default`,
          challengeCallbacks: {
            authorizeRequestOnChallenge:
              coreClient.authorizeRequestOnClaimChallenge
          }
        })
      );
    }
    // Parameter assignments
    this.subscriptionId = subscriptionId;

    // Assigning values to Constant parameters
    this.$host = options.$host || "https://management.azure.com";
    this.apiVersion = options.apiVersion || "2022-08-29";
    this.globalRulestack = new GlobalRulestackImpl(this);
    this.certificateObjectGlobalRulestack = new CertificateObjectGlobalRulestackImpl(
      this
    );
    this.fqdnListGlobalRulestack = new FqdnListGlobalRulestackImpl(this);
    this.postRules = new PostRulesImpl(this);
    this.prefixListGlobalRulestack = new PrefixListGlobalRulestackImpl(this);
    this.preRules = new PreRulesImpl(this);
    this.operations = new OperationsImpl(this);
    this.firewalls = new FirewallsImpl(this);
    this.localRulestacks = new LocalRulestacksImpl(this);
    this.firewallStatus = new FirewallStatusImpl(this);
    this.certificateObjectLocalRulestack = new CertificateObjectLocalRulestackImpl(
      this
    );
    this.fqdnListLocalRulestack = new FqdnListLocalRulestackImpl(this);
    this.localRules = new LocalRulesImpl(this);
    this.prefixListLocalRulestack = new PrefixListLocalRulestackImpl(this);
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
              return "api-version=" + apiVersion;
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

  globalRulestack: GlobalRulestack;
  certificateObjectGlobalRulestack: CertificateObjectGlobalRulestack;
  fqdnListGlobalRulestack: FqdnListGlobalRulestack;
  postRules: PostRules;
  prefixListGlobalRulestack: PrefixListGlobalRulestack;
  preRules: PreRules;
  operations: Operations;
  firewalls: Firewalls;
  localRulestacks: LocalRulestacks;
  firewallStatus: FirewallStatus;
  certificateObjectLocalRulestack: CertificateObjectLocalRulestack;
  fqdnListLocalRulestack: FqdnListLocalRulestack;
  localRules: LocalRules;
  prefixListLocalRulestack: PrefixListLocalRulestack;
}
