// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint @typescript-eslint/member-ordering: 0 */

import {
  TokenCredential,
  isTokenCredential,
  signingPolicy,
  RequestOptionsBase,
  operationOptionsToRequestOptionsBase,
  PipelineOptions,
  createPipelineFromOptions,
  ServiceClientOptions as Pipeline
} from "@azure/core-http";

import { getTracer, Span } from "@azure/core-tracing";
import { logger } from "./log";

import "@azure/core-paging";
import { PageSettings, PagedAsyncIterableIterator } from "@azure/core-paging";
import { PollerLike, PollOperationState } from "@azure/core-lro";
import {
  SecretBundle,
  DeletedSecretBundle,
  DeletionRecoveryLevel,
  KeyVaultClientGetSecretsOptionalParams,
  SetSecretResponse,
  DeleteSecretResponse,
  UpdateSecretResponse,
  GetSecretResponse,
  GetDeletedSecretResponse,
  BackupSecretResponse,
  RestoreSecretResponse
} from "./core/models";
import { KeyVaultClient } from "./core/keyVaultClient";
import { SDK_VERSION } from "./core/utils/constants";
import { challengeBasedAuthenticationPolicy } from "./core/challengeBasedAuthenticationPolicy";

import { DeleteSecretPoller } from "./lro/delete/poller";
import { RecoverDeletedSecretPoller } from "./lro/recover/poller";

import {
  KeyVaultSecret,
  DeletedSecret,
  SecretClientInterface,
  SecretPollerOptions,
  SetSecretOptions,
  UpdateSecretPropertiesOptions,
  GetSecretOptions,
  GetDeletedSecretOptions,
  PurgeDeletedSecretOptions,
  BackupSecretOptions,
  RestoreSecretBackupOptions,
  RecoverDeletedSecretOptions,
  ListOperationOptions,
  SecretProperties
} from "./secretsModels";
import { parseKeyvaultIdentifier as parseKeyvaultEntityIdentifier } from "./core/utils";

export {
  DeletedSecret,
  DeletionRecoveryLevel,
  GetSecretOptions,
  PipelineOptions,
  GetDeletedSecretOptions,
  PurgeDeletedSecretOptions,
  BackupSecretOptions,
  RestoreSecretBackupOptions,
  RecoverDeletedSecretOptions,
  ListOperationOptions,
  PagedAsyncIterableIterator,
  PageSettings,
  PollerLike,
  PollOperationState,
  KeyVaultSecret,
  SecretProperties,
  SecretPollerOptions,
  SetSecretOptions,
  UpdateSecretPropertiesOptions,
  logger
};

// This is part of constructing the autogenerated client. In the future, it should not
// be required. See also: https://github.com/Azure/azure-sdk-for-js/issues/5508
const SERVICE_API_VERSION = "7.0";

/**
 * The client to interact with the KeyVault secrets functionality
 */
export class SecretClient {
  /**
   * The base URL to the vault
   */
  public readonly vaultUrl: string;

  /**
   * The options to create the connection to the service
   */
  public readonly pipeline: Pipeline;

  /**
   * The authentication credentials
   */
  protected readonly credential: TokenCredential;
  private readonly client: KeyVaultClient;

  /**
   * A self reference that bypasses private methods, for the pollers.
   */
  private readonly pollerClient: SecretClientInterface = {
    recoverDeletedSecret: this.recoverDeletedSecret.bind(this),
    getSecret: this.getSecret.bind(this),
    deleteSecret: this.deleteSecret.bind(this),
    getDeletedSecret: this.getDeletedSecret.bind(this)
  };

