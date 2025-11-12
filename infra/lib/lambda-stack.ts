import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';

interface LambdaStackProps extends cdk.StackProps {
  role: iam.IRole;
}

export class LambdaStack extends cdk.Stack {
  public readonly helloLambda: lambda.Function;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    this.helloLambda = new lambda.Function(this, 'HelloLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../service/hello'),
      role: props.role,
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
      environment: {
        APP_NAME: 'FreeTierCDKApp',
      },
    });

    // ✅ ensures Lambda deletes with stack
    this.helloLambda.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
  }
}
