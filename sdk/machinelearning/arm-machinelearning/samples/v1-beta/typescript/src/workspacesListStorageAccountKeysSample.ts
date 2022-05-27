/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { AzureMachineLearningWorkspaces } from "@azure/arm-machinelearning";
import { DefaultAzureCredential } from "@azure/identity";

/**
 * This sample demonstrates how to List storage account keys of a workspace.
 *
 * @summary List storage account keys of a workspace.
 * x-ms-original-file: specification/machinelearningservices/resource-manager/Microsoft.MachineLearningServices/preview/2022-02-01-preview/examples/Workspace/listStorageAccountKeys.json
 */
async function listWorkspaceKeys() {
  const subscriptionId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
  const resourceGroupName = "testrg123";
  const workspaceName = "workspaces123";
  const credential = new DefaultAzureCredential();
  const client = new AzureMachineLearningWorkspaces(credential, subscriptionId);
  const result = await client.workspaces.listStorageAccountKeys(
    resourceGroupName,
    workspaceName
  );
  console.log(result);
}

listWorkspaceKeys().catch(console.error);