  /**
   * Creates an instance of SecretClient.
   *
   * Example usage:
   * ```ts
   * import { SecretClient } from "@azure/keyvault-secrets";
   * import { DefaultAzureCredential } from "@azure/identity";
   *
   * let url = `https://<MY KEYVAULT HERE>.vault.azure.net`;
   * let credentials = new DefaultAzureCredential();
   *
   * let client = new SecretClient(url, credentials);
   * ```
   * @param {string} vaultUrl the base URL to the vault
   * @param {TokenCredential} The credential to use for API requests. (for example: [[https://azure.github.io/azure-sdk-for-js/identity/classes/defaultazurecredential.html|DefaultAzureCredential]])
   * @param {PipelineOptions} [pipelineOptions={}] Optional. Pipeline options used to configure Key Vault API requests.
   *                                                         Omit this parameter to use the default pipeline configuration.
   * @memberof SecretClient
   */
  constructor(
    vaultUrl: string,
    credential: TokenCredential,
    pipelineOptions: PipelineOptions = {}
  ) {
    this.vaultUrl = vaultUrl;
    this.credential = credential;

    const libInfo = `azsdk-js-keyvault-secrets/${SDK_VERSION}`;
    if (pipelineOptions.userAgentOptions) {
      pipelineOptions.userAgentOptions.userAgentPrefix !== undefined
        ? `${pipelineOptions.userAgentOptions.userAgentPrefix} ${libInfo}`
        : libInfo;
    } else {
      pipelineOptions.userAgentOptions = {
        userAgentPrefix: libInfo
      };
    }

    const authPolicy = isTokenCredential(credential)
      ? challengeBasedAuthenticationPolicy(credential)
      : signingPolicy(credential);

    const internalPipelineOptions = {
      ...pipelineOptions,
      ...{
        loggingOptions: {
          logger: logger.info,
          logPolicyOptions: {
            allowedHeaderNames: [
              "x-ms-keyvault-region",
              "x-ms-keyvault-network-info",
              "x-ms-keyvault-service-version"
            ]
          }
        }
      }
    };

    this.pipeline = createPipelineFromOptions(internalPipelineOptions, authPolicy);
    this.client = new KeyVaultClient(credential, SERVICE_API_VERSION, this.pipeline);
  }

  /**
   * The setSecret method adds a secret or secret version to the Azure Key Vault. If the named secret
   * already exists, Azure Key Vault creates a new version of that secret.
   * This operation requires the secrets/set permission.
   *
   * Example usage:
   * ```ts
   * let client = new SecretClient(url, credentials);
   * await client.setSecret("MySecretName", "ABC123");
   * ```
   * @summary Adds a secret in a specified key vault.
   * @param secretName The name of the secret.
   * @param value The value of the secret.
   * @param [options] The optional parameters
   */
  public async setSecret(
    secretName: string,
    value: string,
    options: SetSecretOptions = {}
  ): Promise<KeyVaultSecret> {
    const requestOptions = operationOptionsToRequestOptionsBase(options);

    if (requestOptions) {
      const { enabled, notBefore, expiresOn: expires, ...remainingOptions } = requestOptions;
      const unflattenedOptions = {
        ...remainingOptions,
        secretAttributes: {
          enabled,
          notBefore,
          expires
        }
      };

      const span = this.createSpan("setSecret", unflattenedOptions);

      let response: SetSecretResponse;
      try {
        response = await this.client.setSecret(
          this.vaultUrl,
          secretName,
          value,
          this.setParentSpan(span, unflattenedOptions)
        );
      } finally {
        span.end();
      }

      return this.getSecretFromSecretBundle(response);
    } else {
      const response = await this.client.setSecret(
        this.vaultUrl,
        secretName,
        value,
        requestOptions
      );
      return this.getSecretFromSecretBundle(response);
    }
  }

  /**
   * Deletes a secret stored in Azure Key Vault.
   * This function returns a Long Running Operation poller that allows you to wait indifinetly until the secret is deleted.
   *
   * This operation requires the secrets/delete permission.
   *
   * Example usage:
   * ```ts
   * const client = new SecretClient(url, credentials);
   * await client.setSecret("MySecretName", "ABC123");
   *
   * const deletePoller = await client.beginDeleteSecret("MySecretName");
   *
   * // Serializing the poller
   * const serialized = deletePoller.toJSON();
   *
   * // A new poller can be created with:
   * // const newPoller = await client.beginDeleteSecret("MySecretName", { resumeFrom: serialized });
   *
   * // Waiting until it's done
   * const deletedSecret = await deletePoller.pollUntilDone();
   * console.log(deletedSecret);
   * ```
   * @summary Deletes a secret from a specified key vault.
   * @param secretName The name of the secret.
   * @param [options] The optional parameters
   */
  public async beginDeleteSecret(
    name: string,
    options: SecretPollerOptions = {}
  ): Promise<PollerLike<PollOperationState<DeletedSecret>, DeletedSecret>> {
    const requestOptions = operationOptionsToRequestOptionsBase(options);
    const poller = new DeleteSecretPoller({
      name,
      client: this.pollerClient,
      ...options,
      requestOptions
    });
    // This will initialize the poller's operation (the deletion of the secret).
    await poller.poll();
    return poller;
  }

