import { S3Folder } from "./S3Folder";
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

// import { LambdaApi } from "./LambdaApi";
// import { S3Client, GetObjectCommand, ListObjectsCommand, ListObjectsCommandOutput, GetObjectCommandOutput } from "@aws-sdk/client-s3"
// import { Readable } from 'stream';

const STACK = pulumi.getStack();

const GUIDES_BUCKET_NAME = "guide-me-guides";
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

const lambda = new aws.lambda.CallbackFunction(`payloads-api-meetup-lambda`, {
    name: `payloads-api-meetup-lambda-${STACK}`,
    runtime: "nodejs14.x",
    role: lambdaRole,
    callback: lambdaFunction,
    environment: {
        variables: {
            S3_BUCKET: s3GuidesFolder.s3Bucket.id
        }
    },
})

// create API
let apiGateway = new awsx.apigateway.API(`payloads-api-meetup-api-gateway`, {
    routes: [
        {
            path: "/post_to_s3",
            method: "POST",
            eventHandler: lambda
        }
    ]
})

// const lambdaHandlers: any[] = [];
// lambdaHandlers.push({
//     path: "/guide-names",
//     method: "GET",
//     eventHandler: new pulumi.asset.FileArchive("./folder")
// });
// let lambdaApi = new LambdaApi("guide-me", "../public", "/", lambdaHandlers);

// Export output property of `s3GuidesFolder` as a stack output
exports.s3GuidesBucket = s3GuidesFolder.s3Bucket.id;
exports.apiGateway = apiGateway.url
