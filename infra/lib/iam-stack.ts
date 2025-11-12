import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";

export class IamStack extends cdk.Stack {
  public readonly lambdaRole: iam.Role;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * ✅ 1️⃣ Lambda Execution Role
     * Minimal permissions for Lambda logs
     */
    this.lambdaRole = new iam.Role(this, "LambdaExecutionRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      description: "Minimal Lambda execution role for free-tier usage",
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
    });

    this.lambdaRole.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    /**
     * ✅ 2️⃣ Reference the existing GitHub OIDC Provider
     * (Pre-created manually in your AWS account)
     */
    const existingOidcProviderArn =
      "arn:aws:iam::320765978526:oidc-provider/token.actions.githubusercontent.com";

    const oidcProvider = iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
      this,
      "ExistingGitHubOIDCProvider",
      existingOidcProviderArn
    );

    /**
     * ✅ 3️⃣ Create the GitHub Actions Deployment Role
     * This role allows GitHub Actions to deploy CDK stacks via OIDC.
     */
    const githubDeployRole = new iam.Role(this, "GitHubCdkDeployRole", {
      roleName: "GitHubCdkDeployRole",
      description: "Allows GitHub Actions to deploy CDK stacks using OIDC",
      assumedBy: new iam.WebIdentityPrincipal(
        oidcProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
            // 🔹 Ensure repo + branch match your workflow
            "token.actions.githubusercontent.com:sub":
              "repo:Prithsray/Node-cdk-application:ref:refs/heads/main",
          },
        }
      ),
      managedPolicies: [
        // ⚠️ Temporary: AdministratorAccess (bootstrap)
        iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"),
      ],
    });

    githubDeployRole.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    /**
     * ✅ 4️⃣ Output for reference
     */
    new cdk.CfnOutput(this, "GitHubCdkDeployRoleArn", {
      value: githubDeployRole.roleArn,
      description: "ARN of the GitHub OIDC CDK deploy role",
    });

    new cdk.CfnOutput(this, "LambdaExecutionRoleArn", {
      value: this.lambdaRole.roleArn,
      description: "ARN of the Lambda execution role",
    });
  }
}
