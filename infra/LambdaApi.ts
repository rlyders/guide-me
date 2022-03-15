import * as awsx from "@pulumi/awsx";

export class LambdaApi {

    api: awsx.apigateway.API;

    constructor(apiName: string, staticSourcePath: string, staticUrlPath: string, restApiPath: string) {
        // Create a public HTTP endpoint (using AWS APIGateway)
        this.api = new awsx.apigateway.API(apiName, {
            routes: [
                // Serve static files from the `sourcePath` folder (using AWS S3)
                {
                    path: staticUrlPath,
                    localPath: staticSourcePath,
                },

                // Serve a simple REST API on `GET /restApiPath` (using AWS Lambda)
                {
                    path: restApiPath,
                    method: "GET",
                    eventHandler: (req, ctx, cb) => {
                        const body = JSON.stringify({ name: "AWS" });
                        cb(undefined, {
                            statusCode: 200,
                            body: Buffer.from(body, "utf8").toString("base64"),
                            isBase64Encoded: true,
                            headers: { "content-type": "application/json" },
                        });
                    },
                },
            ],
        });
    }

}