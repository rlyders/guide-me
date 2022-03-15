import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { S3Folder } from "./S3Folder";

// Define a component for serving a static website on S3
export class S3WebSite extends S3Folder {

    constructor(aBucketName: string, args?: aws.s3.BucketArgs, sourceDir?: string, opts?: pulumi.ComponentResourceOptions) {
        // Register this component with name examples:S3Folder
        super( aBucketName, {...args, website: { indexDocument: "index.html" }}, sourceDir, opts, "lyders:S3Website");

        // Set the access policy for the bucket so all objects are readable
        let bucketPolicy = new aws.s3.BucketPolicy("bucketPolicy", {
            bucket: this.s3Bucket.bucket,
            policy: this.s3Bucket.bucket.apply(this.publicReadPolicyForBucket),
        }, { parent: this }); // specify resource parent

    }

    publicReadPolicyForBucket(bucketName: string) {
        return JSON.stringify({
            Version: "2012-10-17",
            Statement: [{
                Effect: "Allow",
                Principal: "*",
                Action: [
                    "s3:GetObject"
                ],
                Resource: [
                    `arn:aws:s3:::${bucketName}/*` // policy refers to bucket name explicitly
                ]
            }]
        });
    }

}


module.exports.S3WebSite = S3WebSite;