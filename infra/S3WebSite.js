"use strict";

const aws = require("@pulumi/aws");
const pulumi = require("@pulumi/pulumi");
const mime = require("mime");
const path = require('path');
const fs = require("fs");

// Define a component for serving a static website on S3
class S3WebSite extends pulumi.ComponentResource {

    constructor(bucketName, siteDir, opts) {
        // Register this component with name examples:S3Folder
        super("lyders:S3WebSite", bucketName, {}, opts);
        console.log(`Path where files would be uploaded: ${siteDir}`);

        // Create a bucket and expose a website index document
        let siteBucket = new aws.s3.Bucket(bucketName, {
            website: {
                indexDocument: "index.html",
            },
        }, { parent: this } ); // specify resource parent

        // Create a property for the bucket name that was created
        this.bucketName = siteBucket.bucket;

        this.uploadPathToBucket(siteBucket, siteDir);

        // Set the access policy for the bucket so all objects are readable
        let bucketPolicy = new aws.s3.BucketPolicy("bucketPolicy", {
            bucket: siteBucket.bucket,
            policy: siteBucket.bucket.apply(this.publicReadPolicyForBucket),
        }, { parent: this }); // specify resource parent

        this.bucketName = siteBucket.bucket;
        this.websiteUrl = siteBucket.websiteEndpoint;

        // Register output properties for this component
        this.registerOutputs({
            bucketName: this.bucketName,
            websiteUrl: this.websiteUrl,
        });        
    }

    uploadPathToBucket(s3Bucket, sourcePath, targetFilePrefix = "") {
        // For each file in the directory, create an S3 object stored in s3Bucket
        for (let dirEnt of fs.readdirSync(sourcePath, { withFileTypes: true })) {
            console.log(`targetFilePrefix: ${targetFilePrefix}`);
            let sourceFilePath = path.join(sourcePath, dirEnt.name);
            let targetPath = [targetFilePrefix,dirEnt.name].filter(n => n).join('/');
            if (dirEnt.isDirectory()) {
                this.uploadPathToBucket(s3Bucket, sourceFilePath, targetPath);
            } else {
                let object = new aws.s3.BucketObject(targetPath, {
                bucket: s3Bucket,
                source: new pulumi.asset.FileAsset(sourceFilePath),     // use FileAsset to point to a file
                contentType: mime.getType(sourceFilePath) || undefined, // set the MIME type of the file
                }, { parent: this } ); // specify resource parent
            }
        }
    }

    publicReadPolicyForBucket(bucketName) {
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