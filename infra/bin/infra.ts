#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { IamStack } from '../lib/iam-stack';
import { LambdaStack } from '../lib/lambda-stack';
import { FunctionStack } from '../lib/function-stack';
import { ApiGatewayStack } from '../lib/apigateway-stack';
import { ApiKeyStack } from '../lib/apikey-stack';
import { SsmStack } from '../lib/ssm-stack';

const app = new cdk.App();

// 1️⃣ IAM Stack
const iamStack = new IamStack(app, 'IamStack');

// 2️⃣ Lambda Stack
const lambdaStack = new LambdaStack(app, 'LambdaStack', {
  role: iamStack.lambdaRole,
});

// 3️⃣ Function Stack (logical grouping)
new FunctionStack(app, 'FunctionStack', {
  lambdaFn: lambdaStack.helloLambda,
});

// 4️⃣ API Gateway Stack
const apiGatewayStack = new ApiGatewayStack(app, 'ApiGatewayStack', {
  handler: lambdaStack.helloLambda,
});

// 5️⃣ API Key Stack
new ApiKeyStack(app, 'ApiKeyStack', {
  api: apiGatewayStack.api,
});

// 6️⃣ SSM Stack
new SsmStack(app, 'SsmStack', {
  apiUrl: apiGatewayStack.api.url,
});
