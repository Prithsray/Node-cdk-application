import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

interface ApiKeyStackProps extends cdk.StackProps {
  api: apigateway.RestApi;
}

export class ApiKeyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiKeyStackProps) {
    super(scope, id, props);

    const plan = props.api.addUsagePlan('BasicUsagePlan', {
      name: 'FreeTierUsagePlan',
      throttle: {
        rateLimit: 5,
        burstLimit: 2,
      },
      quota: {
        limit: 10000,
        period: apigateway.Period.MONTH,
      },
    });

    const apiKey = props.api.addApiKey('FreeTierApiKey', {
      apiKeyName: 'FreeTierKey',
      description: 'API Key limited for Free Tier usage',
    });

    plan.addApiKey(apiKey);
    plan.addApiStage({
      stage: props.api.deploymentStage,
    });

    // ✅ apply removal to both
    plan.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
    apiKey.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
  }
}
