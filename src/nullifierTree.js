import { NullifierTreeLeaf } from "./nullifierTreeLeaf.mjs";
import { hashFunction } from "./hashFunction.mjs";
import { HashTree } from "./hashTree.mjs";

class NullifierTree{

    constructor(hasher,depth){
        //set nodes and zero vals
        this.hasher = hasher;
        this.depth = depth;
        this.zeros = [];
        this.nodes = Array(depth);
        this.leavesList = [];
        let zeroVal = 0;
        for(let lv=0;lv<this.depth;lv++){
            this.zeros.push(String(zeroVal));
            this.nodes[lv]=[];
            zeroVal = this.hasher(Array(2).fill(String(zeroVal)));
        }
        //prepare the root 
        this.nodes[depth] = [zeroVal];

        //create first index in the linked list
        this.leavesList.push(new NullifierTreeLeaf(this.zeros[0],0,this.zeros[0]));
        this.nodes[0][0] = this.hasher([this.leavesList[0].hashValue,this.leavesList[0].nextIndex,this.leavesList[0].nextHashValue]);


    }
    //get root of the nullifier
    getRoot(){
        return this.nodes[this.depth][0];
    }
    //get depth of the nullifier
    getDepth(){
        return this.depth;
    }
    //get the first level 
    getLeaves(){
        return this.leavesList;
    }
    //get the zeros of the nullifier
    getZeros(){
        return this.zeros.slice();
    }

    //get arity ... hardcoded 2
    getArity(){
        return 2;
    }

    //insert new element in the leaves linked list
    insertHashValue(hash){
        //update the main nodes and propagate the change to the root
        const updateNode = (index,newLeaf)=>{
            for(let lv = 0;lv<this.depth;lv++){
                //set the selection bounds
                const position = index % 2;
                const startSection = index - position;
                const endSection = startSection + 2;
    
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
                index = Math.floor(index/2);
            }
            //final update : root 
            this.nodes[this.depth][0] = newLeaf;

        }

        //check if the list has one elem
        if(this.leavesList.length===1){
            
            if(hash ===this.leavesList[0].hashValue ){
                throw new Error("Value already stored!");
            }else{
                //insert in the list
                const lowNode = this.leavesList[0];
                const newNode = new NullifierTreeLeaf(hash,lowNode.nextIndex,lowNode.nextHashValue);
                lowNode.nextIndex = this.leavesList.length;
                lowNode.nextHashValue = hash;
                this.leavesList.push(newNode);

                //propagate the changes to the root
                updateNode(this.leavesList.length-1,this.hasher([newNode.hashValue,newNode.nextIndex,newNode.nextHashValue]));
                updateNode(0,this.hasher([lowNode.hashValue,lowNode.nextIndex,lowNode.nextHashValue]));

                
            }

        }else{
            //else parse the list and get the insert index
            let lowNodeIndex=-1;
            let highestIndex=-1;
            for(let i=0;i<this.leavesList.length;i++){
                if(BigInt(this.leavesList[i].hashValue) < BigInt(hash) && BigInt(hash) < BigInt(this.leavesList[i].nextHashValue)){
                    
                    lowNodeIndex = i;
                    break;
                }
                if(this.leavesList[i].nextIndex === 0){
                    highestIndex=i;
                }
                if(BigInt(hash) === BigInt(this.leavesList[i].hashValue)){
                    throw new Error("Value already stored!");
                }
            }
            
            if(lowNodeIndex===-1){
                //insert at the back
                const lowNode = this.leavesList[highestIndex];
                const newNode = new NullifierTreeLeaf(hash,lowNode.nextIndex,lowNode.nextHashValue);
                lowNode.nextIndex = this.leavesList.length;
                lowNode.nextHashValue = hash;
                this.leavesList.push(newNode);

                //propagate the changes to the root
                updateNode(this.leavesList.length-1,this.hasher([newNode.hashValue,newNode.nextIndex,newNode.nextHashValue]));
                updateNode(highestIndex,this.hasher([lowNode.hashValue,lowNode.nextIndex,lowNode.nextHashValue]));

            }else{
                //insert inside the list and update the lownode
                const lowNode = this.leavesList[lowNodeIndex];
                const newNode = new NullifierTreeLeaf(hash,lowNode.nextIndex,lowNode.nextHashValue);
                lowNode.nextIndex = this.leavesList.length;
                lowNode.nextHashValue = hash;
                this.leavesList.push(newNode);

                //propagate the changes to the root
                updateNode(this.leavesList.length-1,this.hasher([newNode.hashValue,newNode.nextIndex,newNode.nextHashValue]));
                updateNode(lowNodeIndex,this.hasher([lowNode.hashValue,lowNode.nextIndex,lowNode.nextHashValue]));

            }

        }
  

    }

}

const nullTree = new NullifierTree(hashFunction,32);

nullTree.insertHashValue("30");
nullTree.insertHashValue("10");
nullTree.insertHashValue("20");
nullTree.insertHashValue("50");
nullTree.insertHashValue("15");

console.log(nullTree.leavesList);
console.log(nullTree.nodes[0]);