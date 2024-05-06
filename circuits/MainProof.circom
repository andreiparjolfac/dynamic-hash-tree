pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "./HashTreeLevel.circom";
include "./LessThan_256BIT_MSBR.circom";


template MainProof(depth){
    signal input sk;
    signal input siblingsPk[depth];
    signal input path[depth];

    signal input nullifierHash;

    signal input lowLeafHashValue;
    signal input lowHash;
    signal input nextIndex;
    signal input highHash;

    signal input nullifierTreeSiblingsPk[depth];
    signal input nullifierTreePath[depth];

    signal input root;
    signal input nullifierRoot;
    signal input nodeTreeID;
    signal input nullifierTreeID;


    //proof of membership
    signal intermed[depth+1];

    component levelChecker[depth];
    component poseidon = Poseidon(1);
    poseidon.inputs[0] <== sk;
    poseidon.out ==> intermed[0];

    for(var i=0;i<depth;i++){
        levelChecker[i] = HashTreeLevel();
        levelChecker[i].in[0] <== intermed[i];
        levelChecker[i].in[1] <== siblingsPk[i];
        levelChecker[i].position <== path[i];
        levelChecker[i].out ==> intermed[i+1];
    }

    intermed[depth] === root;

    //proof of nullifier 
    component poseidonNullifier = Poseidon(3);
    poseidonNullifier.inputs[0]<==sk;
    poseidonNullifier.inputs[1]<==nodeTreeID;
    poseidonNullifier.inputs[2]<==nullifierTreeID;
    poseidonNullifier.out === nullifierHash;

    // proof that lowhash is lower than nullifier and highhash is higher than the nullifier
    component LT256[2] ;
    LT256[0] = LessThan_256BIT_MSBR();
    LT256[0].in[0]<==lowHash;
    LT256[0].in[1]<==nullifierHash;
    LT256[0].out === 1;

    LT256[1] = LessThan_256BIT_MSBR();
    LT256[1].in[0]<==nullifierHash;
    LT256[1].in[1]<==highHash;
    LT256[1].out === 1;

    //proof that the 3 items lowhash,next index and highhash , hash into the leaf node of the nullfier
    component poseidonLowLeafHashValue = Poseidon(3);
    poseidonLowLeafHashValue.inputs[0] <== lowHash;
    poseidonLowLeafHashValue.inputs[1] <== nextIndex;
    poseidonLowLeafHashValue.inputs[2] <== highHash;
    poseidonLowLeafHashValue.out === lowLeafHashValue;

    //proof of membership for the lowLeafHashValue == proof of non - membership for the nullifier
    signal intermedNULL[depth+1];

    component levelCheckerNullifier[depth];
    lowLeafHashValue ==> intermedNULL[0];

    for(var i=0;i<depth;i++){
        levelCheckerNullifier[i] = HashTreeLevel();
        levelCheckerNullifier[i].in[0] <== intermedNULL[i];
        levelCheckerNullifier[i].in[1] <== nullifierTreeSiblingsPk[i];
        levelCheckerNullifier[i].position <== nullifierTreePath[i];
        levelCheckerNullifier[i].out ==> intermedNULL[i+1];
    }

    intermedNULL[depth] === nullifierRoot;


    
}

component main {public [root,nullifierRoot,nodeTreeID,nullifierTreeID,nullifierHash]}  = MainProof(16);

/* INPUT = {
  "sk": "1149711511298101114114105101115",
  "siblingsPk": [
    "19014214495641488759237505126948346942972912379615652741039992445865937985820",
    "10447686833432518214645507207530993719569269870494442919228205482093666444588",
    "2186774891605521484511138647132707263205739024356090574223746683689524510919",
    "6624528458765032300068640025753348171674863396263322163275160878496476761795",
    "17621094343163687115133447910975434564869602694443155644084608475290066932181",
    "21545791430054675679721663567345713395464273214026699272957697111075114407152",
    "792508374812064496349952600148548816899123600522533230070209098983274365937",
    "19099089739310512670052334354801295180468996808740953306205199022348496584760",
    "1343295825314773980905176364810862207662071643483131058898955641727916222615",
    "16899046943457659513232595988635409932880678645111808262227296196974010078534",
    "4978389689432283653287395535267662892150042177938506928108984372770188067714",
    "9761894086225021818188968785206790816885919715075386907160173350566467311501",
    "13558719211472510351154804954267502807430687253403060703311957777648054137517",
    "10982195301010480946931456064395571768438340920577556770652975692225700704356",
    "8536725160056600348017064378079921187897118401199171112659606555966521727181",
    "17731960725993409205647629535433695139708451502526773527161126281730851312303"
  ],
  "path": [
    1, 0, 0, 0, 0, 1,
    1, 1, 0, 1, 1, 1,
    0, 1, 0, 0
  ],
  "nullifierHash": "5872559138500314488803001855265510459552834833845790454912528871492206154256",
  "lowLeafHashValue": "6395821338028259029208767179980913543707389139742838493308062280558000815587",
  "lowHash": "0",
  "highHash": "21888242871839275222246405745257275088548364400416034343698204186575808495616",
  "nextIndex": 1,
  "nullifierTreeSiblingsPk": [
    "19995003932431518142420037639546124879958109781376591867897177037222171918880",
    "14744269619966411208579211824598458697587494354926760081771325075741142829156",
    "7423237065226347324353380772367382631490014989348495481811164164159255474657",
    "11286972368698509976183087595462810875513684078608517520839298933882497716792",
    "3607627140608796879659380071776844901612302623152076817094415224584923813162",
    "19712377064642672829441595136074946683621277828620209496774504837737984048981",
    "20775607673010627194014556968476266066927294572720319469184847051418138353016",
    "3396914609616007258851405644437304192397291162432396347162513310381425243293",
    "21551820661461729022865262380882070649935529853313286572328683688269863701601",
    "6573136701248752079028194407151022595060682063033565181951145966236778420039",
    "12413880268183407374852357075976609371175688755676981206018884971008854919922",
    "14271763308400718165336499097156975241954733520325982997864342600795471836726",
    "20066985985293572387227381049700832219069292839614107140851619262827735677018",
    "9394776414966240069580838672673694685292165040808226440647796406499139370960",
    "11331146992410411304059858900317123658895005918277453009197229807340014528524",
    "15819538789928229930262697811477882737253464456578333862691129291651619515538"
  ],
  "nullifierTreePath": [
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0
  ],
  "root": "20565495598538901174311817114201680449992962789373826722557432466980404317574",
  "nullifierRoot": "18723227610412879835436792937644864982066861260982052673548876293719516975723",
  "nodeTreeID": 120,
  "nullifierTreeID": 199
} */