"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "../style.css";

export default function CreateRoom() {
  const router = useRouter();

  const [maxPlayers, setMaxPlayers] = useState(6);
  const [allowSpectators, setAllowSpectators] =
    useState(true);
  const [hostName, setHostName] = useState("");

  function createRoom() {
    const cleanName = hostName.trim();

    if (!cleanName) {
      alert("名前を入力してください");
      return;
    }

    const roomCode = createRoomCode();

    localStorage.setItem(
      "besutori-room",
      JSON.stringify({
        roomCode,
        maxPlayers,
        allowSpectators,
        hostName: cleanName,
        role: "player",
        isHost: true,
      })
    );

    router.push("/room");
  }

  function createRoomCode() {
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

    return words[
      Math.floor(Math.random() * words.length)
    ];
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
                setHostName(event.target.value)
              }
              placeholder="名前を入力"
              maxLength={12}
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
            >
              <span />
            </button>
          </div>

          <button
            type="button"
            className="createRoomButton"
            onClick={createRoom}
          >
            部屋をつくる
          </button>
        </div>
      </section>
    </main>
  );
}
