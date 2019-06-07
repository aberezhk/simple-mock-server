"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const minimatch = require("minimatch");
// try first to find exact url + params + method match, if not find, try to search by regexp
function findWsMessage(message) {
    return __awaiter(this, void 0, void 0, function* () {
        let element = server_1.mockConfiguration.filter((element) => {
            return ((element.method === "WS") && (element.message === message));
        })[0];
        if (element) {
            return element;
        }
        else {
            element = server_1.mockConfiguration.filter((element) => {
                return ((element.method === "WS") && minimatch(message, element.message));
            })[0];
        }
        if (element && element.delay) {
            yield new Promise(resolve => setTimeout(resolve, element.delay));
        }
        return element;
    });
}
exports.findWsMessage = findWsMessage;
//# sourceMappingURL=ws-middleware.js.map