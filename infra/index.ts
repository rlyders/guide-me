import { S3Folder } from "./S3Folder";
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const STACK = pulumi.getStack();

const GUIDES_BUCKET_NAME = "guide-me-guides";
const NODE_VER_X = "nodejs14.x";

// Create an instance of the S3Folder component
let s3GuidesFolder = new S3Folder(GUIDES_BUCKET_NAME, {
    bucket: `${GUIDES_BUCKET_NAME}-${STACK}`
}, "../src/data/guides");

//from: https://medium.com/@adamboazbecker/guide-to-connecting-aws-lambda-to-s3-with-pulumi-15393df8bac7
const lambdaRole = new aws.iam.Role(`role-payloads-api`, {
    assumeRolePolicy: `{
     "Version": "2012-10-17",
     "Statement": [
       {
         "Action": "sts:AssumeRole",
         "Principal": {
           "Service": "lambda.amazonaws.com"
         },
         "Effect": "Allow"
       }
     ]
   }
   `,
})

// Policy for allowing Lambda to interact with S3
const lambdaS3Policy = new aws.iam.Policy(`post-to-s3-policy`, {
    description: "IAM policy for Lambda to interact with S3",
    path: "/",
    policy: s3GuidesFolder.s3Bucket.arn.apply(bucketArn => `{
     "Version": "2012-10-17",
     "Statement": [
       {
         "Action": "s3:PutObject",
         "Resource": "${bucketArn}/*",
         "Effect": "Allow"
       }
     ]}`)
})

// Attach the policies to the Lambda role
new aws.iam.RolePolicyAttachment(`post-to-s3-policy-attachment`, {
    policyArn: lambdaS3Policy.arn,
    role: lambdaRole.name
})

//from: https://medium.com/@adamboazbecker/guide-to-connecting-aws-lambda-to-s3-with-pulumi-15393df8bac7
const guidesLambdaRole = new aws.iam.Role(`role-guides-api`, {
    assumeRolePolicy: `{
     "Version": "2012-10-17",
     "Statement": [
       {
         "Action": "sts:AssumeRole",
         "Principal": {
           "Service": "lambda.amazonaws.com"
         },
         "Effect": "Allow"
       }
     ]
   }
   `,
})

// Policy for allowing reading Guides in S3 bucket
const guidesS3ReadPolicy = new aws.iam.Policy(`guides-s3-read-policy`, {
    description: "IAM policy for reading Guides in S3 bucket",
    path: "/",
    policy: s3GuidesFolder.s3Bucket.arn.apply(bucketArn => `{
     "Version": "2012-10-17",
     "Statement": [
      {
        "Action": "s3:ListBucket",
        "Resource": "${bucketArn}",
        "Effect": "Allow"
      },
      {
         "Action": "s3:GetObject",
         "Resource": "${bucketArn}/*",
         "Effect": "Allow"
       },
       {
          "Action": "s3:PutObject",
          "Resource": "${bucketArn}/guide-me-guides.json",
          "Effect": "Allow"
        }
     ]}`)
})

// Attach the policies to the Lambda Guides role
new aws.iam.RolePolicyAttachment(`lambda-guides-s3-policy-attachment`, {
    policyArn: guidesS3ReadPolicy.arn,
    role: guidesLambdaRole.name
})

// Attach the policies to the Lambda Guides role
new aws.iam.RolePolicyAttachment(`lambda-guides-s3-policy-attachment-cloudWatch`, {
    policyArn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
    role: guidesLambdaRole.name
})

