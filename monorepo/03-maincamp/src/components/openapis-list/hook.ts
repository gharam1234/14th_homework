import {  useState } from "react";
import { ICard } from "./types";


export default function useCardGame() {

    const [deckId, setDeckId] = useState("");
    const [cards, setCards] =useState<ICard[]>([])
    const [score, setScore] =useState(0)
    const [message, setMessage] = useState("")

    const calculateScore = (cards:ICard[]):number => {
        let score = 0;
        let aceCount = 0;

        cards.forEach((card) => {
            const cardValue = card.value;
            if(["JACK", "QUEEN", "KING"].includes(cardValue)){
                score += 10;
            }
            else if(cardValue ==="ACE"){
                score += 11;
                aceCount += 1;
            }else{
                score += Number(cardValue);

            }
        })
        for (let i= 0; i < aceCount; i++){
            if(score >21) score -= 10;
        }
  
        return score
    }

    const startGame = async () => {
        const response = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1");
        const data = await response.json();
        setDeckId(data?.deck_id);
        setCards([]);
        setScore(0);
        setMessage("");
    }
    const drawCard = async () => {
        const response = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
        const data = await response.json();
        const newCards = [...cards, ...data?.cards || []];
        setCards(newCards);
        const newScore = calculateScore(newCards);
        setScore(newScore);

        if(newScore>21) setMessage(" 21점을 초과했습니다!")
        else if(newScore === 21) setMessage("21점! 축하합니다!")
        else setMessage("")

    }
    const stopGame =()=>{
        setMessage(`최종점수 : ${score}`)
    }

    return(
        {deckId,
        cards,
        score,
        message,
        startGame,
        drawCard,
        stopGame
        }
        
    )

}