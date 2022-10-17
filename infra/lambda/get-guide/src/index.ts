const AWS = require('aws-sdk')
const YAML = require('yamljs');
import { UserChoice } from './UserChoice';

//lambdaFunctionGetGuide
exports.handler = async (event: any, context: any) => {
    const s3 = new AWS.S3()
    const guideKey = event.pathParameters.guideKey;
    let stepKey = event.pathParameters.stepKey;
    const reqBody = event.body;
    console.log('lambdaFunctionGetGuide: reqBody='+reqBody);
    console.log('lambdaFunctionGetGuide: guideKey='+guideKey);
    console.log('lambdaFunctionGetGuide: stepKey='+stepKey);
    const getParams = {
        Bucket: process.env.S3_BUCKET,
        Key: guideKey
    }

    console.log('lambdaFunctionGetGuide: getParams='+JSON.stringify(getParams));
    const s3ObjectResponse = await s3.getObject(getParams).promise();
    const guideData = YAML.parse(s3ObjectResponse.Body.toString('utf-8'));
    if (!stepKey) {
        stepKey = Object.keys(guideData).find(
            (k) => k !== "title"
        );
        console.log('stepKey: '+stepKey);
    }
    let stepData = guideData[stepKey];
    stepData["guideKey"] = guideKey;
    stepData["title"] = guideData["title"];
    stepData["stepKey"] = stepKey;

    let userChoices = reqBody["userChoices"];
    if (!userChoices) {
        userChoices = [new UserChoice({path: `/${stepKey}`, stepKey: stepKey})];
    }

    const jsonStr = JSON.stringify(stepData, null, 2);
    console.log('lambdaFunctionGetGuide: jsonStr='+jsonStr);
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers" : "Origin, X-Requested-With, Content-Type, Accept, Authorization",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT"
        },
        body: jsonStr
    }
}