  /**
   * The updateSecret method changes specified attributes of an existing stored secret. Properties that
   * are not specified in the request are left unchanged. The value of a secret itself cannot be
   * changed. This operation requires the secrets/set permission.
   *
   * Example usage:
   * ```ts
   * let secretName = "MySecretName";
   * let client = new SecretClient(url, credentials);
   * let secret = await client.getSecret(secretName);
   * await client.updateSecret(secretName, secret.version, { enabled: false });
   * ```
   * @summary Updates the attributes associated with a specified secret in a given key vault.
   * @param secretName The name of the secret.
   * @param secretVersion The version of the secret.
   * @param [options] The optional parameters
   */
  public async updateSecretProperties(
    secretName: string,
    secretVersion: string,
    options: UpdateSecretPropertiesOptions = {}
  ): Promise<SecretProperties> {
    const requestOptions = operationOptionsToRequestOptionsBase(options);

    if (requestOptions) {
      const { enabled, notBefore, expiresOn: expires, ...remainingOptions } = requestOptions;
      const unflattenedOptions = {
        ...remainingOptions,
        secretAttributes: {
          enabled,
          notBefore,
          expires
        }
      };

      const span = this.createSpan("updateSecretProperties", unflattenedOptions);

      let response: UpdateSecretResponse;

      try {
        response = await this.client.updateSecret(
          this.vaultUrl,
          secretName,
          secretVersion,
          this.setParentSpan(span, unflattenedOptions)
        );
      } finally {
        span.end();
      }

      return this.getSecretFromSecretBundle(response).properties;
    } else {
      const response = await this.client.updateSecret(
        this.vaultUrl,
        secretName,
        secretVersion,
        requestOptions
      );
      return this.getSecretFromSecretBundle(response).properties;
    }
  }

  /**
   * The getSecret method is applicable to any secret stored in Azure Key Vault. This operation requires
   * the secrets/get permission.
   *
   * Example usage:
   * ```ts
   * let client = new SecretClient(url, credentials);
   * let secret = await client.getSecret("MySecretName");
   * ```
   * @summary Get a specified secret from a given key vault.
   * @param secretName The name of the secret.
   * @param [options] The optional parameters
   */
  public async getSecret(
    secretName: string,
    options: GetSecretOptions = {}
  ): Promise<KeyVaultSecret> {
    const requestOptions = operationOptionsToRequestOptionsBase(options);
    const span = this.createSpan("getSecret", requestOptions);

    let response: GetSecretResponse;
    try {
      response = await this.client.getSecret(
        this.vaultUrl,
        secretName,
        options && options.version ? options.version : "",
        this.setParentSpan(span, requestOptions)
      );
    } finally {
      span.end();
    }

    return this.getSecretFromSecretBundle(response);
  }

  /**
   * The getDeletedSecret method returns the specified deleted secret along with its attributes.
   * This operation requires the secrets/get permission.
   *
   * Example usage:
   * ```ts
   * let client = new SecretClient(url, credentials);
   * await client.getDeletedSecret("MyDeletedSecret");
   * ```
   * @summary Gets the specified deleted secret.
   * @param secretName The name of the secret.
   * @param [options] The optional parameters
   */
  public async getDeletedSecret(
    secretName: string,
    options: GetDeletedSecretOptions = {}
  ): Promise<DeletedSecret> {
    const requestOptions = operationOptionsToRequestOptionsBase(options);
    const span = this.createSpan("getDeletedSecret", requestOptions);

    let response: GetDeletedSecretResponse;

    try {
      response = await this.client.getDeletedSecret(
        this.vaultUrl,
        secretName,
        this.setParentSpan(span, requestOptions)
      );
    } finally {
      span.end();
    }

    return this.getSecretFromSecretBundle(response);
  }