const lambdaFunction = async (event: any) => {
    const AWS = require('aws-sdk')
    const s3 = new AWS.S3()
    // decode the body of the event
    const payloadBuffer = new Buffer(event.body, 'base64')
    const payload = payloadBuffer.toString('ascii')
    const putParams = {
        Bucket: process.env.S3_BUCKET, // We'll read the .env variable
        Key: `${new Date().getTime()}.json`, // We'll use the timestamp
        Body: payload
    }

    await new Promise((resolve, reject) => {
        s3.putObject(putParams, function (err: any, data: any) {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
    return {
        statusCode: 200,
        body: "Success"
    }
}

const lambdaPostToS3 = new aws.lambda.CallbackFunction(`payloads-api-meetup-lambda`, {
    name: `payloads-api-meetup-lambda-${STACK}`,
    runtime: NODE_VER_X,
    role: lambdaRole,
    callback: lambdaFunction,
    environment: {
        variables: {
            S3_BUCKET: s3GuidesFolder.s3Bucket.id
        }
    },
})

//from: https://stackoverflow.com/a/63081760
export async function s3GetObjectList(
    s3client: AWS.S3,
    bucket: string,
    prefix: string,
): Promise<AWS.S3.ObjectList> {
    let token: string | undefined = undefined;
    let objectList: AWS.S3.ObjectList = [];
    do {
        const res: any = await s3client
            .listObjectsV2({
                Prefix: prefix,
                Bucket: bucket,
                ContinuationToken: token,
            })
            .promise();
        token = res.NextContinuationToken;
        objectList = objectList.concat(res.Contents);
    } while (token !== undefined);
    return objectList;
}

interface GuideHeader {
    key: string;
    title: string;
}

const lambdaGuideTitlesFunction = async (event: any) => {
    console.log("lambdaGuideTitlesFunction: event=" + JSON.stringify(event));
    const AWS = require('aws-sdk')
    const YAML = require('yamljs');
    const s3 = new AWS.S3()
    let guideHeaderList: GuideHeader[] = [];

    let recreateGuideMeGuideList = containsYamlChangedRecord(event) || containsGuideMeGuidesDeletedRecord(event);

    if (process.env.S3_BUCKET) {
        const s3ObjectList: AWS.S3.ObjectList = await s3GetObjectList(s3, process.env.S3_BUCKET, "");
        if (s3ObjectList && s3ObjectList.length > 0) {
            const guideMeGuidesList = s3ObjectList.filter(obj => obj.Key && isGuideMeGuideJsonFileName(obj.Key));
            const guideMeGuidesAttrs = guideMeGuidesList && guideMeGuidesList.length > 0 && guideMeGuidesList[0] ? guideMeGuidesList[0] : null;
            const guideMeGuidesLastModified = guideMeGuidesAttrs ? guideMeGuidesAttrs.LastModified : null;
            const yamlObjectList = s3ObjectList.filter(o => o.Key && isYamlFileName(o.Key));
            const yamlObjectsLastModified = new Date(Math.min(...(yamlObjectList.map(o => o.LastModified?.getTime() || 0))));
            recreateGuideMeGuideList = recreateGuideMeGuideList
                || !guideMeGuidesLastModified
                || ((yamlObjectsLastModified || guideMeGuidesLastModified) > guideMeGuidesLastModified)
                || (yamlObjectList.length == 0 && (guideMeGuidesAttrs?.Size || 0) > 2);

            if (recreateGuideMeGuideList) {
                const yamlObjectIdList = yamlObjectList.map(o => o.Key);
                for (const idx in yamlObjectIdList) {
                    const s3ObjectKey = yamlObjectIdList[idx];
                    if (s3ObjectKey) {
                        const s3GetObjectData = await s3.getObject({ Bucket: process.env.S3_BUCKET, Key: s3ObjectKey }).promise();
                        if (s3GetObjectData && s3GetObjectData.Body) {
                            const guideContentsStr = s3GetObjectData.Body.toString('utf-8');
                            if (guideContentsStr) {
                                try {
                                    const guideContentsObj = YAML.parse(guideContentsStr);
                                    if (guideContentsObj && guideContentsObj.title) {
                                        guideHeaderList.push({ key: s3ObjectKey, title: guideContentsObj.title });
                                    }

                                } catch (err) {
                                    console.log("guideContentsStr: " + guideContentsStr);
                                    console.log("Failed to convert string to JSON: " + err);
                                }
                            }
                        }
                    }
                }
                console.log("saving new guide-me-guides.json...");
                const putParams = {
                    Bucket: process.env.S3_BUCKET, // We'll read the .env variable
                    Key: `guide-me-guides.json`, // We'll use the timestamp
                    Body: JSON.stringify(guideHeaderList)
                }

                await new Promise((resolve, reject) => {
                    s3.putObject(putParams, function (err: any, data: any) {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(data)
                        }
                    })
                })
            } else {
                console.log("get existing guide-me-guides.json...");
                const guideMeGuidesObject = await s3.getObject({ Bucket: process.env.S3_BUCKET, Key: 'guide-me-guides.json' }).promise();
                if (guideMeGuidesObject && guideMeGuidesObject.Body) {
                    const guideMeGuidesContentsStr = guideMeGuidesObject.Body.toString('utf-8');
                    if (guideMeGuidesContentsStr) {
                        try {
                            guideHeaderList = JSON.parse(guideMeGuidesContentsStr);
                        } catch (err) {
                            console.log("guideMeGuidesContentsStr: " + guideMeGuidesContentsStr);
                            console.log("Failed to convert string to JSON: " + err);
                        }
                    }
                }
            }
        }
    }
    return {
        statusCode: 200,
        body: JSON.stringify(guideHeaderList)
    }
}

const lambdaGetGuideNames = new aws.lambda.CallbackFunction(`get-guide-names-lambda`, {
    name: `get-guide-names-lambda-${STACK}`,
    runtime: NODE_VER_X,
    role: guidesLambdaRole,
    callback: lambdaGuideTitlesFunction,
    environment: {
        variables: {
            S3_BUCKET: s3GuidesFolder.s3Bucket.id
        }
    },
})

// Create an AWS Cognito User Pool
const cognitoUserPool = new aws.cognito.UserPool("guide-me-cognito-user-pool", {autoVerifiedAttributes: ["email"]});

const userPoolClient = new aws.cognito.UserPoolClient("userPoolClient", {
    allowedOauthFlows: ["code"],
    allowedOauthFlowsUserPoolClient: true,
    allowedOauthScopes: ["phone", "email", "openid", "profile", "aws.cognito.signin.user.admin"],
    callbackUrls: ["http://localhost:3000", "https://product.app"],
    defaultRedirectUri: "https://product.app",
    generateSecret: false,
    logoutUrls: ["http://localhost:3000", "https://product.app"],
    supportedIdentityProviders: ["COGNITO", "Google"], // , "Facebook"
    userPoolId: cognitoUserPool.id,
});

const userPoolDomain = new aws.cognito.UserPoolDomain("guide-me-userPoolDomain", {
    domain: "lyders-guide-me",
    userPoolId: cognitoUserPool.id,
});

const cognitoUserPoolProvider = new aws.cognito.IdentityProvider("guide-me-cognito-user-provider", {
    userPoolId: cognitoUserPool.id,
    providerName: "Google",
    providerType: "Google",
    providerDetails: {
        authorize_scopes: "profile email openid",
        client_id: "141202488786-q92quaf81a7hv4t1n05s90cu9kkrgol8.apps.googleusercontent.com",
        client_secret: "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",
    },
    attributeMapping: {
        email: "email",
        username: "sub",
    },
});

// from: https://github.com/pulumi/pulumi-aws/issues/679
const identityPool = new aws.cognito.IdentityPool("identityPool", {
    allowUnauthenticatedIdentities: true,
    cognitoIdentityProviders: cognitoUserPool.endpoint.apply(endpoint => [{
            client_id: userPoolClient.id,
            providerName: endpoint,
            serverSideTokenCheck: true,
        }]
    ),
    identityPoolName: "identityPool",
});

//from: https://github.com/pulumi/pulumi-aws/issues/679
const identityPoolAuthenticatedRole = new aws.iam.Role("identityPoolAuthenticatedRole", {
    assumeRolePolicy: identityPool.id.apply(id => JSON.stringify({
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Federated": "cognito-identity.amazonaws.com"
                },
                "Action": "sts:AssumeRoleWithWebIdentity",
                "Condition": {
                    "StringEquals": {
                        "cognito-identity.amazonaws.com:aud": id
                    },
                    "ForAnyValue:StringLike": {
                        "cognito-identity.amazonaws.com:amr": "authenticated"
                    }
                }
            }
        ]
    })),
});

