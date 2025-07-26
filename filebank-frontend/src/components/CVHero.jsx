import Typing from 'react-typing-effect';
import { Lightbulb, UserCheck } from 'lucide-react';

const CVHero = () => (
  <section className="bg-gradient-to-br from-blue-50 to-purple-100 py-20 text-center">
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-4xl md:text-6xl font-bold mb-4">Build a CV That Gets You Hired</h1>
      <p className="text-xl text-gray-700 mb-6">
        <Typing
          text={['Step-by-step guidance.', 'Professional tips.', 'Ready to impress.']}
          speed={60}
          eraseDelay={1500}
        />
      </p>
      <div className="flex justify-center gap-4">
        <Lightbulb className="text-yellow-500 w-8 h-8" />
        <UserCheck className="text-green-600 w-8 h-8" />
      </div>
    </div>
  </section>
);

export default CVHero;
