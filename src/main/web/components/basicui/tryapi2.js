import { ManipulateTheQuery } from "./StringManipulation";
import { ManipulateTheQuery1 } from "./StringManipulation1";

export const performOperations = async (inputData) => {
    let inputData1= inputData+" without using PREFIX"
    const regex = /\b(Find|Get|Give)\b/gi;
    //const wordmatch =/\ben(glish)?\b/gi;
    const replacement = "Write a SPARQL query for ";
    let modifiedQuery1 ="";
    let modifiedString =""; 
    if(inputData1.toLowerCase().includes('find') || inputData1.toLowerCase().includes('get') || inputData1.toLowerCase().includes('what')){
        modifiedString = inputData1.replace(regex, replacement);
        console.log(modifiedString);
    }
    else{
        modifiedString = replacement + inputData1;
        console.log(modifiedString);
    }
    

    const url = 'https://api.cohere.ai/v1/generate';

    try{
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                authorization: 'Bearer Ulz2mRHmH2r7Lj6iGcQ9hvYH4ipt2pBsLp2d3X5T'
            },
            body: JSON.stringify({
                prompt: modifiedString,
                num_generation: 1,
                max_tokens: 184,
                temperature: 0.30,
                p: 0.80
            })
        
        });
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        const data = await response.json();
        let result = data['generations'][0]['text'];
        console.log(result);
        const modifiedQuery1 = await ManipulateTheQuery(result, inputData);
        return modifiedQuery1
    }
    catch (error) {
        console.error('Error occurred:', error);
        throw error;
    }
    
}

export default performOperations;