const identityPoolAuthenticatedRolePolicy = new aws.iam.RolePolicy("identityPoolAuthenticatedRolePolicy", {
    policy: JSON.stringify({
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "mobileanalytics:PutEvents",
                    "cognito-sync:*",
                    "cognito-identity:*"
                ],
                "Resource": [
                    "*"
                ]
            }
        ]
    }),
    role: identityPoolAuthenticatedRole.id,
});

const identityPoolUnauthenticatedRole = new aws.iam.Role("identityPoolUnauthenticatedRole", {
    assumeRolePolicy: identityPool.id.apply(id => JSON.stringify({
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Federated": "cognito-identity.amazonaws.com"
                },
                "Action": "sts:AssumeRoleWithWebIdentity",
                "Condition": {
                    "StringEquals": {
                        "cognito-identity.amazonaws.com:aud": id
                    },
                    "ForAnyValue:StringLike": {
                        "cognito-identity.amazonaws.com:amr": "unauthenticated"
                    }
                }
            }
        ]
    })),
});

const identityPoolUnauthenticatedRolePolicy = new aws.iam.RolePolicy("identityPoolUnauthenticatedRolePolicy", {
    policy: JSON.stringify({
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "mobileanalytics:PutEvents",
                    "cognito-sync:*",
                ],
                "Resource": [
                    "*"
                ]
            }
        ]
    }),
    role: identityPoolUnauthenticatedRole.id,
});

