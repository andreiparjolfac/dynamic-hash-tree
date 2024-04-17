
import { hashFunction } from "./hashFunction.mjs";
import { generateProofForHash,generateProofForIndex } from "./generateProof.mjs";
import { verifyProof } from "./verifyProof.mjs";

export default class HashTree{
    static maxLevelDepth = 128;

    constructor(hasher,depth,zeroVal,arity,leaves){

        //check the max depth of the tree
        if(depth<1 || depth > HashTree.maxLevelDepth)
            throw new Error(`The tree depth has to be between 1 and ${HashTree.maxLevelDepth}`);

        //check the size of the tree
        if(leaves.length > arity**depth)
            throw new Error(`The tree can't contain more than ${arity**HashTree.maxLevelDepth} leaves`);

        //init the props of the tree
        this.hasher=hasher;
        this.depth=depth;
        this.zeros = [];
        this.nodes = Array(depth);
        this.arity = arity;

        //generate zero values for each level of depth
        //respect the hash tree hashing rule
        for(let lv = 0; lv<depth;lv++){
            this.zeros.push(String(zeroVal));
            this.nodes[lv] = [];
            zeroVal = this.hasher(Array(this.arity).fill(String(zeroVal)));
        }

        //root depth
        this.nodes[depth] = [];

        //init the leaves if any are present
        if(leaves.length>0){
            //hash the leaves
            for (let i = 0;i<leaves.length;i++){
                leaves[i] = this.hasher([leaves[i]]);
            }
            //first level 
            this.nodes[0] = leaves;
            //compute the rest of the levels
            
            for(let lv=0;lv<depth;lv++){
                for(let index=0;index<Math.ceil(this.nodes[lv].length / this.arity);index++){
                    //compute the list of children
                    const slice_index = index * this.arity;
                    const children = []
                    //padding with this.zeros[lv] if the vector is too short
                    for(let i=0;i<this.arity;i++){
                        if(this.nodes[lv][slice_index+i] === undefined )
                            children.push(this.zeros[lv]);
                        else 
                            children.push(this.nodes[lv][slice_index+i]);
                    }
                    
                    //update the nodes from the higher level using the hashes of the children
                    this.nodes[lv+1][index] = this.hasher(children);
                }
            }
        }else{
            //if leaves == [] then root has the zero val hash
            this.nodes[depth][0] = zeroVal;
        }
    }
    //get the root hash of the set/tree
    getRoot(){
        return this.nodes[this.depth][0];
    }
    //get the depth of the tree
    getDepth(){
        return this.depth;
    }
    //get all the leaves of the tree
    getLeaves(){
        return this.nodes[0].slice();
    }
    //get all the zeros for each level
    getZeros(){
        return this.zeros.slice();
    }
    //get the arity/number of children for each non-leaf node
    getArity(){
        return this.arity;
    }
    //get the index of the hash in the leaves vector
    getLeafIndex(leaf){
        return this.nodes[0].indexOf(leaf);
    }
    //update the leaf at index 
    updateLeafAtIndex(newLeaf,index){
        //check index over/underflow
        if(index<0 || index >= this.arity ** this.depth)
            throw new Error(`Index out of bounds! [0,${this.arity ** this.depth})`);

        for(let lv = 0;lv<this.depth;lv++){
            //set the selection bounds
            const position = index % this.arity;
            const startSection = index - position;
            const endSection = startSection + this.arity;

            const children = []
            this.nodes[lv][index] = newLeaf;

            for(let i=startSection;i<endSection;i++){
                //check sparse levels
                if(this.nodes[lv][i]===undefined){
                    children.push(this.zeros[lv]);
                }else{
                    children.push(this.nodes[lv][i]);
                }
            }
            //compute hash of the parent 
            newLeaf = this.hasher(children);
            //update the index for the next iteration
            index = Math.floor(index/this.arity);
        }
        //final update : root 
        this.nodes[this.depth][0] = newLeaf;
    }

    //insert a new hash in the tree at a specific index
    //resize the tree if the index is too large
    insertHashAtIndex(newLeaf,index){
        //throw error if out of bounds
        if(index < 0){
            throw new Error("Index can't be negative!");
        }
        //update the tree if it's in available range 
        if(index < this.arity ** this.depth){
            this.updateLeafAtIndex(newLeaf,index);
            return;
        }
        //expand the tree otherwise
        if(this.depth === HashTree.maxLevelDepth){
            throw new Error("Tree is already at max depth!");
        }else{
            //increase the depth
            this.depth++;
            //add this.arity-1 new zero trees to the main tree and update the zeros vector
            this.zeros[this.depth-1] = this.hasher(Array(this.arity).fill(this.zeros[this.depth-2]));
            this.nodes[this.depth]=[];
            this.insertHashAtIndex(newLeaf,index);
            return;
        }
    }
    //delete the leaf at index 
    deleteLeafAtIndex(index){
        if(index<0 || index >= this.arity ** this.depth){
            throw new Error("Index out of range, while trying to delete leaf!");
        }
        this.updateLeafAtIndex(this.zeros[0],index);
    }

}




const htree = new HashTree(hashFunction,128,hashFunction([0]),2,[1,2,3]);
htree.insertHashAtIndex(hashFunction([4]),3);
htree.insertHashAtIndex(hashFunction([5]),4);
htree.insertHashAtIndex(hashFunction([6]),5);
htree.insertHashAtIndex(hashFunction([7]),6);
htree.insertHashAtIndex(hashFunction([8]),7);

const proof = generateProofForHash(htree,hashFunction(["7"]));
console.log(htree);
console.log(proof);

console.log(verifyProof(proof));







