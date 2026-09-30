export const metadata = {
  title: "ベストリ",
  description: "みんなのBEST3を当てるランキングゲーム",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
