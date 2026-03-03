import FlashCard from '../models/FlashCard.js'

// import {getflashcards,getAllFlashcardSets,reviewFlashcard,toggleStarFlashcard,deleteFlashcardSet} from
// '../controllers/flashcardController.js'


export const getflashcards= async(req,res ,next )=>{
    try{
        const flashcards = await FlashCard.find({
            userId:req.user._id,
            documentId:req.params.documentId
        })
        .populate('documentId','title filename');

        res.status(200).json({
            success:true,
            count:flashcards.length,
            data:flashcards
        })

    }catch(err){
        res.status(500).json({
            success:false,
            message:"error fetching flashcard"
        })

        
    }


};

export const getAllFlashcardSets= async(req,res ,next )=>{
    try{
        const flashcardsets = await FlashCard.find({userid:req.user._id})
        .populate('documentId','title')

         res.status(200).json({
            success:true,
            count:flashcardsets.length,
            data:flashcardsets
        })

    }catch(err){
        res.status(500).json({
            success:false,
            message:"error fetching flashcards"
        })

        
    }

  


}
export const toggleStarFlashcard= async(req,res ,next )=>{
    try{
        const flashcardset = await FlashCard.findOne({
            'cards._id':req.params.cardId,
            userid:req.user._id
        });

        if(!flashcardset){
           
        res.status(404).json({
            success:false,
            message:"Flashcard set or card not found"
        })
    }

    const cardIndex = flashcardset.cards.findIndex(card => card._id.toString()===req.params.cardId);

    if(cardIndex==-1){
        return res.status(404).json({
            success:false,
            message:"card not found in set",
        })
    }

    flashcardset.cards[cardIndex].isStarred = !flashcardset.cards[cardIndex].isStarred;

    await flashcardset.save();
return res.status(200).json({
    success:true,
    data:flashcardset,
    message: `Flashcard ${flashcardset.cards[cardIndex].isStarred ? 'starred' : 'unstarred'}`
})
        

    }catch(err){
        return res.status(500).json({
            success:false,
            message:"Error is there"
        })

    }


}
export const reviewFlashcard= async(req,res ,next )=>{
    try{
        const flashcardSet = await FlashCard.findOne({
            'cards._id':req.params.cardId,
            userid:req.user._id
        })

        if(!flashcardSet){
            return res.status.json({
                success:false,
                message:"Flashcard set or card not found"
            })
        }

        const cardIndex = flashcardSet.cards.findIndex(card =>card._id.toString()===req.params.cardId);

        if(cardIndex === -1){
            return res.status(404).json({
                success:false,
                message:"Card not found in set"
            })
        }

        flashcardSet.cards[cardIndex].lastReviewed = new Date();
        flashcardSet.cards[cardIndex].reviewCount +=1

        await flashcardSet.save();

        res.status(200).json({
            success:true,
            data:flashcardSet,
            message:"flashcard reviewed successfully"
        })

    }catch(err){
           res.status(500).json({
            success:false,
          
            message:"flashcard not reviewed successfully"
        })

    }


}


export const deleteFlashcardSet= async(req,res ,next )=>{
    try{
        const flashcardSet = await FlashCard.findOne({
            _id:req.params.id,
            userid:req.user._id
        })

        if(!flashcardSet){
            return res.staus(404).json({
                success:false,
                message:'Flashcard not found'
            })
        }

        await flashcardSet.deleteOne();
         res.status(200).json({
            success:true,
            message:"FlashcardSet deleted successfully"
        })

        

    }catch(err){
        res.status(500).json({
            success:false,
            message:"error deletingflashcards"
        })


    }}