  /**
   * The purge deleted secret operation removes the secret permanently, without the possibility of
   * recovery. This operation can only be enabled on a soft-delete enabled vault. This operation
   * requires the secrets/purge permission.
   *
   * Example usage:
   * ```ts
   * const client = new SecretClient(url, credentials);
   * const deletePoller = await client.beginDeleteSecret("MySecretName");
   * await deletePoller.pollUntilDone();
   * await client.purgeDeletedSecret("MySecretName");
   * ```
   * @summary Permanently deletes the specified secret.
   * @param secretName The name of the secret.
   * @param [options] The optional parameters
   */
  public async purgeDeletedSecret(
    secretName: string,
    options: PurgeDeletedSecretOptions = {}
  ): Promise<void> {
    const requestOptions = operationOptionsToRequestOptionsBase(options);
    const span = this.createSpan("purgeDeletedSecret", requestOptions);

    try {
      await this.client.purgeDeletedSecret(
        this.vaultUrl,
        secretName,
        this.setParentSpan(span, requestOptions)
      );
    } finally {
      span.end();
    }
  }

  /**
   * Recovers the deleted secret in the specified vault.
   * This function returns a Long Running Operation poller that allows you to wait indifinetly until the secret is recovered.
   *
   * This operation requires the secrets/recover permission.
   *
   * Example usage:
   * ```ts
   * const client = new SecretClient(url, credentials);
   * await client.setSecret("MySecretName", "ABC123");
   *
   * const deletePoller = await client.beginDeleteSecret("MySecretName");
   * await deletePoller.pollUntilDone();
   *
   * const recoverPoller = await client.recoverDeletedSecret("MySecretName");
   *
   * // Serializing the poller
   * const serialized = recoverPoller.toJSON();
   *
   * // A new poller can be created with:
   * // const newPoller = await client.beginRecoverDeletedSecret("MySecretName", { resumeFrom: serialized });
   *
   * // Waiting until it's done
   * const deletedSecret = await recoverPoller.pollUntilDone();
   * console.log(deletedSecret);
   * ```
   * @summary Recovers the deleted secret to the latest version.
   * @param secretName The name of the deleted secret.
   * @param [options] The optional parameters
   */
  public async beginRecoverDeletedSecret(
    name: string,
    options: SecretPollerOptions = {}
  ): Promise<PollerLike<PollOperationState<SecretProperties>, SecretProperties>> {
    const requestOptions = operationOptionsToRequestOptionsBase(options);

    const poller = new RecoverDeletedSecretPoller({
      name,
      client: this.pollerClient,
      ...options,
      requestOptions
    });

    // This will initialize the poller's operation (the recovery of the deleted secret).
    await poller.poll();
    return poller;
  }

  /**
   * Requests that a backup of the specified secret be downloaded to the client. All versions of the
   * secret will be downloaded. This operation requires the secrets/backup permission.
   *
   * Example usage:
   * ```ts
   * let client = new SecretClient(url, credentials);
   * let backupResult = await client.backupSecret("MySecretName");
   * ```
   * @summary Backs up the specified secret.
   * @param secretName The name of the secret.
   * @param [options] The optional parameters
   */
  public async backupSecret(
    secretName: string,
    options: BackupSecretOptions = {}
  ): Promise<Uint8Array | undefined> {
    const requestOptions = operationOptionsToRequestOptionsBase(options);
    const span = this.createSpan("backupSecret", requestOptions);

    let response: BackupSecretResponse;

    try {
      response = await this.client.backupSecret(
        this.vaultUrl,
        secretName,
        this.setParentSpan(span, requestOptions)
      );
    } finally {
      span.end();
    }
    return response.value;
  }

