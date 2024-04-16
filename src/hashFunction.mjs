import * as circomlibjs from "circomlibjs"

function getCharCodes(string){
    let charcodes = "";
    try {
        
        charcodes = String(BigInt(string));
        return charcodes;

    } catch (error) {
        
        for(let i=0;i<string.length;i++){
            charcodes+=string.charCodeAt(i);
        }
        return charcodes;
    }

}

const generateHashFunction = async () =>{
    const poseidon = await circomlibjs.buildPoseidon();

    return (strings)=>{
        const stringcodes = [];
        for(let i=0;i<strings.length;i++){
            stringcodes.push(getCharCodes(strings[i]))
        }

        return poseidon.F.toString(poseidon(stringcodes));
    };

}

let hashFunction = (await generateHashFunction());

export {hashFunction};