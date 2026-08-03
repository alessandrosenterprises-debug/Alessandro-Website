import { useEffect, useRef, useState } from 'react';

export default function useIntersectionFade(options){
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(()=>{
    const el = ref.current;
    if(!el) return;
    if(inView) return;
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){ setInView(true); obs.unobserve(entry.target); }
      });
    }, options || { threshold: 0.12 });
    obs.observe(el);
    return ()=> obs.disconnect();
  }, [ref.current, inView]);

  return { ref, inView };
}
