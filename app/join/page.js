"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "../style.css";

export default function JoinRoom() {
  const router = useRouter();

  const [roomCode, setRoomCode] = useState("");
  const [name, setName] = useState("");

  function joinAsPlayer() {
    enterRoom("player");
  }

  function joinAsSpectator() {
    enterRoom("spectator");
  }

  function enterRoom(role) {
    const cleanCode = roomCode
      .trim()
      .toUpperCase();

    const cleanName = name.trim();

    if (!cleanCode) {
      alert("合言葉を入力してください");
      return;
    }

    if (!cleanName) {
      alert("名前を入力してください");
      return;
    }

    localStorage.setItem(
      "besutori-room",
      JSON.stringify({
        roomCode: cleanCode,
        hostName: "ホスト",
        name: cleanName,
        role,
        isHost: false,
        maxPlayers: 6,
        allowSpectators: true,
      })
    );

    router.push("/room");
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

          <h1>合言葉で参加</h1>

          <div className="headerSpace" />
        </header>

        <div className="joinContent">
          <div className="joinIntro">
            <div className="joinKeyIcon">
              ⌕
            </div>

            <h2>
              部屋に参加しよう
            </h2>

            <p>
              ホストから教えてもらった
              <br />
              合言葉を入力してください
            </p>
          </div>

          <div className="formBlock">
            <label className="formLabel">
              合言葉
            </label>

            <input
              className="textInput roomCodeInput"
              type="text"
              value={roomCode}
              onChange={(event) =>
                setRoomCode(
                  event.target.value
                    .toUpperCase()
                    .replace(
                      /[^A-Z0-9]/g,
                      ""
                    )
                )
              }
              placeholder="PIZZA"
              maxLength={10}
              autoCapitalize="characters"
            />
          </div>

          <div className="formBlock">
            <label className="formLabel">
              あなたの名前
            </label>

            <input
              className="textInput"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="名前を入力"
              maxLength={12}
            />
          </div>

          <div className="joinButtons">
            <button
              type="button"
              className="joinPlayerButton"
              onClick={joinAsPlayer}
            >
              <span>ゲームに参加</span>
              <small>
                回答者としてプレイ
              </small>
            </button>

            <button
              type="button"
              className="spectatorButton"
              onClick={joinAsSpectator}
            >
              <span>観覧する</span>
              <small>
                見るだけで参加
              </small>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
