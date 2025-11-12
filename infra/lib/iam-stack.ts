import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";

export class IamStack extends cdk.Stack {
  public readonly lambdaRole: iam.Role;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1️⃣ Minimal Lambda role
    this.lambdaRole = new iam.Role(this, "LambdaExecutionRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
      description: "Lambda execution role (free-tier minimal)",
    });

    this.lambdaRole.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    // 2️⃣ Create GitHub OIDC identity provider (if not already existing)
    const oidcProvider = new iam.OpenIdConnectProvider(this, "GitHubOIDCProvider", {
      url: "https://token.actions.githubusercontent.com",
      clientIds: ["sts.amazonaws.com"],
      thumbprints: ["6938fd4d98bab03faadb97b34396831e3780aea1"],
    });

    // 3️⃣ Create GitHub Actions deploy role
    const githubDeployRole = new iam.Role(this, "GitHubCdkDeployRole", {
      roleName: "GitHubCdkDeployRole",
      description: "Allows GitHub Actions to deploy CDK stacks via OIDC",
      assumedBy: new iam.WebIdentityPrincipal(oidcProvider.openIdConnectProviderArn, {
        StringEquals: {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub":
            "repo:Prithsray/Node-cdk-application:ref:refs/heads/main",
        },
      }),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"),
      ],
    });

    githubDeployRole.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    new cdk.CfnOutput(this, "GitHubRoleArn", {
      value: githubDeployRole.roleArn,
      description: "ARN of GitHub Actions OIDC deploy role",
    });
  }
}
