import { S3WebSite } from "./S3WebSite";
import { S3Folder } from "./S3Folder";
import { LambdaApi } from "./LambdaApi";

// Create an instance of the S3Folder component
let s3Website = new S3WebSite("guide-me", {}, "../public");
let s3GuidesFolder = new S3Folder("guide-me-guides", {}, "../src/data/guides");
let lambdaApi = new LambdaApi("guide-me");

// Export output property of `s3Website` as a stack output
exports.websiteUrl = s3Website.websiteUrl;
// Export output property of `s3GuidesFolder` as a stack output
exports.s3GuidesBucket = s3GuidesFolder.bucketName;
exports.apiUrl = lambdaApi.api.url;

