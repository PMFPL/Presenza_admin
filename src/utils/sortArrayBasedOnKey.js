export const sortArrayBasedOnKey=(data=[],key)=>{
    if(!Array.isArray(data)) return [];
    return [...data].sort((a,b)=>{
        const A=a[key] ?? 0;
        const B=b[key] ?? 0;
        return B-A;
    })
}