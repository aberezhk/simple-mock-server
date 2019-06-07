import {MockedRequest} from "./models/mocked-request";
import {mockConfiguration} from './server'
import * as minimatch from 'minimatch';
// try first to find exact url + params + method match, if not find, try to search by regexp
export async function findWsMessage(message: string) {
    let element = mockConfiguration.filter( (element: MockedRequest) => {
        return ((element.method === "WS") && (element.message === message));
    })[0];
    if (element){
        return element;
    } else {
        element = mockConfiguration.filter( (element: MockedRequest) => {
            return ((element.method === "WS") && minimatch(message, element.message as string));
        })[0];
    }
    if (element && element.delay) {
        await new Promise(resolve => setTimeout(resolve, element.delay));
    }
    return element
}
