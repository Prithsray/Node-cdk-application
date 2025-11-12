import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

interface FunctionStackProps extends cdk.StackProps {
  lambdaFn: lambda.IFunction;
}

export class FunctionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: FunctionStackProps) {
    super(scope, id, props);

    cdk.Tags.of(props.lambdaFn).add('FreeTier', 'true');
  }
}
