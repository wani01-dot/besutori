"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  get,
  ref,
  runTransaction,
  set,
} from "firebase/database";
import { db } from "../../lib/firebase";
import "../style.css";

export default function JoinRoom() {
  const router = useRouter();

  const [roomCode, setRoomCode] =
    useState("");
  const [name, setName] =
    useState("");
  const [isJoining, setIsJoining] =
    useState(false);

  async function joinAsPlayer() {
    await enterRoom("player");
  }

  async function joinAsSpectator() {
    await enterRoom("spectator");
  }

  async function enterRoom(role) {
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

    if (isJoining) {
      return;
    }

    setIsJoining(true);

    try {
      /*
        まずFirebase上に
        この部屋が存在するか確認
      */
      const roomRef = ref(
        db,
        `rooms/${cleanCode}`
      );

      const roomSnapshot =
        await get(roomRef);

      if (!roomSnapshot.exists()) {
        alert(
          "その合言葉の部屋は見つかりませんでした"
        );

        setIsJoining(false);
        return;
      }

      const room =
        roomSnapshot.val();

      /*
        すでにゲーム開始済みの場合
      */
      if (room.status !== "waiting") {
        alert(
          "この部屋はすでにゲームを開始しています"
        );

        setIsJoining(false);
        return;
      }

      /*
        観覧が禁止されている部屋
      */
      if (
        role === "spectator" &&
        !room.allowSpectators
      ) {
        alert(
          "この部屋では観覧できません"
        );

        setIsJoining(false);
        return;
      }

      const playerId =
        createPlayerId();

      /*
        回答者として参加
      */
      if (role === "player") {
        const playersRef = ref(
          db,
          `rooms/${cleanCode}/players`
        );

        const maxPlayers =
          Number(room.maxPlayers) || 6;

        /*
          Transactionを使って、
          ほぼ同時に複数人が入っても
          定員を超えないようにする。
        */
        const result =
          await runTransaction(
            playersRef,
            (currentPlayers) => {
              const players =
                currentPlayers || {};

              const playerCount =
                Object.keys(
                  players
                ).length;

              if (
                playerCount >=
                maxPlayers
              ) {
                return;
              }

              players[playerId] = {
                id: playerId,
                name: cleanName,
                role: "player",
                isHost: false,
                joinedAt:
                  Date.now(),
              };

              return players;
            }
          );

        if (!result.committed) {
          alert(
            "この部屋は回答者が満員です"
          );

          setIsJoining(false);
          return;
        }
      }

      /*
        観覧者として参加
      */
      if (role === "spectator") {
        await set(
          ref(
            db,
            `rooms/${cleanCode}/spectators/${playerId}`
          ),
          {
            id: playerId,
            name: cleanName,
            role: "spectator",
            isHost: false,
            joinedAt: Date.now(),
          }
        );
      }

      /*
        この端末自身の情報だけ
        localStorageへ保存
      */
      localStorage.setItem(
        "besutori-room",
        JSON.stringify({
          roomCode: cleanCode,
          playerId,
          playerName: cleanName,
          name: cleanName,
          role,
          isHost: false,
          maxPlayers:
            room.maxPlayers || 6,
          allowSpectators:
            room.allowSpectators ??
            false,
        })
      );

      router.push("/room");
    } catch (error) {
      console.error(
        "部屋への参加に失敗しました:",
        error
      );

      alert(
        "部屋に参加できませんでした。もう一度お試しください。"
      );

      setIsJoining(false);
    }
  }

  function createPlayerId() {
    if (
      typeof crypto !==
        "undefined" &&
      typeof crypto.randomUUID ===
        "function"
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

          <h1>
            合言葉で参加
          </h1>

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
              disabled={isJoining}
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
                setName(
                  event.target.value
                )
              }
              placeholder="名前を入力"
              maxLength={12}
              disabled={isJoining}
            />
          </div>

          <div className="joinButtons">
            <button
              type="button"
              className="joinPlayerButton"
              onClick={joinAsPlayer}
              disabled={isJoining}
            >
              <span>
                {isJoining
                  ? "参加中..."
                  : "ゲームに参加"}
              </span>

              <small>
                回答者としてプレイ
              </small>
            </button>

            <button
              type="button"
              className="spectatorButton"
              onClick={
                joinAsSpectator
              }
              disabled={isJoining}
            >
              <span>
                観覧する
              </span>

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
