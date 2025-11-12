import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ssm from 'aws-cdk-lib/aws-ssm';

interface SsmStackProps extends cdk.StackProps {
  apiUrl: string;
}

export class SsmStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SsmStackProps) {
    super(scope, id, props);

    const apiParam = new ssm.StringParameter(this, 'FreeTierApiUrlParam', {
      parameterName: '/free-tier/api/url',
      stringValue: props.apiUrl,
      tier: ssm.ParameterTier.STANDARD,
    });

    // ✅ delete SSM param when stack is destroyed
    apiParam.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
  }
}
