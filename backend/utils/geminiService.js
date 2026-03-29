import dotenv from 'dotenv'
import { GoogleGenAI } from '@google/genai'

dotenv.config()

const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});

if(!process.env.GEMINI_API_KEY){
    console.log("GEMINI api key is not set in the environment variables! please check!")
    process.exit(1);
}

export const generateFlashCards = async(text,count=10)=>{
    const safeText = text && String(text).trim();
    if (!safeText) {
        throw new Error("Provided text is empty");
    }
    const prompt = `Generate exactly ${count} educational flashcards from the following text.
    Format each flashcard as:
    Q:[Clear,specific question]
    A:[Concise,accurate answer]
    D:[Difficulty level:easy,medium or hard]
    Separate each flashcard with "---"
    Text: ${safeText.substring(0,15000)}`;

    try{
        const response = await ai.models.generateContent({
            model:"gemini-2.5-flash-lite",
            contents:prompt,

        })
        const generatedText = response.text;

        const flashcards = [];
        const cards = generatedText.split('---').filter(c=>c.trim());

        for(const card of cards){
            const lines = card.trim().split('\n');
            let question='',answer='',difficulty='medium';
            for(const line of lines){
                if(line.startsWith("Q:")){
                    question = line.slice(2).trim();
                }else if(line.startsWith("A:")){
                    answer = line.slice(2).trim();
                }else if(line.startsWith("D:")){
                    difficulty = line.slice(2).trim().toLowerCase();

                }
            }
            if(question && answer){
                flashcards.push({question,answer,difficulty});
            }
        }
        return flashcards.slice(0,count);

    }catch(err){
        console.log("Gemini API error: ",err);
        throw new Error("Failed to genrate flashcards");
    }
};


export const generateQuiz = async(text,numQuestions = 5)=>{
    const safeText = text && String(text).trim();
    if (!safeText) {
        throw new Error("Provided text is empty");
    }
    const prompt = `Generate exactly ${numQuestions} multiple choice questions from the following text.
    Format each question as:
    Q: [Question],
    01:[Option 1]
    02:[Option 2]
    03:[Option 3]
    04:[Option 4]
    C:[Correct option-exactly as written above]
    E:[Brief explanation]
    D:[Difficulty:easy,medium,or hard]
    Separate questions with "---"
    
    Text:${safeText.substring(0,15000)}`;

    try{
        const response = await ai.models.generateContent({
            model:"gemini-2.5-flash-lite",
            contents:prompt
        })


        const generatedtext = response.text;
        const questions = [];
        const questionBlocks = generatedtext.split("---").filter(q=>q.trim())
        for(const block of questionBlocks){
            const lines = block.trim().split('\n');
            let question ='',options=[],correctAnswer='',explanation='',difficulty='medium';

            for(const line of lines){
                const t = line.trim();
                if(t.startsWith("Q:")){
                    question = t.slice(2).trim();

                }else if(t.match(/^0\d:/)){
                    options.push(t.slice(3).trim());
                }else if(t.startsWith("C:")){
                    correctAnswer=t.slice(2).trim();
                }else if(t.startsWith("D:")){
                    difficulty = t.slice(2).trim().toLowerCase();
                }else if(t.startsWith("E:")){
                    explanation = t.slice(2).trim();
                }



            }

            if(question && options.length===4 && correctAnswer){
                questions.push({question,options,correctAnswer,explanation,difficulty})
            }
        }
        return questions.slice(0,numQuestions);

    }catch(err){
        console.log(("Gemini api error: ",err));
        throw new Error("Failed to generate quiz")

    }
}


export const generateSummary = async(text)=>{
    const safeText = text && String(text).trim();
    if (!safeText) {
        throw new Error("Provided text is empty");
    }
    const prompt = `Provide a concise summary of the following text ,highlighting the key concepts,main ideas and important points.Keep the summary clear and structured
    Text: ${safeText.substring(0,20000)}
    `

    try{
          const response = await ai.models.generateContent({
            model:"gemini-2.5-flash-lite",
            contents:prompt
        })


        const generatedtext = response.text;

        return generatedtext;
        

    }catch(err){

         console.log(("Gemini api error: ",err));
        throw new Error("Failed to generate summary")

    
    }
}

export const chatWithContext = async(question,chunks)=>{
    if (!question || !String(question).trim()) {
        throw new Error("Question is empty");
    }

    if (!Array.isArray(chunks)) {
        chunks = [];
    }

    // Normalize possible chunk shapes:
    // - expected: { content, chunkIndex }
    // - legacy/fallback: { text }
    const normalizedChunks = chunks.map((c) => {
        const content =
            c && (c.content ?? c.text) !== undefined
                ? String(c.content ?? c.text)
                : "";
        return { content };
    });

    const nonEmptyChunks = normalizedChunks.filter((c) => c.content.trim().length > 0);

    const context = nonEmptyChunks
        .map((c, i) => `[Chunk ${i + 1}]\n${c.content}`)
        .join('\n\n');

    if (!context.trim()) {
        console.log("⚠️ Gemini chat context is empty; skipping model call", {
            questionPreview: String(question).slice(0, 80),
            chunksTotal: chunks.length,
            chunksNonEmpty: nonEmptyChunks.length
        });
        return "I couldn't find any extractable text in this document to answer your question.";
    }

    console.log("🤖 Gemini chat prompt context lengths", {
        questionLen: String(question).length,
        contextLen: context.length,
        chunksUsed: nonEmptyChunks.length
    });

    const prompt = `Based on the following context from a document,Analyse the context and answer the user's question.If the answer is not in the context ,say so
    Context: ${context}
    Question:${question}
    Answer:`

    

    try{
          const response = await ai.models.generateContent({
            model:"gemini-2.5-flash-lite",
            contents:prompt
        })


        const generatedtext = response.text;

        return generatedtext;
        

    }catch(err){

         console.log(("Gemini api error: ",err));
        throw new Error("Failed to generate chat request")

    
    }
}
export const explainConcept = async (concept, context) => {
    const safeConcept = concept && String(concept).trim();
    const safeContext = context && String(context).trim();

    if (!safeConcept) {
        throw new Error("Concept is empty");
    }

    if (!safeContext) {
        console.log("⚠️ Gemini explainConcept called with empty context", {
            conceptPreview: safeConcept.slice(0, 80)
        });
        return "I couldn't find any extractable text in this document to explain that concept.";
    }

    const prompt = `Explain the concept of ${safeConcept} based on the following context. Provide a clear, educational explanation that's easy to understand. Include examples if relevant.
    Context: ${safeContext.substring(0, 10000)}`

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt
        })
        return response.text;

    } catch (err) {
        console.log("Gemini api error:", err);
        throw new Error("Failed to explain concept")
    }
}