  /**
   * Restores a backed up secret, and all its versions, to a vault. This operation requires the
   * secrets/restore permission.
   *
   * Example usage:
   * ```ts
   * let client = new SecretClient(url, credentials);
   * let mySecretBundle = await client.backupSecret("MySecretName");
   * // ...
   * await client.restoreSecretBackup(mySecretBundle);
   * ```
   * @summary Restores a backed up secret to a vault.
   * @param secretBundleBackup The backup blob associated with a secret bundle.
   * @param [options] The optional parameters
   */
  public async restoreSecretBackup(
    secretBundleBackup: Uint8Array,
    options: RestoreSecretBackupOptions = {}
  ): Promise<SecretProperties> {
    const requestOptions = operationOptionsToRequestOptionsBase(options);
    const span = this.createSpan("restoreSecretBackup", requestOptions);

    let response: RestoreSecretResponse;

    try {
      response = await this.client.restoreSecret(
        this.vaultUrl,
        secretBundleBackup,
        this.setParentSpan(span, requestOptions)
      );
    } finally {
      span.end();
    }

    return this.getSecretFromSecretBundle(response).properties;
  }

  private async deleteSecret(
    secretName: string,
    options: RequestOptionsBase = {}
  ): Promise<DeletedSecret> {
    const span = this.createSpan("deleteSecret", options);

    let response: DeleteSecretResponse;
    try {
      response = await this.client.deleteSecret(
        this.vaultUrl,
        secretName,
        this.setParentSpan(span, options)
      );
    } finally {
      span.end();
    }

    return this.getSecretFromSecretBundle(response);
  }

  private async recoverDeletedSecret(
    secretName: string,
    options: RecoverDeletedSecretOptions = {}
  ): Promise<SecretProperties> {
    const requestOptions = operationOptionsToRequestOptionsBase(options);
    const span = this.createSpan("recoverDeletedSecret", requestOptions);

    let properties: SecretProperties;

    try {
      const response = await this.client.recoverDeletedSecret(
        this.vaultUrl,
        secretName,
        this.setParentSpan(span, requestOptions)
      );
      properties = this.getSecretFromSecretBundle(response).properties;
    } finally {
      span.end();
    }

    return properties;
  }

  private async *listPropertiesOfSecretVersionsPage(
    secretName: string,
    continuationState: PageSettings,
    options: RequestOptionsBase = {}
  ): AsyncIterableIterator<SecretProperties[]> {
    if (continuationState.continuationToken == null) {
      const optionsComplete: KeyVaultClientGetSecretsOptionalParams = {
        maxresults: continuationState.maxPageSize,
        ...options
      };
      const currentSetResponse = await this.client.getSecretVersions(
        this.vaultUrl,
        secretName,
        optionsComplete
      );
      continuationState.continuationToken = currentSetResponse.nextLink;
      if (currentSetResponse.value) {
        yield currentSetResponse.value.map(
          (bundle) => this.getSecretFromSecretBundle(bundle).properties
        );
      }
    }
    while (continuationState.continuationToken) {
      const currentSetResponse = await this.client.getSecretVersions(
        continuationState.continuationToken,
        secretName,
        options
      );
      continuationState.continuationToken = currentSetResponse.nextLink;
      if (currentSetResponse.value) {
        yield currentSetResponse.value.map(
          (bundle) => this.getSecretFromSecretBundle(bundle).properties
        );
      } else {
        break;
      }
    }
  }

  private async *listPropertiesOfSecretVersionsAll(
    secretName: string,
    options: RequestOptionsBase = {}
  ): AsyncIterableIterator<SecretProperties> {
    const f = {};

    for await (const page of this.listPropertiesOfSecretVersionsPage(secretName, f, options)) {
      for (const item of page) {
        yield item;
      }
    }
  }

  /**
   * Iterates all versions of the given secret in the vault. The full secret identifier and attributes are provided
   * in the response. No values are returned for the secrets. This operations requires the secrets/list permission.
   *
   * Example usage:
   * ```ts
   * let client = new SecretClient(url, credentials);
   * for await (const secretAttr of client.listPropertiesOfSecretVersions("MySecretName")) {
   *   const secret = await client.getSecret(secretAttr.name);
   *   console.log("secret version: ", secret);
   * }
   * ```
   * @param secretName Name of the secret to fetch versions for
   * @param [options] The optional parameters
   */
  public listPropertiesOfSecretVersions(
    secretName: string,
    options: ListOperationOptions = {}
  ): PagedAsyncIterableIterator<SecretProperties, SecretProperties[]> {
    const requestOptions = operationOptionsToRequestOptionsBase(options);
    const span = this.createSpan("listPropertiesOfSecretVersions", requestOptions);
    const updatedOptions: ListOperationOptions = {
      ...requestOptions,
      ...this.setParentSpan(span, requestOptions)
    };

    const iter = this.listPropertiesOfSecretVersionsAll(secretName, updatedOptions);

    span.end();
    return {
      next() {
        return iter.next();
      },
      [Symbol.asyncIterator]() {
        return this;
      },
      byPage: (settings: PageSettings = {}) =>
        this.listPropertiesOfSecretVersionsPage(secretName, settings, updatedOptions)
    };
  }

