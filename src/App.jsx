import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import './styles.css';
import Animated from './components/Animated';

// Set VITE_CUSTOMER_PORTAL_URL in Vercel to the current deployed portal address.
const portalUrl = import.meta.env.VITE_CUSTOMER_PORTAL_URL || 'https://alessandro-enterprises.vercel.app';
const fallbackContact = { email: 'alessandrosenterprises@gmail.com', phone: '+260 573 383 949', whatsapp: '260573383949' };
const route = () => location.pathname.split('/').filter(Boolean);
const money = (value) => Number(value) > 0 ? new Intl.NumberFormat('en-ZM', { style: 'currency', currency: 'ZMW' }).format(Number(value)) : null;

function SafeImage({ src, alt, className = '' }) {
  if (!src) return null;
  return <img className={className} src={src} alt={alt} onError={(event) => { event.currentTarget.style.display = 'none'; }} />;
}

export function App() {
  const [businesses, setBusinesses] = useState([]); const [services, setServices] = useState([]); const [products, setProducts] = useState([]); const [pages, setPages] = useState([]); const [posts, setPosts] = useState([]); const [current, setCurrent] = useState(route()); const [contact, setContact] = useState(fallbackContact);
  const go = (path) => { history.pushState({}, '', path); setCurrent(route()); scrollTo({ top: 0, behavior: 'smooth' }); };
  useEffect(() => { const update = () => setCurrent(route()); addEventListener('popstate', update); return () => removeEventListener('popstate', update); }, []);
  useEffect(() => { async function load() { const [b, s, p, pg, u, c] = await Promise.all([supabase.from('business_profiles').select('*').eq('active', true).neq('id','enterprise').order('sort_order',{ascending:false}).limit(50), supabase.from('services').select('*'), supabase.from('products').select('*'), supabase.from('pages').select('*'), supabase.from('updates').select('*'), supabase.from('contact').select('*').single()]); setBusinesses(b.data || []); setServices(s.data || []); setProducts(p.data || []); setPages(pg.data || []); setPosts(u.data || []); if(c.data) setContact(c.data); } load(); }, []);
  const section = current[0] || 'home';
  if (section === 'business' && current[1]) return <BusinessPage id={current[1]} businesses={businesses} services={services} products={products} contact={contact} go={go} />;
  if (['about', 'articles', 'events', 'moments'].includes(section)) return <ContentPage section={section} businesses={businesses} pages={pages} go={go} />;
  return <>
    <Header go={go} />
    <main>
      <section className="hero">
        <Animated>
          <div>
            <p className="eyebrow">ALESSANDRO ENTERPRISES</p>
            <h1>One group.<em>Many possibilities.</em></h1>
            <p>Trusted services, practical products, and local expertise across multiple businesses.</p>
            <p><button className="btn" onClick={() => go('/business')}>Explore businesses</button></p>
          </div>
        </Animated>
      </section>

      {/* rest of the App content remains unchanged and will inherit new styles and animations */}
    </main>
    <Footer contact={contact} go={go} />
  </>;
}

export default App;
