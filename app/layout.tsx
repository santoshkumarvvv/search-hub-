import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Santosh Anime Hub — Hindi Dubbed Anime Watching Website',
  description: 'संतोष द्वारा बनाया गया भारत का नंबर 1 हिंदी डब्ड एनीमे और मूवीज स्ट्रीमिंग प्लेटफॉर्म। देखें Action, Fantasy, Adventure और और भी बहुत कुछ।',
  keywords: 'Santosh Anime Hub, Hindi Dubbed Anime, Anime in Hindi, Demon Slayer Hindi, One Piece Hindi, Naruto Hindi',
  authors: [{ name: 'Santosh' }],
  creator: 'Santosh',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" className="dark">
      <body className="min-h-screen bg-ink text-gray-100 antialiased selection:bg-accent selection:text-black">
        {children}
      </body>
    </html>
  );
}