  private async *listPropertiesOfSecretsPage(
    continuationState: PageSettings,
    options: RequestOptionsBase = {}
  ): AsyncIterableIterator<SecretProperties[]> {
    if (continuationState.continuationToken == null) {
      const optionsComplete: KeyVaultClientGetSecretsOptionalParams = {
        maxresults: continuationState.maxPageSize,
        ...options
      };
      const currentSetResponse = await this.client.getSecrets(this.vaultUrl, optionsComplete);
      continuationState.continuationToken = currentSetResponse.nextLink;
      if (currentSetResponse.value) {
        yield currentSetResponse.value.map(
          (bundle) => this.getSecretFromSecretBundle(bundle).properties
        );
      }
    }
    while (continuationState.continuationToken) {
      const currentSetResponse = await this.client.getSecrets(
        continuationState.continuationToken,
        options
      );
      continuationState.continuationToken = currentSetResponse.nextLink;
      if (currentSetResponse.value) {
        yield currentSetResponse.value.map(
          (bundle) => this.getSecretFromSecretBundle(bundle).properties
        );
      } else {
        break;
      }
    }
  }

  private async *listPropertiesOfSecretsAll(
    options: ListOperationOptions = {}
  ): AsyncIterableIterator<SecretProperties> {
    const f = {};

    for await (const page of this.listPropertiesOfSecretsPage(f, options)) {
      for (const item of page) {
        yield item;
      }
    }
  }

  /**
   * Iterates the latest version of all secrets in the vault.  The full secret identifier and attributes are provided
   * in the response. No values are returned for the secrets. This operations requires the secrets/list permission.
   *
   * Example usage:
   * ```ts
   * let client = new SecretClient(url, credentials);
   * for await (const secretAttr of client.listPropertiesOfSecrets()) {
   *   const secret = await client.getSecret(secretAttr.name);
   *   console.log("secret: ", secret);
   * }
   * ```
   * @summary List all secrets in the vault
   * @param [options] The optional parameters
   */
  public listPropertiesOfSecrets(
    options: ListOperationOptions = {}
  ): PagedAsyncIterableIterator<SecretProperties, SecretProperties[]> {
    const requestOptions = operationOptionsToRequestOptionsBase(options);
    const span = this.createSpan("listPropertiesOfSecrets", requestOptions);
    const updatedOptions: ListOperationOptions = {
      ...requestOptions,
      ...this.setParentSpan(span, requestOptions)
    };

    const iter = this.listPropertiesOfSecretsAll(updatedOptions);

    span.end();
    return {
      next() {
        return iter.next();
      },
      [Symbol.asyncIterator]() {
        return this;
      },
      byPage: (settings: PageSettings = {}) =>
        this.listPropertiesOfSecretsPage(settings, updatedOptions)
    };
  }

  private async *listDeletedSecretsPage(
    continuationState: PageSettings,
    options: RequestOptionsBase = {}
  ): AsyncIterableIterator<DeletedSecret[]> {
    if (continuationState.continuationToken == null) {
      const optionsComplete: KeyVaultClientGetSecretsOptionalParams = {
        maxresults: continuationState.maxPageSize,
        ...options
      };
      const currentSetResponse = await this.client.getDeletedSecrets(
        this.vaultUrl,
        optionsComplete
      );
      continuationState.continuationToken = currentSetResponse.nextLink;
      if (currentSetResponse.value) {
        yield currentSetResponse.value.map((bundle) => this.getSecretFromSecretBundle(bundle));
      }
    }
    while (continuationState.continuationToken) {
      const currentSetResponse = await this.client.getDeletedSecrets(
        continuationState.continuationToken,
        options
      );
      continuationState.continuationToken = currentSetResponse.nextLink;
      if (currentSetResponse.value) {
        yield currentSetResponse.value.map((bundle) => this.getSecretFromSecretBundle(bundle));
      } else {
        break;
      }
    }
  }

