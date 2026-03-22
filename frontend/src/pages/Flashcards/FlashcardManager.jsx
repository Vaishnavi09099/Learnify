import React, { useState, useEffect } from "react";
import { Sparkles, ChevronLeft, ChevronRight, Trash2, Brain, BrainCircuit } from "lucide-react";
import toast from "react-hot-toast";
import flashcardService from "../../services/flashcardService.js";
import aiService from "../../services/aiService";
import { RotateCcw } from "lucide-react"

const FlashcardManager = ({ documentId }) => {

  // ===== STATES =====
  const [flashcardSets, setFlashcardSets] = useState([]);   
  const [selectedSet, setSelectedSet] = useState(null);     
  const [loading, setLoading] = useState(true);             
  const [generating, setGenerating] = useState(false);      
  const [currentCardIndex, setCurrentCardIndex] = useState(0); 
  const [isFlipped, setIsFlipped] = useState(false); 
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [setToDelete, setSetToDelete] = useState(null);      

  // ===== FETCH FLASHCARDS =====
  useEffect(() => {
    if (documentId) fetchFlashcardSets();
  }, [documentId]);

  const fetchFlashcardSets = async () => {
    setLoading(true);
    try {
      const response = await flashcardService.getFlashcardsForDocument(documentId);
      setFlashcardSets(response.data);
    } catch (error) {
      toast.error("Failed to fetch flashcard sets.");
    } finally {
      setLoading(false);
    }
  };


  const handleGenerateFlashcards = async () => {
    setGenerating(true);
    try {
      await aiService.genrateFlashcards(documentId);
      toast.success("Flashcards generated successfully!");
      fetchFlashcardSets(); 
    } catch (error) {
      toast.error("Failed to generate flashcards.");
    } finally {
      setGenerating(false);
    }
  };

  const handleNextCard = () => {
  setIsFlipped(false);
  if (currentCardIndex < selectedSet.cards.length - 1) {
    setCurrentCardIndex(currentCardIndex + 1);
  }
};

const handlePrevCard = () => {
  setIsFlipped(false);
  if (currentCardIndex > 0) {
    setCurrentCardIndex(currentCardIndex - 1);
  }
};


const handleDeleteRequest = (e, setId) => {
  e.stopPropagation();
  setSetToDelete(setId);
  setDeleteModalOpen(true);
};


const handleConfirmDelete = async () => {
  try {
    await flashcardService.deleteFlashcardSet(setToDelete);
    toast.success("Deleted!");
    fetchFlashcardSets();
    if (selectedSet?._id === setToDelete) setSelectedSet(null);
  } catch (error) {
    toast.error("Failed to delete.");
  } finally {
    setDeleteModalOpen(false);
    setSetToDelete(null);
  }
};


const handleToggleStar = async (e, cardId) => {
  e.stopPropagation(); 
  try {
    await flashcardService.toggleStar(cardId);
  
    const updatedCards = selectedSet.cards.map(card =>
      card._id === cardId ? { ...card, isStarred: !card.isStarred } : card
    );
    setSelectedSet({ ...selectedSet, cards: updatedCards });
  } catch (error) {
    toast.error("Failed to star card.");
  }
};

  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

 
  if (selectedSet) {
    const currentCard = selectedSet.cards[currentCardIndex];
    return (
      <div className="p-6  rounded-xl bg-white shadow-xl">
      
        <button onClick={() => setSelectedSet(null)} className="flex items-center gap-2 mb-4 text-gray-600">
          <ChevronLeft size={18} /> Back to Sets
        </button>

       
       
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`relative rounded-2xl shadow-lg p-10 text-center cursor-pointer min-h-[280px]  flex flex-col items-center justify-center transition-all duration-200
            ${isFlipped ? "bg-green-500 text-white" : "bg-white border border-gray-200 text-gray-800"}`}
        >
           
            {!isFlipped && (
            <span className="absolute top-4 left-4 text-xs font-bold uppercase bg-gray-100 text-gray-500 px-3 py-1 rounded-md">
              {currentCard.difficulty || "Easy"}
            </span>
          )}

       
       <button
  onClick={(e) => handleToggleStar(e, currentCard._id)}
  className={`absolute top-4 right-4 p-1 px-2 shadow-sm rounded-xl
    ${currentCard.isStarred ? "bg-orange-400 text-white" : "bg-gray-200 text-gray-400"}`}
>
  ★
</button>
          <p className="text-lg font-semibold">
            {isFlipped ? currentCard.answer : currentCard.question}
          </p>
           <p className={`mt-6  flex items-center gap-1 text-sm ${isFlipped ? "text-green-100" : "text-gray-400"}`}> <RotateCcw size={13} />
            {isFlipped ? "Click to see question" : "Click to reveal answer"}
          </p>
        </div>

       
         

      
        <div className="flex mt-8 justify-center items-center  gap-4  mt-4">
          <button onClick={handlePrevCard} className="px-4 py-2 text-gray-700 bg-gray-100 flex items-center rounded-xl shadow-sm  font-semibold">
            <ChevronLeft size={16} strokeWidth={3}/> Previous
          </button>
           <p className=" text-gray-500 px-4 py-2 font-semibold shadow-sm bg-gray-100 rounded-xl  ">
           {currentCardIndex + 1} / {selectedSet.cards.length}
        </p>

          <button onClick={handleNextCard} className="px-4 py-2 text-gray-700 flex items-center font-semibold  bg-gray-100 shadow-sm rounded-xl">
           Next <ChevronRight size={16} strokeWidth={3} /> 
          </button>
        </div>
      </div>
    );
  }



 
  return (
    <div className=" bg-white rounded-xl shadow-lg m-4">
    
       {deleteModalOpen && (
  <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
    <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-sm">
      <p className="font-bold text-lg mb-2">Delete Flashcard Set?</p>
      <p className="text-gray-500 text-sm font-semibold mb-6">Are you sure? This action cannot be undone.</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={() => setDeleteModalOpen(false)}
          className="px-4 py-2 rounded-xl border border-gray-400 shadow-sm text-gray-600 font-semibold"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirmDelete}
          className="px-4 py-2 rounded-xl bg-red-500 shadow-sm text-white font-semibold"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
  
   
      {flashcardSets.length === 0 ? (
        <div className=" flex flex-col p-20 gap-2 items-center justify-center ">
          <div className=" rounded-xl mb-3 bg-green-400/70 shadow-md p-3 text-green-900/80">
             <Brain size={30} className="" />

          </div>
         
          <p className="font-bold text-lg">No Flashcards Yet</p>
          <p className="text-sm font-semibold mb-3 text-center text-gray-700/70">Generate flashcards from your document to start learning and reinforce your knowledge.</p>
              <button
        onClick={handleGenerateFlashcards}
        disabled={generating}
        className="flex items-center cursor-pointer gap-2 bg-green-700 text-white/90 px-4 py-2 rounded-xl mb-6 shadow-md font-semibold "
      >
        <Sparkles size={18} />
        {generating ? "Generating..." : "Generate Flashcards"}
      </button>

        </div>
      ) : (
        <div className="flex flex-col h-[50vh]">
             <div className="flex justify-between items-center p-5">
      <div>
 <p className="font-bold text-xl">Your Flashcard Sets</p>
        <p className="text-sm text-gray-400">{flashcardSets.length} sets available</p>
      </div>
      <button
        onClick={handleGenerateFlashcards}
        disabled={generating}
        className="flex items-center cursor-pointer gap-2 bg-green-700 text-white/90 px-4 py-2 rounded-xl mb-6 shadow-md font-semibold"
      >
        <Sparkles size={18} />
        {generating ? "Generating..." : "Generate New Set"}
      </button>
    </div>


    <div>
        <div className="flex gap-4 p-6">
          {flashcardSets.map((set,index) => (
            <div
              key={set._id}
              onClick={() => { setSelectedSet(set); setCurrentCardIndex(0); setIsFlipped(false); }}
              className=" border  hover:-translate-y-1 transition-all duration-300 rounded-xl p-2 w-80 border-gray-300 shadow-sm"
            >
                <div className="flex justify-between p-2">
                    <div className="p-3 rounded-xl bg-green-400/70 shadow-md">
                         <Brain  size={24}/>
                    </div>
                  
                    <button
  onClick={(e) => handleDeleteRequest(e, set._id)}
  className="text-red-400 hover:text-red-600"
>
  <Trash2 size={18} />
</button>
                    
                </div>
                <div className=" border-b-1 border-gray-400/20 py-3  px-2">
                       <p className="font-bold">Flashcard Set {index + 1}</p>
  <p className="text-xs text-gray-400 mt-1 font-semibold"> CREATED {new Date(set.createdAt).toLocaleDateString()}</p>

                </div>
                <div className="border-green-600/50 border w-25  flex text-center justify-center px-3 py-1 rounded-md m-3 shadow-md bg-green-300/40 text-green-800  ">
                    

                <p className="font-bold    ">{set.cards.length} Cards</p>
                </div>

              
            </div>
          ))}
        </div>

    </div>

        </div>
            


     
       
      )}
    </div>
  );
};

export default FlashcardManager;