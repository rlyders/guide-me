const S3WebSite = require("./S3WebSite.js");

// Create an instance of the S3Folder component
let folder = new S3WebSite.S3WebSite("guide-me", "../public");

// Export output property of `folder` as a stack output
exports.bucketName = folder.bucketName;
exports.websiteUrl = folder.websiteUrl;
