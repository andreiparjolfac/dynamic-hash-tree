import fs from "fs";
import * as snarkjs from "snarkjs";
import { HashTree } from "../src/hashTree.mjs";
import { NullifierTree } from "../src/nullifierTree.mjs";
import { hashFunction,getCharCodes } from "../src/hashFunction.mjs";
import { generateProofForHash,generateProofForIndex } from "../src/generateProof.mjs";
import { verifyProof } from "../src/verifyProof.mjs";
import { generateNullifier,checkNullifier } from "../src/NullifierProof.mjs";
import { generateNullifierTreeProofForHash } from "../src/generateNullifierTreeProof.mjs";
// update the words file and the main circuits and recompile them . add index as a hash commitment to the nullifier check in both JS and circom

const  zk_prove = async(inputs) =>{

    console.log(inputs);
    console.log("Starting ZK Proof Generation");
    var start = new Date().getTime();
    const { proof, publicSignals } = await snarkjs.plonk.fullProve(inputs,"../circuits/build/MainProof_js/MainProof.wasm","../circuits/keys/MainProof_PK.zkey");
    var time_now = new Date().getTime();
    console.log(`Proof and public signals generated in ${time_now-start} mseconds`);
    
    const vKey = JSON.parse(fs.readFileSync("../circuits/keys/MainProof_VK.json"));
    const res = await snarkjs.plonk.verify(vKey,publicSignals,proof);
    console.log("Proof result: ");
    console.log(res);
    var end = new Date().getTime();
    console.log(`Verify time : ${end-time_now} mseconds`);

    return res;
}

const main = async()=>{

    const words_alpha = fs.readFileSync("../words_alpha/words_alpha.txt",{encoding:'utf-8',flag:'r'}).split("\n");

    for(let i=0;i<words_alpha.length;i++){
        words_alpha[i]=words_alpha[i].trim();

    }

    const hashed_words_alpha = [];


    console.log("Hashing all the words")
    for(let i=0;i<words_alpha.length;i++){
        if(i%10000==0)
            console.log(i+"/"+words_alpha.length)
        hashed_words_alpha[i] = hashFunction([words_alpha[i]]);

    }

    const hashTree = new HashTree(hashFunction,20,hashFunction([0]),2,hashed_words_alpha,101);
    console.log("Merkle Tree Root");
    console.log(hashTree.getRoot());

    const nullTree = new NullifierTree(hashFunction,20, 199);
    let index = 12;
    const secret_key = "raspberries";
    const rawProof = generateProofForIndex(hashTree,index);
    console.log("Generated proof of membership for the secret key");
    console.log(rawProof);
    console.log("Verifying raw proof on Prover Side. Proof is correct: "+verifyProof(rawProof));

    const nullifier = generateNullifier(secret_key,hashTree.getTreeID(),nullTree.getTreeID(),index);
    console.log("Computing nullifier value");
    console.log(`Generated nullifier for node tree ${hashTree.getTreeID()} and nullifier tree ${nullTree.getTreeID()} \n Nullifier value : ${nullifier}`);
    console.log("------------------")
    console.log(`Verifying the nullifier : ${checkNullifier(nullifier,secret_key,hashTree.getTreeID(),nullTree.getTreeID(),index)}`);

    const nullifierTreeRawProof = generateNullifierTreeProofForHash(nullTree,nullifier);
    console.log("Generated proof of non-membership for the computed nullifier");
    console.log(nullifierTreeRawProof);
    console.log(`Verifying raw proof of non-membership generated for nullifier Tree. Proof is corrrect: ${verifyProof(nullifierTreeRawProof)}`);


    var inputs = {
        sk:getCharCodes("raspberries"),
        sk_index:index,
        siblingsPk:rawProof.siblings.flat(),
        path:rawProof.path,

        nullifierHash : nullifier,

        lowLeafHashValue:nullifierTreeRawProof.leafHashValue,
        lowHash : nullifierTreeRawProof.nullifierLeaf.hashValue,
        highHash : nullifierTreeRawProof.nullifierLeaf.nextHashValue,
        nextIndex : nullifierTreeRawProof.nullifierLeaf.nextIndex,
        nullifierTreeSiblingsPk : nullifierTreeRawProof.siblings.flat(),
        nullifierTreePath : nullifierTreeRawProof.path,
         
   
        root:hashTree.getRoot(),
        nullifierRoot:nullTree.getRoot(),
        nodeTreeID:hashTree.getTreeID(),
        nullifierTreeID:nullTree.getTreeID()
    };

    const res = await zk_prove(inputs);
    if(res == true){
        nullTree.insertHashValue(nullifier);
    }

    index = 260907;
    const secret_key_2 = "raspberries";
    const rawProof_2 = generateProofForIndex(hashTree,index);
    console.log("Generated proof of membership for the secret key");
    console.log(rawProof_2);
    console.log("Verifying raw proof on Prover Side. Proof is correct: "+verifyProof(rawProof_2));

    const nullifier_2 = generateNullifier(secret_key_2,hashTree.getTreeID(),nullTree.getTreeID(),index);
    console.log("Computing nullifier value");
    console.log(`Generated nullifier for node tree ${hashTree.getTreeID()} and nullifier tree ${nullTree.getTreeID()} \n Nullifier value : ${nullifier_2}`);
    console.log("------------------")
    console.log(`Verifying the nullifier : ${checkNullifier(nullifier_2,secret_key_2,hashTree.getTreeID(),nullTree.getTreeID(),index)}`);

    const nullifierTreeRawProof_2 = generateNullifierTreeProofForHash(nullTree,nullifier_2);
    console.log("Generated proof of non-membership for the computed nullifier");
    console.log(nullifierTreeRawProof_2);
    console.log(`Verifying raw proof of non-membership generated for nullifier Tree. Proof is corrrect: ${verifyProof(nullifierTreeRawProof_2)}`);


    var inputs = {
        sk:getCharCodes("raspberries"),
        sk_index:index,
        siblingsPk:rawProof_2.siblings.flat(),
        path:rawProof_2.path,

        nullifierHash : nullifier_2,

        lowLeafHashValue:nullifierTreeRawProof_2.leafHashValue,
        lowHash : nullifierTreeRawProof_2.nullifierLeaf.hashValue,
        highHash : nullifierTreeRawProof_2.nullifierLeaf.nextHashValue,
        nextIndex : nullifierTreeRawProof_2.nullifierLeaf.nextIndex,
        nullifierTreeSiblingsPk : nullifierTreeRawProof_2.siblings.flat(),
        nullifierTreePath : nullifierTreeRawProof_2.path,
         
   
        root:hashTree.getRoot(),
        nullifierRoot:nullTree.getRoot(),
        nodeTreeID:hashTree.getTreeID(),
        nullifierTreeID:nullTree.getTreeID()
    };

    const res_2 = await zk_prove(inputs);
    if(res_2 == true){
        nullTree.insertHashValue(nullifier_2);
    }
};


main().then(()=>{
    process.exit(0);
})