  private async *listDeletedSecretsAll(
    options: ListOperationOptions = {}
  ): AsyncIterableIterator<DeletedSecret> {
    const f = {};

    for await (const page of this.listDeletedSecretsPage(f, options)) {
      for (const item of page) {
        yield item;
      }
    }
  }

  /**
   * Iterates the deleted secrets in the vault.  The full secret identifier and attributes are provided
   * in the response. No values are returned for the secrets. This operations requires the secrets/list permission.
   *
   * Example usage:
   * ```ts
   * let client = new SecretClient(url, credentials);
   * for await (const secretAttr of client.listDeletedSecrets()) {
   *   const deletedSecret = await client.getSecret(secretAttr.name);
   *   console.log("deleted secret: ", deletedSecret);
   * }
   * ```
   * @summary List all secrets in the vault
   * @param [options] The optional parameters
   */
  public listDeletedSecrets(
    options: ListOperationOptions = {}
  ): PagedAsyncIterableIterator<DeletedSecret, DeletedSecret[]> {
    const requestOptions = operationOptionsToRequestOptionsBase(options);
    const span = this.createSpan("listDeletedSecrets", requestOptions);
    const updatedOptions: ListOperationOptions = {
      ...requestOptions,
      ...this.setParentSpan(span, requestOptions)
    };

    const iter = this.listDeletedSecretsAll(updatedOptions);

    span.end();
    return {
      next() {
        return iter.next();
      },
      [Symbol.asyncIterator]() {
        return this;
      },
      byPage: (settings: PageSettings = {}) => this.listDeletedSecretsPage(settings, updatedOptions)
    };
  }

  private getSecretFromSecretBundle(bundle: SecretBundle | DeletedSecretBundle): KeyVaultSecret {
    const secretBundle = bundle as SecretBundle;
    const deletedSecretBundle = bundle as DeletedSecretBundle;
    const parsedId = parseKeyvaultEntityIdentifier("secrets", secretBundle.id);

    const attributes = secretBundle.attributes;
    delete secretBundle.attributes;

    let resultObject: KeyVaultSecret & DeletedSecret = {
      value: secretBundle.value,
      name: parsedId.name,
      properties: {
        vaultUrl: parsedId.vaultUrl,
        expiresOn: (attributes as any).expires,
        createdOn: (attributes as any).created,
        updatedOn: (attributes as any).updated,
        ...secretBundle,
        ...parsedId,
        ...attributes
      }
    };

    if (deletedSecretBundle.deletedDate) {
      resultObject.properties.deletedOn = deletedSecretBundle.deletedDate;
      delete (resultObject.properties as any).deletedDate;
    }

    if (attributes) {
      if ((attributes as any).vaultUrl) {
        delete (resultObject.properties as any).vaultUrl;
      }

      if (attributes.expires) {
        delete (resultObject.properties as any).expires;
      }

      if (attributes.created) {
        delete (resultObject.properties as any).created;
      }

      if (attributes.updated) {
        delete (resultObject.properties as any).updated;
      }
    }

    return resultObject;
  }

  /**
   * Creates a span using the tracer that was set by the user
   * @param methodName The name of the method for which the span is being created.
   * @param requestOptions The options for the underlying http request.
   */
  private createSpan(methodName: string, requestOptions: RequestOptionsBase = {}): Span {
    const tracer = getTracer();
    return tracer.startSpan(methodName, requestOptions && requestOptions.spanOptions);
  }

  /**
   * Returns updated HTTP options with the given span as the parent of future spans,
   * if applicable.
   * @param span The span for the current operation
   * @param options The options for the underlying http request
   */
  private setParentSpan(span: Span, options: RequestOptionsBase = {}): RequestOptionsBase {
    if (span.isRecordingEvents()) {
      return {
        ...options,
        spanOptions: {
          ...options.spanOptions,
          parent: span
        }
      };
    } else {
      return options;
    }
  }
}
