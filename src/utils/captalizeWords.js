export const captalizeWords=(word='')=>{
    if(!word) return "";
    // Replace special characters with spaces, keeping only alphanumeric and spaces
    const cleanedWord = word.replace(/[^a-zA-Z0-9\s]/g, ' ');
    // return word.charAt(0).toUpperCase()+word.slice(1).toLowerCase();
    return cleanedWord.split(" ").filter(w => w).map(w=> w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(" ");
}
