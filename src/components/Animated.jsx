import React from 'react';
import useIntersectionFade from '../hooks/useIntersectionFade';

export default function Animated({ children, className = '', style = {} }){
  const { ref, inView } = useIntersectionFade();
  return (
    <div ref={ref} className={`animated-section ${inView ? 'in-view' : ''} ${className}`} style={style}>
      {children}
    </div>
  );
}
