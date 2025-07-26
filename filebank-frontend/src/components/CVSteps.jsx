import { CheckCircle, LayoutTemplate, TextCursorInput, Briefcase } from 'lucide-react';

const tips = [
  {
    icon: <LayoutTemplate className="text-blue-600 w-6 h-6" />,
    title: 'Use a clean layout',
    desc: 'Ensure your CV has clear sections: Contact, Summary, Experience, Education.',
  },
  {
    icon: <TextCursorInput className="text-green-600 w-6 h-6" />,
    title: 'Tailor to the job',
    desc: 'Highlight relevant skills and achievements for each role you apply for.',
  },
  {
    icon: <Briefcase className="text-indigo-600 w-6 h-6" />,
    title: 'Quantify impact',
    desc: 'Use numbers and results: “Increased sales by 35% in 6 months.”',
  },
  {
    icon: <CheckCircle className="text-purple-600 w-6 h-6" />,
    title: 'Keep it short',
    desc: '1–2 pages is ideal. Be concise and cut fluff.',
  },
];

const CVSteps = () => (
  <section className="py-16 px-6 bg-white">
    <div className="max-w-5xl mx-auto text-center">
      <h2 className="text-3xl font-semibold mb-8">How to Create a Powerful CV</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-4 p-4 rounded-lg shadow-md bg-gray-50">
            {tip.icon}
            <div>
              <h4 className="font-bold text-lg">{tip.title}</h4>
              <p className="text-gray-600">{tip.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default CVSteps;
