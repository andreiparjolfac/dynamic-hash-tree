

    //verify the hashvalue and the path provided 
    function verifyProof(proof){

        const {leafHashValue,siblings,path,rootHashValue,hasher} = proof;
        let hash = leafHashValue;
        for (let i=0;i<path.length;i++){
            const section = siblings[i].slice(0,path[i]).concat([hash]).concat(siblings[i].slice(path[i],siblings.length));
            hash = hasher(section);

        }
        
        return  hash === rootHashValue;

    }

export {verifyProof};