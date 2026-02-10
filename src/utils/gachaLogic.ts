// src/hooks/useGacha.ts
import { useState, useMemo } from "react";
import { Card } from "../interfaces/Card";

interface Banner {
  id: string;
  name: string;
  bannerImage: string; // URL gambar banner
  rateUpCardIds: string[]; // ID kartu yang rate up (uniqueId)
}

// Probabilitas (dalam Persen)
const RATES = {
  star5: 3.5,
  star4: 15.0,
  // Sisanya Bintang 3
};

export const useGacha = (allCards: Card[], currentPoints: number) => {
  const [points, setPoints] = useState(currentPoints);
  const [history, setHistory] = useState<Card[]>([]);
  const [lastPullResult, setLastPullResult] = useState<Card[]>([]);

  // 1. Pisahkan Kartu berdasarkan Rarity (Initial Star)
  const pool = useMemo(() => {
    return {
      star5: allCards.filter((c) => c.initial === 5),
      star4: allCards.filter((c) => c.initial === 4),
      star3: allCards.filter((c) => c.initial === 3),
    };
  }, [allCards]);

  // 2. Fungsi Ambil 1 Kartu Acak dari Array
  const getRandomCard = (cards: Card[]): Card => {
    const randomIndex = Math.floor(Math.random() * cards.length);
    return cards[randomIndex];
  };

  // 3. Logika Utama Gacha (1x Pull)
  const pullOneLogic = (rateUpIds: string[] = []): Card => {
    const rand = Math.random() * 100; // 0.00 - 99.99

    // --- Cek Dapat Bintang 5 ---
    if (rand < RATES.star5) {
      // Logika Rate Up: Jika dapat *5, ada peluang 50% (misal) itu adalah Rate Up char
      // Jika rateUpIds ada isinya
      if (rateUpIds.length > 0 && Math.random() < 0.5) {
        // Ambil dari list rate up
        const rateUpCards = pool.star5.filter((c) =>
          rateUpIds.includes(c.uniqueId),
        );
        if (rateUpCards.length > 0) return getRandomCard(rateUpCards);
      }
      // Jika tidak rate up (spook) atau gagal rate up
      return getRandomCard(pool.star5);
    }

    // --- Cek Dapat Bintang 4 ---
    if (rand < RATES.star5 + RATES.star4) {
      return getRandomCard(pool.star4.length > 0 ? pool.star4 : pool.star3); // Fallback ke *3 jika *4 kosong
    }

    // --- Sisanya Bintang 3 ---
    return getRandomCard(pool.star3);
  };

  // 4. Eksekusi Gacha
  const performGacha = (times: 1 | 10, currentBanner: Banner) => {
    const newCards: Card[] = [];

    for (let i = 0; i < times; i++) {
      const card = pullOneLogic(currentBanner.rateUpCardIds);
      newCards.push(card);
    }

    setLastPullResult(newCards);
    setHistory((prev) => [...newCards, ...prev]);
    setPoints((prev) => prev + times); // 1 pull = 1 pt

    return newCards;
  };

  return {
    points,
    performGacha,
    lastPullResult,
    history,
  };
};
