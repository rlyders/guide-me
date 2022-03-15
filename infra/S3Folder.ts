import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
const mime = require('mime');
import * as path from 'path';
import * as fs from "fs";

// Define a component for S3 bucket
export class S3Folder extends pulumi.ComponentResource {

    bucketName: pulumi.Output<String>;
    websiteUrl: pulumi.Output<String>;
    s3Bucket: aws.s3.Bucket;

    constructor(aBucketName: string, args?: aws.s3.BucketArgs, sourceDir?: string, opts?: pulumi.ComponentResourceOptions, resourceType?: string) {
        // Register this component with name lyders:S3Folder
        super(resourceType || "lyders:S3Folder", aBucketName, {}, opts);
        console.log(`Path where files would be uploaded: ${sourceDir}`);

        this.s3Bucket = this.createBucket( aBucketName, args );

        // Create a property for the bucket name that was created
        this.bucketName = this.s3Bucket.bucket;

        if (sourceDir) {
            this.uploadPathToBucket(this.s3Bucket, sourceDir);
        }

        this.bucketName = this.s3Bucket.bucket;
        this.websiteUrl = this.s3Bucket.websiteEndpoint;

        // Register output properties for this component
        this.registerOutputs({
            bucketName: this.bucketName,
            websiteUrl: this.websiteUrl,
        });        
    }
    
    // Create a bucket and expose a website index document
    createBucket(bucketName: string, args?: aws.s3.BucketArgs ) {
        // Create a bucket
        return new aws.s3.Bucket(bucketName,
            args, { parent: this } ); // specify resource parent
    }

    uploadPathToBucket(s3Bucket: aws.s3.Bucket, sourcePath: string, targetFilePrefix = "") {
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

}


module.exports.S3Folder = S3Folder;