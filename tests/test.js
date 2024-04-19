import {HashTree} from "../src/hashTree.mjs";
import { generateProofForHash } from "../src/generateProof.mjs";
import { hashFunction ,getCharCodes} from "../src/hashFunction.mjs";

import * as snarkjs from "snarkjs";
import fs from "fs";
import { verifyProof } from "../src/verifyProof.mjs";


const main = async() => {
    const htree = new HashTree(hashFunction,32,hashFunction([0]),2,["apple","banana","pear"]);
    htree.insertHashAtIndex(hashFunction(["avocado"]),3);
    htree.insertHashAtIndex(hashFunction(["watermelon"]),4);
    htree.insertHashAtIndex(hashFunction(["grape"]),5);
    htree.insertHashAtIndex(hashFunction(["orange"]),6);
    htree.insertHashAtIndex(hashFunction(["raspberries"]),12001);
    const rawProof = generateProofForHash(htree,hashFunction(["raspberries"]));

 
    const inputs = {
        sk:getCharCodes("raspberries"),
        siblingsPk:rawProof.siblings.flat(),
        path:rawProof.path,
        root:htree.getRoot()
    };
    
    const { proof, publicSignals } = await snarkjs.plonk.fullProve(inputs,"../circuits/build/HashTreeProof_js/HashTreeProof.wasm","../circuits/keys/HashTreeProof_PK.zkey");

    const vKey = JSON.parse(fs.readFileSync("../circuits/keys/HashTreeProof_VK.json"));

    const res = await snarkjs.plonk.verify(vKey,publicSignals,proof);

    console.log(res);

    
}

main().then(()=>{
    process.exit(0); 
});