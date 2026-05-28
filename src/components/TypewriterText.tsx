import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ text }) => {
  const [displayText, setDisplayText] = useState("");
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, 40); // سرعة الكتابة (بالملي ثانية)
    return () => clearInterval(timer);
  }, [text]);
  return <>{displayText}</>;
};

export default TypewriterText;