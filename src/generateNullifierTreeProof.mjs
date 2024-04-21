

function findLowNodeIndex(nullifierTree,hash){
    //find the index of the node that has  hashValue < hash and nextHashValue > hash
    let node = nullifierTree.leavesList[0];
    let index = 0;
    while(!( BigInt(node.hashValue)<= BigInt(hash) && BigInt(hash) < BigInt(node.nextHashValue) )){
        index = node.nextIndex;
        node = nullifierTree.leavesList[index];
    }

    if(BigInt(hash) === BigInt(node.hashValue)){
        throw new Error("Nullifier already in the tree!");
    }

    return index;
}

function generateNullifierTreeProofForIndex(nullifierTree,index){

    
    const path = [];
    const siblings = [];
    const startIndex = index ;

    for(let lv=0;lv<nullifierTree.getDepth();lv++){
        const position = index % 2;
        const startSection = index - position;
        const endSection = startSection + 2;


        path[lv] = position;
        siblings[lv] = []; 

        for(let i=startSection;i<endSection;i++){
            if(i !== index){
                if(nullifierTree.nodes[lv][i] === undefined){
                    siblings[lv].push(nullifierTree.zeros[lv]);
                }else{
                    siblings[lv].push(nullifierTree.nodes[lv][i]);
                }
            }
        }

        index = Math.floor(index/2);

    }

    return {
        rootHashValue: nullifierTree.getRoot(), 
        leafHashValue:nullifierTree.nodes[0][startIndex], 
        path:path , 
        siblings:siblings ,
        hasher : nullifierTree.hasher,
        nullifierLeaf : nullifierTree.leavesList[startIndex]
    };

}

function generateNullifierTreeProofForHash(nullifierTree,hash){
    return generateNullifierTreeProofForIndex(nullifierTree,findLowNodeIndex(nullifierTree,hash));
}

export {generateNullifierTreeProofForHash};