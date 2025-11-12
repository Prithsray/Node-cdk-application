import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';

export class IamStack extends cdk.Stack {
  public readonly lambdaRole: iam.Role;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ✅ Lambda Execution Role
    this.lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
      description: 'Free-tier minimal Lambda execution role',
    });

    this.lambdaRole.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    // ✅ Role for GitHub Actions CDK Deploy
    const githubDeployRole = new iam.Role(this, 'GitHubCdkDeployRole', {
      roleName: 'GitHubCdkDeployRole',
      description: 'Allows GitHub Actions to deploy CDK stacks using OIDC',
      assumedBy: new iam.WebIdentityPrincipal(
        'token.actions.githubusercontent.com',
        {
          StringEquals: {
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
            // Change 'your-username/your-repo' below
            'token.actions.githubusercontent.com:sub': 'repo:Prithsray/Node-cdk-application:ref:refs/heads/main',
          },
        }
      ),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'),
      ],
    });

    githubDeployRole.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
  }
}
