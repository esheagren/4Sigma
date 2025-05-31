import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Brain, Clock, Trophy } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="space-y-16 pb-16">
      <section className="py-16 px-4 text-center">
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
          <span className="text-primary-600 dark:text-primary-400">Calibrate</span> your confidence
        </h1>
        <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto mb-12 leading-relaxed">
          Four-Sigma is a game that helps you improve your ability to estimate 95% confidence intervals through interactive trivia.
        </p>
      </section>

      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard 
            icon={<Brain className="h-10 w-10 text-primary-600 dark:text-primary-400" />}
            title="Improve Your Calibration"
            description="Train yourself to create more accurate confidence intervals through repeated practice with immediate feedback."
          />
          <FeatureCard 
            icon={<Clock className="h-10 w-10 text-primary-600 dark:text-primary-400" />}
            title="Daily Challenges"
            description="Answer three new questions each day and compare your results with other players around the world."
          />
          <FeatureCard 
            icon={<Trophy className="h-10 w-10 text-primary-600 dark:text-primary-400" />}
            title="Track Your Progress"
            description="View detailed statistics and track your improvement over time on your personal dashboard."
          />
        </div>
      </section>

      <section className="py-12 bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center mb-8">How To Play</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <Step 
            number={1} 
            title="Read the question" 
            description="You'll be presented with a question that has a numerical answer." 
          />
          <Step 
            number={2} 
            title="Provide a 95% confidence interval" 
            description="Enter a lower and upper bound that you're 95% confident contains the true answer." 
          />
          <Step 
            number={3} 
            title="Submit your estimate" 
            description="After submitting, you'll see if the true answer falls within your interval." 
          />
          <Step 
            number={4} 
            title="Review your results" 
            description="Track your performance and see how you compare to others." 
          />
        </div>
      </section>

      <section className="text-center py-12">
        <h2 className="text-3xl font-bold mb-6">Ready to test your calibration?</h2>
        <Link 
          to="/daily" 
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary-600 hover:bg-primary-700 text-white font-medium text-lg transition-all transform hover:translate-y-[-2px] shadow-md hover:shadow-lg"
        >
          Start Playing Now
          <ChevronRight size={20} />
        </Link>
      </section>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-neutral-600 dark:text-neutral-300">{description}</p>
    </div>
  );
};

interface StepProps {
  number: number;
  title: string;
  description: string;
}

const Step: React.FC<StepProps> = ({ number, title, description }) => {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary-600 dark:bg-primary-500 text-white font-bold">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-1">{title}</h3>
        <p className="text-neutral-600 dark:text-neutral-300">{description}</p>
      </div>
    </div>
  );
};

export default AboutPage;