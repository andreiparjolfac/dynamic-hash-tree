    //create proof for a specific index
    //we can also just compute the representation in the hash tree arity base 
    //from base 10 to base this.arity of the index numerical value
    
    function generateProofForIndex(hashTree,index){
        if(index<0 || index >= hashTree.getArity()**hashTree.getDepth()){
            throw new Error("Index out of range, while trying to generate proof!");
        }
        
        const path = [];
        const siblings = [];
        const startIndex = index ;

        for(let lv=0;lv<hashTree.getDepth();lv++){
            const position = index % hashTree.getArity();
            const startSection = index - position;
            const endSection = startSection + hashTree.getArity();


            path[lv] = position;
            siblings[lv] = []; 

            for(let i=startSection;i<endSection;i++){
                if(i !== index){
                    if(hashTree.nodes[lv][i] === undefined){
                        siblings[lv].push(hashTree.zeros[lv]);
                    }else{
                        siblings[lv].push(hashTree.nodes[lv][i]);
                    }
                }
            }

            index = Math.floor(index/hashTree.getArity());

        }

        return {rootHashValue: hashTree.getRoot(), leafHashValue:hashTree.nodes[0][startIndex], path:path , siblings:siblings , hasher : hashTree.hasher};

    }

    function generateProofForHash(hashTree,hashValue){
        const index = hashTree.getLeafIndex(hashValue);
        if (index === -1){
            throw new Error("Hash value not found in the tree!");
        }else{
            return generateProofForIndex(hashTree,index);
        }
    }

export {generateProofForIndex,generateProofForHash};