import * as awsx from "@pulumi/awsx";

export class LambdaApi {

    api: awsx.apigateway.API;

    constructor(apiName: string) {
        // Create a public HTTP endpoint (using AWS APIGateway)
        this.api = new awsx.apigateway.API(apiName, {
            routes: [
                // Serve static files from the `www` folder (using AWS S3)
                {
                    path: "/",
                    localPath: "../public",
                },

                // Serve a simple REST API on `GET /name` (using AWS Lambda)
                {
                    path: "/source",
                    method: "GET",
                    eventHandler: (req, ctx, cb) => {
                        cb(undefined, {
                            statusCode: 200,
                            body: Buffer.from(JSON.stringify({ name: "AWS" }), "utf8").toString("base64"),
                            isBase64Encoded: true,
                            headers: { "content-type": "application/json" },
                        });
                    },
                },
            ],
        });
    }

}