import { array } from "prop-types";
import Fuse from 'fuse.js';

export const ManipulateTheQuery = async (query, inputData) => {
    let result = query.slice(1);
    let leftPart = inputData;
    let rightPart = null;

    //Finding data from the query
    let translation2 = null;
    const translationregex = /['"]([^'"]+)['"]/g;
    const matches = inputData.match(translationregex);
    console.log(matches)
    let translation1 = matches ? matches[0].slice(1, -1) : null;
    console.log(translation1);
    //if (translation1 == null){
     //   return "Did you really include quotes(\", ') ?"
    //}
    let modifiedQuery1 ="";

    if(inputData.includes("and") && matches.length > 1){
        let parts = inputData.split("and");
        leftPart = parts[0].trim();
        rightPart = parts[1].trim();
        console.log("Left side:", leftPart);   
        console.log("Right side:", rightPart);
        translation2 = matches ? matches[1].slice(1, -1) : null;
        console.log(translation2);
    }
    else if(inputData.includes("and") && matches.length < 2){
        modifiedQuery1 = "Did you really add quotes?"
        return modifiedQuery1
    }
    else if(matches.length>1 && !inputData.includes("and")){
        modifiedQuery1 = "Did you miss an 'and'?"
        return modifiedQuery1
    }

    
    let finalquery ='';

    let extractedstring = '?Term', newextractedstring= '?Term', newextractedstring1 = '?Term';
    let startDelimiter = '?';
    const endDelimiter1 = ' ';
    const endDelimiter2 = '\n'
    let wherefinder = "WH";
    let brackfinder = result.indexOf('}');
    console.log(brackfinder)
    if (brackfinder== -1){
        result = result.replace('{', '{ }');
        brackfinder = result.indexOf('}');
        console.log(result)
    }
    const startIndex = result.indexOf(startDelimiter);
    console.log("Start pos: ", startIndex); 
    const endIndex1 = result.indexOf(endDelimiter1, startIndex + startDelimiter.length);
    console.log("For space: ", endIndex1);
    const endIndex2 = result.indexOf(endDelimiter2, startIndex + startDelimiter.length);
    console.log("For new line: ", endIndex2);
    let endDelimiter;
    if(endIndex2 == -1)
    {
        endDelimiter = endIndex1;
    }
    else
    {
        endDelimiter = Math.min(endIndex1, endIndex2);
    }
    
    console.log("End pos: ", endDelimiter);
    if (startIndex !== -1 && endDelimiter !== -1) {
        extractedstring = result.slice(startIndex + startDelimiter.length, endDelimiter);
        extractedstring = '?Term';
        result =result.slice(startIndex-7, startIndex) + extractedstring + ' ' +result.slice(result.indexOf(wherefinder), brackfinder+1);
        
        console.log(result)

    } 
    else {
        console.log("Not found!")
    }

    //const graphURI = 'http://www.harshil.org/pythonscriptdata/graph';
    //const modifiedQuery = result.replace('WHERE', `FROM <${graphURI}> WHERE`);
    const regex = /{([^}]+)}/g;
    let quotedData;
    //let quotedData = "FILTER (STRSTARTS(?o, '„') && STRENDS(?o, '" + translation + "“'))\n"
    //console.log(quotedData);
    let categoryfinder = "\n?Term <http://www.cidoc-crm.org/cidoc-crm/P3_has_note> ?CategoryReference .\n"
    let categoryfinder1 = "\n?Term <http://www.cidoc-crm.org/cidoc-crm/P3_has_note> ?CategoryReference1 .\n"

    const options = {
        keys: ['name'], // Specify the key to search within the objects (in this case, 'name').
        includeScore: true, // This allows you to get a score for each result.
        includeMatches: true, // This will provide information about which characters matched.
        threshold: 0.3, // Adjust the threshold to control fuzziness (0.0 being very fuzzy, 1.0 being exact match).
        ignoreLocation: true, // This makes it case-insensitive.
      
    };

    

    
    
    quotedData = "FILTER (regex(STR(?o1), '" + translation1 + "', 'i'))";
    
    /*const data = JSON.parse(window.globalCategory)
    //console.log(data)
    const results = data.results;
    //console.log(results)
    const bindings = results.bindings;
    let terms = bindings.map(binding => binding.Categories.value);*/
    let terms =[
        "AuthorAndFragment",
        "Category",
        "GermanTranslation",
        "Annotation",
        "ItalianTranslation",
        "Literature",
        "Volume",
        "EnglishTranslation"
    ]
    console.log(terms)

    const fuse = new Fuse(terms.map(term => ({ name: term })), options);
    console.log("Fuse: ",fuse)
    let matchedterm;

    const wordsfoundleftt = leftPart.match(/\w+/g);
    let wordsfoundleft;
    if(wordsfoundleftt!==null){
    wordsfoundleft = wordsfoundleftt.filter(item => item !== translation1)
    console.log("words in string", wordsfoundleft)
    for(const word of wordsfoundleft){
        //console.log("Word in array", word)
        matchedterm = terms.find(term => term.toLowerCase().includes(word.toLowerCase()))
        console.log("matched term: ", matchedterm)
        if(matchedterm){
            console.log(matchedterm)
            finalquery = categoryfinder + `?CategoryReference <http://www.cidoc-crm.org/cidoc-crm/P190_has_symbolic_content> ?${matchedterm} .\nFILTER (regex(STR(?${matchedterm}), '${translation1}', 'i'))`;
            modifiedQuery1= result.replace(regex, (match, content) => `{${finalquery}}`);
            newextractedstring = `?Term ?${matchedterm}`
            modifiedQuery1 = modifiedQuery1.replace(extractedstring, newextractedstring);
            console.log(modifiedQuery1)
            break
        }
    }
    if(!matchedterm){
    for(const word of wordsfoundleft){
            const results1 = fuse.search(word);
            console.log(results1)
            let resfound;
            if (results1.length > 0) {
                // Display the results or use them as needed.
                results1.forEach(result => {
                  console.log(result.item.name);
                  console.log("score: ", result.item.includeScore) // The matched term.
                  resfound = result.item.name
                });
                finalquery = categoryfinder + `?CategoryReference <http://www.cidoc-crm.org/cidoc-crm/P190_has_symbolic_content> ?${resfound} .\nFILTER (regex(STR(?${resfound}), '${translation1}', 'i'))`;
                modifiedQuery1= result.replace(regex, (match, content) => `{${finalquery}}`);
                newextractedstring = `?Term ?${resfound}`
                modifiedQuery1 = modifiedQuery1.replace(extractedstring, newextractedstring);
                break
            }
        }
    }}
    //console.log(modifiedQuery1)
    if(modifiedQuery1 === '' || wordsfoundleft === ' '){
        console.log("andar")
        modifiedQuery1 = `PREFIX ns1: <http://www.cidoc-crm.org/cidoc-crm/> \nPREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \nSELECT ?Term WHERE {\n?Term rdfs:label ?label .\nFILTER(regex(STR(?label), '${translation1}', 'i'))}`
    }

    /*modifiedQuery1= result.replace(regex, (match, content) => `{}`);
    modifiedQuery1 = modifiedQuery1.replace(extractedstring, newextractedstring);*/
    console.log("Query 1: ", modifiedQuery1)

    let finalquery1;
    let modifiedQuery2;
    let quotedData1;
    let matchedterm1;
    if(matches.length>1){
        const wordsfoundrightt = rightPart.match(/\w+/g);
        let wordsfoundright;
        if(wordsfoundrightt!==''){
        wordsfoundright = wordsfoundrightt.filter(item => item !== translation2)
        for(const word1 of wordsfoundright){
            //console.log("Word in array", word1)
            matchedterm1 = terms.find(term => term.toLowerCase().includes(word1.toLowerCase()))
            if(matchedterm1){
                console.log(matchedterm1)
                finalquery1 = categoryfinder1 + `?CategoryReference1 <http://www.cidoc-crm.org/cidoc-crm/P190_has_symbolic_content> ?${matchedterm1} .\nFILTER (regex(STR(?${matchedterm1}), '${translation2}', 'i'))}`;
                modifiedQuery2 = modifiedQuery1.replace('}', finalquery1);
                newextractedstring1 = newextractedstring + ` ?${matchedterm1} `
                //console.log("NEW string 1: ", newextractedstring1)
                modifiedQuery2 = modifiedQuery2.replace(newextractedstring, newextractedstring1)
                console.log("Query 2: ", modifiedQuery2)
                return modifiedQuery2
            }
        }
        if(!matchedterm1){
            for(const word1 of wordsfoundright){
                const results2 = fuse.search(word1);
                console.log(results2)
                let resfound1;
                if (results2.length > 0) {
                    // Display the results or use them as needed.
                    results2.forEach(result => {
                      console.log("Found match: ", result.item.name); // The matched term.
                      resfound1 = result.item.name
                    });
                    finalquery1 = categoryfinder1 + `?CategoryReference1 <http://www.cidoc-crm.org/cidoc-crm/P190_has_symbolic_content> ?${resfound1} .\nFILTER (regex(STR(?${resfound1}), '${translation2}', 'i'))}`;
                    modifiedQuery2 = modifiedQuery1.replace('}', finalquery1);
                    newextractedstring1 = newextractedstring + ` ?${resfound1} `
                    modifiedQuery2 = modifiedQuery2.replace(newextractedstring, newextractedstring1);
                    console.log("Query 2: ", modifiedQuery2)
                    return modifiedQuery2
                }
            }
        }}
        if(modifiedQuery2===' '){
            modifiedQuery2 =modifiedQuery1.replace('}',`\n?Term ?obj1 ?pre1 .\n FILTER(regex(STR(?pre1), '${translation2}', 'i'))}`)
            return modifiedQuery2
        }
    }

    return modifiedQuery1


}