const identityPoolRoleAttachment = new aws.cognito.IdentityPoolRoleAttachment("identityPoolRoleAttachment", {
    identityPoolId: identityPool.id,
    roles: {
        authenticated: identityPoolAuthenticatedRole.arn,
        unauthenticated: identityPoolUnauthenticatedRole.arn,
    },
});

// create API
let apiGateway = new awsx.apigateway.API(`payloads-api-meetup-api-gateway`, {
    routes: [
        {
            path: "/post_to_s3",
            method: "POST",
            eventHandler: lambdaPostToS3,
            authorizers: [awsx.apigateway.getCognitoAuthorizer({
                providerARNs: [cognitoUserPool],
            })],
        },
        {
            path: "/get-guide-names",
            method: "GET",
            eventHandler: lambdaGetGuideNames,
            authorizers: [awsx.apigateway.getCognitoAuthorizer({
                providerARNs: [cognitoUserPool],
            })],
        }
    ]
})

function containsGuideMeGuidesDeletedRecord(event: any) {
    return event?.Records?.filter((r: any) => {
        return isEventObjectRemoved(r) && isGuideMeGuideJsonFileName(r?.s3?.object?.key);
    }).length > 0;
}

function isEventObjectRemoved(r: any) {
    return r?.eventName == 'ObjectRemoved:Delete';
}

function isGuideMeGuideJsonFileName(fileName: string) {
    return /^guide-me-guides\.json$/i.test(fileName);
}

function containsYamlChangedRecord(event: any) {
    return event?.Records?.filter((r: any) => isYamlFileName(r?.s3?.object?.key)).length > 0;
}

function isYamlFileName(fileName: string) {
    return /(^.*\.yaml$)/i.test(fileName);
}

s3GuidesFolder.s3Bucket.onObjectCreated("guideCreatedHandler", lambdaGetGuideNames);
s3GuidesFolder.s3Bucket.onObjectRemoved("guideDeletedHandler", lambdaGetGuideNames);

// Export output property of `s3GuidesFolder` as a stack output
exports.s3GuidesBucket = s3GuidesFolder.s3Bucket.id;
exports.apiGateway = apiGateway.url
