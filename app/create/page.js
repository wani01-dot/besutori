"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  get,
  ref,
  set,
} from "firebase/database";
import { db } from "../../lib/firebase";
import "../style.css";

export default function CreateRoom() {
  const router = useRouter();

  const [maxPlayers, setMaxPlayers] = useState(6);
  const [allowSpectators, setAllowSpectators] =
    useState(true);
  const [hostName, setHostName] = useState("");
  const [isCreating, setIsCreating] =
    useState(false);

  async function createRoom() {
    const cleanName = hostName.trim();

    if (!cleanName) {
      alert("名前を入力してください");
      return;
    }

    if (isCreating) {
      return;
    }

    setIsCreating(true);

    try {
      const roomCode =
        await createUniqueRoomCode();

      const playerId = createPlayerId();

      const roomData = {
        roomCode,
        maxPlayers,
        allowSpectators,

        status: "waiting",

        hostId: playerId,

        createdAt: Date.now(),

        players: {
          [playerId]: {
            id: playerId,
            name: cleanName,
            role: "player",
            isHost: true,
            joinedAt: Date.now(),
          },
        },

        spectators: {},
      };

      await set(
        ref(db, `rooms/${roomCode}`),
        roomData
      );

      localStorage.setItem(
        "besutori-room",
        JSON.stringify({
          roomCode,
          maxPlayers,
          allowSpectators,
          hostName: cleanName,
          playerName: cleanName,
          playerId,
          role: "player",
          isHost: true,
        })
      );

      router.push("/room");
    } catch (error) {
      console.error(
        "部屋の作成に失敗しました:",
        error
      );

      alert(
        "部屋を作成できませんでした。もう一度お試しください。"
      );

      setIsCreating(false);
    }
  }

  async function createUniqueRoomCode() {
    const words = [
      "PIZZA",
      "MANGO",
      "PANDA",
      "RAMEN",
      "LEMON",
      "SUSHI",
      "APPLE",
      "MATCHA",
      "MELON",
      "KIRIN",
    ];

    /*
      同じ合言葉の部屋がすでに存在した場合は、
      別の合言葉を探します。
    */
    for (let attempt = 0; attempt < 20; attempt++) {
      const roomCode =
        words[
          Math.floor(
            Math.random() * words.length
          )
        ];

      const snapshot = await get(
        ref(db, `rooms/${roomCode}`)
      );

      if (!snapshot.exists()) {
        return roomCode;
      }
    }

    /*
      10種類すべて使用中などの場合の予備コード。
    */
    return `ROOM${Math.floor(
      1000 + Math.random() * 9000
    )}`;
  }

  function createPlayerId() {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  }

  return (
    <main className="app">
      <section className="screen">
        <header className="screenHeader">
          <Link
            href="/"
            className="backButton"
            aria-label="戻る"
          >
            ←
          </Link>

          <h1>部屋をつくる</h1>

          <div className="headerSpace" />
        </header>

        <div className="createContent">
          <div className="formBlock">
            <label className="formLabel">
              あなたの名前
            </label>

            <input
              className="textInput"
              type="text"
              value={hostName}
              onChange={(event) =>
                setHostName(
                  event.target.value
                )
              }
              placeholder="名前を入力"
              maxLength={12}
              disabled={isCreating}
            />
          </div>

          <div className="formBlock">
            <div className="sectionTitle">
              最大回答者数を選んでください
            </div>

            <p className="sectionNote">
              最大6人まで参加できます
            </p>

            <div className="playerGrid">
              {[1, 2, 3, 4, 5, 6].map(
                (number) => (
                  <button
                    key={number}
                    type="button"
                    className={
                      maxPlayers === number
                        ? "playerNumber selected"
                        : "playerNumber"
                    }
                    onClick={() =>
                      setMaxPlayers(number)
                    }
                    disabled={isCreating}
                  >
                    {number}人
                  </button>
                )
              )}
            </div>
          </div>

          <div className="divider" />

          <div className="switchRow">
            <div>
              <div className="switchTitle">
                観覧を許可する
              </div>

              <div className="switchDescription">
                見るだけの人も部屋に参加できます
              </div>
            </div>

            <button
              type="button"
              className={
                allowSpectators
                  ? "switch on"
                  : "switch"
              }
              onClick={() =>
                setAllowSpectators(
                  !allowSpectators
                )
              }
              aria-label="観覧を許可"
              disabled={isCreating}
            >
              <span />
            </button>
          </div>

          <button
            type="button"
            className="createRoomButton"
            onClick={createRoom}
            disabled={isCreating}
          >
            {isCreating
              ? "部屋を作成中..."
              : "部屋をつくる"}
          </button>
        </div>
      </section>
    </main>
  );
}
