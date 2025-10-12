"use client";

import styles from "./styles.module.css";
import useCardGame from "./hook";

export default function CardGame() {
    const { startGame, drawCard, stopGame, cards, score, message } = useCardGame();


    return (
  <div className={styles.container}>
    <div>
    <h1 className={styles.title}>미니 블랙잭 게임</h1>

    <div className={styles.score}>
      <h2>점수: {score}</h2>
      <h2>{message}</h2>
    </div>
    <div>
      <button className={styles.button} onClick={startGame}>게임시작</button>
      <button className={styles.button} onClick={drawCard}>카드뽑기</button>
      <button className={styles.button} onClick={stopGame}>멈추기</button>
    </div>

    </div>


    <div className={styles.cards}>
      {cards.map((card, index) => (
        <img key={index} src={card.image} alt={card.value} />
      ))}
    </div>

    
  </div>
);

}
