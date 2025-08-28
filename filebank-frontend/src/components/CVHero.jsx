import React, { useState, useEffect } from 'react';
import { Lightbulb, UserCheck } from 'lucide-react';
import {Link} from 'react-router-dom' ;
import Page from './Page';
const typingTexts = [
  'Step-by-step guidance.',
  'Professional tips.',
  'Ready to impress.',
];

const CVHero = () => {
  const [displayedText, setDisplayedText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = typingTexts[textIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayedText(currentText.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
        if (charIndex + 1 === currentText.length) {
          setIsDeleting(true);
        }
      } else {
        setDisplayedText(currentText.slice(0, charIndex - 1));
        setCharIndex(charIndex - 1);
        if (charIndex - 1 < 0) {
          setIsDeleting(false);
          setTextIndex((textIndex + 1) % typingTexts.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex]);

  return (
    <section className="bg-gradient-to-br from-blue-50 to-purple-100 py-20 text-center">
      <Link to='/dashboard' >Back</Link>
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Build a CV That Gets You Hired</h1>
        <p className="text-xl text-gray-700 mb-6 h-10">
          <span className="inline-block animate-pulse">{displayedText}</span>
          <span className="border-r-2 border-gray-700 animate-blink ml-1" />
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <Lightbulb className="text-yellow-500 w-8 h-8" />
          <UserCheck className="text-green-600 w-8 h-8" />
        </div>
      </div>
      <Page/>
    </section>
  );
};

export default CVHero;
