import { hashFunction } from "./hashFunction.mjs";

function generateNullifier(secretKey,hashTreeID,nullifierTreeID){
    return hashFunction([secretKey,hashTreeID,nullifierTreeID]);
}

function checkNullifier(nullifier,secretKey,hashTreeID,nullifierTreeID){
    return nullifier === generateNullifier(secretKey,hashTreeID,nullifierTreeID);
}

export {generateNullifier,checkNullifier};