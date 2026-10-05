import Link from "next/link";
import "../style.css";

export default function HowToPage() {
  return (
    <main className="app">
      <section className="screen howToScreen">
        <header className="howToPageHeader">
          <Link
            href="/"
            className="howToBackButton"
            aria-label="ホームに戻る"
          >
            ‹
          </Link>

          <div>
            <span className="howToPageEnglish">
              HOW TO PLAY
            </span>

            <h1>遊び方</h1>
          </div>

          <div className="howToHeaderSpace" />
        </header>

        <div className="howToPageContent">
          <div className="howToIntro">
            <div className="howToIntroCrown">
              ♛
            </div>

            <h2>
              相手のBEST3を
              <br />
              当てよう！
            </h2>

            <p>
              出題者の好みを予想して、
              <br />
              3つの選択肢を順位に並べるゲームです。
            </p>
          </div>

          <div className="howToPageSteps">
            <HowToStep
              number="1"
              title="出題者がBEST3をつくる"
              text="好きな食べ物や行きたい場所など、お題を決めて「自分の1位・2位・3位」を入力します。"
              className="howToStep1"
            />

            <HowToStep
              number="2"
              title="みんなで順位を予想する"
              text="出題者が選んだ3つが、順番を隠して表示されます。「この人ならこれが1位かも！」と予想して、1位〜3位に並べます。"
              className="howToStep2"
            />

            <HowToStep
              number="3"
              title="答え合わせ！"
              text="全員が回答したら、本当のBEST3を発表。出題者の順位をどれだけ当てられたかチェックします。"
              className="howToStep3"
            />

            <HowToStep
              number="4"
              title="出題者を交代して次のお題へ"
              text="次の人が新しいお題とBEST3をつくります。"
              className="howToStep4"
            />
          </div>

          <div className="howToPageMessage">
            お互いの
            <strong>
              「意外と知らなかった好き」
            </strong>
            が見えてくるゲームです。
          </div>

          <Link
            href="/"
            className="howToHomeButton"
          >
            ホームへ戻る
          </Link>
        </div>
      </section>
    </main>
  );
}

function HowToStep({
  number,
  title,
  text,
  className,
}) {
  return (
    <div
      className={`howToStep ${className}`}
    >
      <div className="howToNumber">
        {number}
      </div>

      <div className="howToStepText">
        <h3>{title}</h3>

        <p>{text}</p>
      </div>
    </div>
  );
}
