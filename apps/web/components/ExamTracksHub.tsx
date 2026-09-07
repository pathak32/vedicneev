import Link from 'next/link';
import { BookOpen, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ExamTracksHub() {
  const tracks = [
    {
      title: "JNVST (Navodaya)",
      subtitle: "Jawahar Navodaya Vidyalaya Selection Test",
      classes: ["Class 6", "Class 9 Lateral"],
      description: "Complete preparation matching official blueprint ratios: Mental Ability, Arithmetic, and Language.",
      color: "amber",
      link: "/sprints"
    },
    {
      title: "AISSEE (Sainik School)",
      subtitle: "All India Sainik School Entrance Examination",
      classes: ["Class 6", "Class 9"],
      description: "Rigorous coverage across Mathematics, Intelligence, Language, General Science, and Social Studies.",
      color: "blue",
      link: "/sprints"
    },
    {
      title: "RMS (Military School)",
      subtitle: "Rashtriya Military School Common Entrance Test",
      classes: ["Class 6", "Class 9"],
      description: "Advanced testing modules aligned with military school pattern, interview prep metrics, and time limits.",
      color: "purple",
      link: "/sprints"
    }
  ];

  return (
    <section className="py-20 bg-gray-50/50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Interactive Core Curriculum
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Choose Your Target Board & Class Tier
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Select your entrance exam track below to access specialized mock series, PYQ archives, and weekly scholarship sprints[cite: 1].
          </p>
        </div>

        {/* Dynamic Exam Track Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tracks.map((track, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-gray-100 text-gray-800">
                    {track.subtitle.split(' ')[0]} Track
                  </span>
                  <div className="flex gap-1.5">
                    {track.classes.map((c, cIdx) => (
                      <span key={cIdx} className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <h3 className="text-xl font-extrabold text-gray-900">{track.title}</h3>
                <p className="text-xs text-gray-500 font-medium">{track.subtitle}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{track.description}</p>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100">
                <Link
                  href={track.link}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all gap-2 group"
                >
                  Explore {track.title.split(' ')[0]} Sprints & Mocks
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
