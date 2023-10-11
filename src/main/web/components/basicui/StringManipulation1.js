
export const ManipulateTheQuery1 = async (query, inputData) => {
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
    if(matches.length > 1){
        translation2 = matches ? matches[1].slice(1, -1) : null;
        console.log(translation2);

        if(inputData.includes("and")){
            let parts = inputData.split("and");
            leftPart = parts[0].trim();
            rightPart = parts[1].trim();
            console.log("Left side:", leftPart);   
            console.log("Right side:", rightPart);
        }

    }

    

    let modifiedQuery1 ="";
    let finalquery ='';

    let extractedstring = '';
    let startDelimiter = '?';
    const endDelimiter1 = ' ';
    const endDelimiter2 = '\n'
    let wherefinder = "W";
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
        if (extractedstring != 's') {
            extractedstring = 's';
            //console.log(result)
        }
        extractedstring = '*';
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

    
    
    quotedData = "FILTER (regex(STR(?o1), '" + translation1 + "', 'i'))";

    if(leftPart.toLowerCase().includes('author') || leftPart.toLowerCase().includes('fragment')){
        // expression to match "category" as standalone words (case-insensitive)
        finalquery = categoryfinder + "?CategoryReference <http://www.cidoc-crm.org/cidoc-crm/P2_has_type> 'AuthorAndFragment' .\n" + 
        "?CategoryReference <http://www.cidoc-crm.org/cidoc-crm/P190_has_symbolic_content> ?AuthorAndFragment .\n" +
        "FILTER (regex(STR(?AuthorAndFragment), '" + translation1 + "', 'i'))";
        modifiedQuery1= result.replace(regex, (match, content) => `{${finalquery}}`);
        console.log(modifiedQuery1);
    }    
    else if (/\ben(glish)?\b/gi.test(result) || leftPart.toLowerCase().includes('english')) {
        // Regular expression to match "en" or "english" as standalone words (case-insensitive)
        finalquery = categoryfinder + "?CategoryReference <http://www.cidoc-crm.org/cidoc-crm/P2_has_type> 'EnglishTranslation' .\n" + 
        "?CategoryReference <http://www.cidoc-crm.org/cidoc-crm/P190_has_symbolic_content> ?EnglishTranslation .\n" +
        "FILTER (regex(STR(?EnglishTranslation), '" + translation1 + "', 'i'))";
        modifiedQuery1= result.replace(regex, (match, content) => `{${finalquery}}`);
        console.log(modifiedQuery1);
    }
    else if (/\b(de|deutsch|deutsche|german)\b/gi.test(result) || leftPart.toLowerCase().includes('german')) {
        // Regular expression to match "de" or "deutsche" or "german" as standalone words (case-insensitive)
        finalquery = categoryfinder + "?CategoryReference <http://www.cidoc-crm.org/cidoc-crm/P2_has_type> 'GermanTranslation' .\n" + 
        "?CategoryReference <http://www.cidoc-crm.org/cidoc-crm/P190_has_symbolic_content> ?GermanTranslation .\n" +
        "FILTER (regex(STR(?GermanTranslation), '" + translation1 + "', 'i'))";
        modifiedQuery1= result.replace(regex, (match, content) => `{${finalquery}}`);
        console.log(modifiedQuery1);
    }
    else if(leftPart.toLowerCase().includes('category')){
        // expression to match "category" as standalone words (case-insensitive)
        finalquery = categoryfinder + "?CategoryReference <http://www.cidoc-crm.org/cidoc-crm/P2_has_type> 'Category' .\n" + 
        "?CategoryReference <http://www.cidoc-crm.org/cidoc-crm/P190_has_symbolic_content> ?Category .\n" +
        "FILTER (regex(STR(?Category), '" + translation1 + "', 'i'))";
        modifiedQuery1= result.replace(regex, (match, content) => `{${finalquery}}`);
        console.log(modifiedQuery1);
    }
    else if(leftPart.toLowerCase().includes('italian')){
        // expression to match "category" as standalone words (case-insensitive)
        finalquery = categoryfinder + "?CategoryReference <http://www.cidoc-crm.org/cidoc-crm/P2_has_type> 'ItalianTranslation' .\n" + 
        "?CategoryReference <http://www.cidoc-crm.org/cidoc-crm/P190_has_symbolic_content> ?ItalianTranslation .\n" +
        "FILTER (regex(STR(?ItalianTranslation), '" + translation1 + "', 'i'))";
        modifiedQuery1= result.replace(regex, (match, content) => `{${finalquery}}`);
        console.log(modifiedQuery1);
    }
    else if(leftPart.toLowerCase().includes('literature')){
        // expression to match "category" as standalone words (case-insensitive)
        finalquery = categoryfinder + "?CategoryReference <http://www.cidoc-crm.org/cidoc-crm/P2_has_type> 'Literature' .\n" + 
        "?CategoryReference <http://www.cidoc-crm.org/cidoc-crm/P190_has_symbolic_content> ?Literature .\n" +
        "FILTER (regex(STR(?Literature), '" + translation1 + "', 'i'))";
        modifiedQuery1= result.replace(regex, (match, content) => `{${finalquery}}`);
        console.log(modifiedQuery1);
    }
    else if(leftPart.toLowerCase().includes('volume')){
        // expression to match "category" as standalone words (case-insensitive)
        finalquery = categoryfinder + "?CategoryReference <http://www.cidoc-crm.org/cidoc-crm/P2_has_type> 'Volume' .\n" + 
        "?CategoryReference <http://www.cidoc-crm.org/cidoc-crm/P190_has_symbolic_content> ?Volume .\n" +
        "FILTER (regex(STR(?Volume), '" + translation1 + "', 'i'))";
        modifiedQuery1= result.replace(regex, (match, content) => `{${finalquery}}`);
        console.log(modifiedQuery1);
    }
    else if(leftPart.toLowerCase().includes('annotation')){
        // expression to match "category" as standalone words (case-insensitive)
        finalquery = categoryfinder + "?CategoryReference <http://www.cidoc-crm.org/cidoc-crm/P2_has_type> 'Annotation' .\n" + 
        "?CategoryReference <http://www.cidoc-crm.org/cidoc-crm/P190_has_symbolic_content> ?Annotation .\n" +
        "FILTER (regex(STR(?Annotation), '" + translation1 + "', 'i'))";
        modifiedQuery1= result.replace(regex, (match, content) => `{${finalquery}}`);
        console.log(modifiedQuery1);
    }
    else{
        modifiedQuery1 = "We had some trouble generating the query. Click on Show Guidelines for information"
    }
    

    let finalquery1;
    let modifiedQuery2;
    let quotedData1;
    if(matches.length>1){

        quotedData1 = "FILTER (regex(STR(?o1), '" + translation1 + "', 'i') && regex(STR(?o2), '" + translation2 + "', 'i'))";
        if(rightPart.toLowerCase().includes('author') || rightPart.toLowerCase().includes('fragment')){
            // expression to match "category" as standalone words (case-insensitive)

            finalquery1 = categoryfinder1 + "?CategoryReference1 <http://www.cidoc-crm.org/cidoc-crm/P2_has_type> 'AuthorAndFragment' .\n" + 
            "?CategoryReference1 <http://www.cidoc-crm.org/cidoc-crm/P190_has_symbolic_content> ?AuthorAndFragment .\n" +
            "FILTER (regex(STR(?AuthorAndFragment), '" + translation2 + "', 'i'))}";

            modifiedQuery2 = modifiedQuery1.replace('}', finalquery1);
            //modifiedQuery2= modifiedQuery1.replace(regex, (match, content) => `{${finalquery}}`);
            console.log(modifiedQuery2);
        }    
        else if (rightPart.toLowerCase().includes('english')) {
            // Regular expression to match "en" or "english" as standalone words (case-insensitive)
            finalquery1 = categoryfinder1 + "?CategoryReference1 <http://www.cidoc-crm.org/cidoc-crm/P2_has_type> 'EnglishTranslation' .\n" + 
            "?CategoryReference1 <http://www.cidoc-crm.org/cidoc-crm/P190_has_symbolic_content> ?EnglishTranslation .\n" +
            "FILTER (regex(STR(?EnglishTranslation), '" + translation2 + "', 'i'))}";

            modifiedQuery2 = modifiedQuery1.replace('}', finalquery1);
            console.log(modifiedQuery2);
        }
        else if (rightPart.toLowerCase().includes('id')) {
            // Regular expression to match "id" as standalone words (case-insensitive)
            finalquery1 = categoryfinder1 + "?CategoryReference1 <http://www.cidoc-crm.org/cidoc-crm/P2_has_type> 'ID' .\n" + 
            "?CategoryReference1 <http://www.cidoc-crm.org/cidoc-crm/P190_has_symbolic_content> ?ID .\n" +
            "FILTER (regex(STR(?ID), '" + translation2 + "', 'i'))}";

            modifiedQuery2 = modifiedQuery1.replace('}', finalquery1);
            console.log(modifiedQuery2);
        }
        else if (rightPart.toLowerCase().includes('german')) {
            // Regular expression to match "de" or "deutsche" or "german" as standalone words (case-insensitive)
            finalquery1 = categoryfinder1 + "?CategoryReference1 <http://www.cidoc-crm.org/cidoc-crm/P2_has_type> 'GermanTranslation' .\n" + 
            "?CategoryReference1 <http://www.cidoc-crm.org/cidoc-crm/P190_has_symbolic_content> ?GermanTranslation .\n" +
            "FILTER (regex(STR(?GermanTranslation), '" + translation2 + "', 'i'))}";

            modifiedQuery2 = modifiedQuery1.replace('}', finalquery1);
            console.log(modifiedQuery2);
        }
        else if(rightPart.toLowerCase().includes('category')){
            // expression to match "category" as standalone words (case-insensitive)
            finalquery1 = categoryfinder1 + "?CategoryReference1 <http://www.cidoc-crm.org/cidoc-crm/P2_has_type> 'Category' .\n" + 
            "?CategoryReference1 <http://www.cidoc-crm.org/cidoc-crm/P190_has_symbolic_content> ?Category .\n" +
            "FILTER (regex(STR(?Category), '" + translation2 + "', 'i'))}";

            modifiedQuery2 = modifiedQuery1.replace('}', finalquery1);
            console.log(modifiedQuery2);
        }
        else if(rightPart.toLowerCase().includes('italian')){
            // expression to match "category" as standalone words (case-insensitive)
            finalquery1 = categoryfinder1 + "?CategoryReference1 <http://www.cidoc-crm.org/cidoc-crm/P2_has_type> 'ItalianTranslation' .\n" + 
            "?CategoryReference1 <http://www.cidoc-crm.org/cidoc-crm/P190_has_symbolic_content> ?ItalianTranslation .\n" +
            "FILTER (regex(STR(?ItalianTranslation), '" + translation2 + "', 'i'))}";

            modifiedQuery2 = modifiedQuery1.replace('}', finalquery1);
            console.log(modifiedQuery2);
        }
        else if(rightPart.toLowerCase().includes('literature')){
            // expression to match "category" as standalone words (case-insensitive)
            finalquery1 = categoryfinder1 + "?CategoryReference1 <http://www.cidoc-crm.org/cidoc-crm/P2_has_type> 'Literature' .\n" + 
            "?CategoryReference1 <http://www.cidoc-crm.org/cidoc-crm/P190_has_symbolic_content> ?Literature .\n" +
            "FILTER (regex(STR(?Literature), '" + translation2 + "', 'i'))}";

            modifiedQuery2 = modifiedQuery1.replace('}', finalquery1);
            console.log(modifiedQuery2);
        }
        else if(rightPart.toLowerCase().includes('volume')){
            // expression to match "category" as standalone words (case-insensitive)
            finalquery1 = categoryfinder1 + "?CategoryReference1 <http://www.cidoc-crm.org/cidoc-crm/P2_has_type> 'Volume' .\n" + 
            "?CategoryReference1 <http://www.cidoc-crm.org/cidoc-crm/P190_has_symbolic_content> ?Volume .\n" +
            "FILTER (regex(STR(?Volume), '" + translation2 + "', 'i'))}";

            modifiedQuery2 = modifiedQuery1.replace('}', finalquery1);
            console.log(modifiedQuery2);
        }
        else if(rightPart.toLowerCase().includes('annotation')){
            // expression to match "category" as standalone words (case-insensitive)
            finalquery1 = categoryfinder1 + "?CategoryReference1 <http://www.cidoc-crm.org/cidoc-crm/P2_has_type> 'Annotation' .\n" + 
            "?CategoryReference1 <http://www.cidoc-crm.org/cidoc-crm/P190_has_symbolic_content> ?Annotation .\n" +
            "FILTER (regex(STR(?Annotation), '" + translation2 + "', 'i'))}";

            modifiedQuery2 = modifiedQuery1.replace('}', finalquery1);
            console.log(modifiedQuery2);
        }
        else{
            modifiedQuery2 = "We had some trouble generating the query. Click on the icon for guidelines"
        }
        return modifiedQuery2;

    }



    //console.log("Final Query: " + modifiedQuery1);
    return modifiedQuery1


}