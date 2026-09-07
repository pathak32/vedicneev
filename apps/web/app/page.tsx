import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ExamTracksHub from '@/components/ExamTracksHub';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <ExamTracksHub />
      </main>
      <Footer />
    </div>
  );
}
