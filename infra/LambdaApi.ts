import { EventHandler } from "@pulumi/aws/lambda";
import * as awsx from "@pulumi/awsx";

export class LambdaApi {

    api: awsx.apigateway.API;

    constructor(apiName: string, staticSourcePath: string, staticUrlPath: string, lambdaHandlers: any[]) {
        // Create a public HTTP endpoint (using AWS APIGateway)
        this.api = new awsx.apigateway.API(apiName, {
            routes: [
                // Serve static files from the `sourcePath` folder (using AWS S3)
                {
                    path: staticUrlPath,
                    localPath: staticSourcePath,
                },
                ...lambdaHandlers,
            ],
        });
    }

}
