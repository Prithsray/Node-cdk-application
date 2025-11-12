import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';

interface ApiGatewayStackProps extends cdk.StackProps {
  handler: lambda.IFunction;
}

export class ApiGatewayStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
    super(scope, id, props);

    this.api = new apigateway.LambdaRestApi(this, 'FreeTierApi', {
      handler: props.handler,
      description: 'Free-tier API Gateway linked to Lambda',
      proxy: true,
      deployOptions: {
        stageName: 'prod',
        throttlingRateLimit: 5,
        throttlingBurstLimit: 2,
      },
      cloudWatchRole: false,
    });

    // ✅ explicitly ensure removal with stack
    this.api.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.url ?? 'N/A',
    });
  }
}
