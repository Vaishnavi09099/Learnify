export const chunkText =(text,chunkSize=300,overlap=50)=>{
    if(!text || text.trim().length==0) return [];
    const cleanedText = text.replace(/\n/g,"").trim();
    const words = cleanedText.split(/\s+/)
    const chunks = []
    for(let i=0;i<words.length;i+=(chunkSize-overlap)){
        const chunkWords = words.slice(i,i+chunkSize);
        chunks.push({
            content:chunkWords.join(" "),
            chunkIndex:chunks.length


        })

    }
    return chunks;


}

export const findRelevantChunks =(chunks,query,maxChunks=3)=>{
    if(!chunks || chunks.length === 0 || !query) return [];
    const queryWords = query.toLowerCase().split(/\s+/);
    const scoredChunks = chunks.map((chunk)=>{
        const content = chunk.content.toLowerCase();
        let score = 0;
        queryWords.forEach(word=>{
            if(content.includes(word)){
                score++;
            }

        });

        return{...chunk,score}

    })
    const matched = scoredChunks
    .filter(chunk => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks);


return matched.length > 0 ? matched : chunks.slice(0, maxChunks);

}
export default chunkText;