import {HashTree} from "../src/hashTree.mjs";
import {NullifierTree} from "../src/nullifierTree.mjs";
import { generateProofForHash } from "../src/generateProof.mjs";
import { hashFunction,getCharCodes } from "../src/hashFunction.mjs";
import { verifyProof } from "../src/verifyProof.mjs";
import { generateNullifier,checkNullifier } from "../src/NullifierProof.mjs";
import { generateNullifierTreeProofForHash } from "../src/generateNullifierTreeProof.mjs";
import * as snarkjs from "snarkjs";
import fs from "fs";



const main = async() => {
    const htree = new HashTree(hashFunction,16,hashFunction([0]),2,[
        hashFunction(["apple"]),
        hashFunction(["banana"]),
        hashFunction(["pear"])], 120);
    htree.insertHashAtIndex(hashFunction(["avocado"]),3);
    htree.insertHashAtIndex(hashFunction(["watermelon"]),4);
    htree.insertHashAtIndex(hashFunction(["grape"]),5);
    htree.insertHashAtIndex(hashFunction(["orange"]),6);
    htree.insertHashAtIndex(hashFunction(["raspberries"]),12001);

    const nullTree = new NullifierTree(hashFunction,16, 199);


    const secret_key = "raspberries";
    const rawProof = generateProofForHash(htree,hashFunction([secret_key]));

    console.log(`Verified Proof of membership generated : ${verifyProof(rawProof)}`);


    const nullifier = generateNullifier(secret_key,htree.getTreeID(),nullTree.getTreeID());
    console.log(`Generated nullifier for node tree ${htree.getTreeID()} and nullifier tree ${nullTree.getTreeID()} \n Nullifier value : ${nullifier}`);
    console.log("------------------")
    console.log(`Verifying the nullifier : ${checkNullifier(nullifier,secret_key,htree.getTreeID(),nullTree.getTreeID())}`);

    const nullifierTreeRawProof = generateNullifierTreeProofForHash(nullTree,nullifier);

    console.log(`Verified Proof of non-membership generated for nullifier Tree : ${verifyProof(nullifierTreeRawProof)}`);

    //prepare zk-proof input for the compiled circuit
    const inputs = {
        sk:getCharCodes("raspberries"),
        siblingsPk:rawProof.siblings.flat(),
        path:rawProof.path,

        nullifierHash : nullifier,

        lowLeafHashValue:nullifierTreeRawProof.leafHashValue,
        lowHash : nullifierTreeRawProof.nullifierLeaf.hashValue,
        highHash : nullifierTreeRawProof.nullifierLeaf.nextHashValue,
        nextIndex : nullifierTreeRawProof.nullifierLeaf.nextIndex,
        nullifierTreeSiblingsPk : nullifierTreeRawProof.siblings.flat(),
        nullifierTreePath : nullifierTreeRawProof.path,
         
        //public inpus/signals
        root:htree.getRoot(),
        nullifierRoot:nullTree.getRoot(),
        nodeTreeID:htree.getTreeID(),
        nullifierTreeID:nullTree.getTreeID()
    };
    console.log(inputs);
    // const { proof, publicSignals } = await snarkjs.plonk.fullProve(inputs,"../circuits/build/HashTreeProof_js/HashTreeProof.wasm","../circuits/keys/HashTreeProof_PK.zkey");

    // const vKey = JSON.parse(fs.readFileSync("../circuits/keys/HashTreeProof_VK.json"));

    // const res = await snarkjs.plonk.verify(vKey,publicSignals,proof);

    // console.log(res);

    
}

main().then(()=>{
    process.exit(0); 
});