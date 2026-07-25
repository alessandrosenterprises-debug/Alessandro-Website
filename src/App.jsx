import { useEffect, useState } from 'react';
import { supabase } from './supabase';

const portalUrl = 'https://alessandro-enterprises.vercel.app';
const fallbackHome = {
  headline: 'One group. Many possibilities.',
  subheadline: 'Professional services, practical solutions, and trusted support—brought together under one brand.',
  cta: 'About Alessandro',
};
const fallbackContact = { email: 'alessandrosenterprises@gmail.com', phone: '0530383949', whatsapp: '0768148043' };
const currentRoute = () => window.location.pathname.split('/').filter(Boolean);

export function App() {
  const [services, setServices] = useState([]);
  const [pages, setPages] = useState([]);
  const [posts, setPosts] = useState([]);
  const [home, setHome] = useState(fallbackHome);
  const [contact, setContact] = useState(fallbackContact);
  const [route, setRoute] = useState(currentRoute());
  const go = (path) => { window.history.pushState({}, '', path); setRoute(currentRoute()); window.scrollTo(0, 0); };

  useEffect(() => {
    const onPopState = () => setRoute(currentRoute());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    async function load() {
      const [serviceResult, pageResult, postResult, settingsResult] = await Promise.all([
        supabase.from('services').select('id,name,description,long_description,price,category').eq('active', true).is('deleted_at', null).order('name'),
        supabase.from('public_content_items').select('*').eq('published', true).order('created_at', { ascending: false }),
        supabase.from('content_posts').select('*').eq('published', true).order('created_at', { ascending: false }),
        supabase.from('website_content').select('key,value').in('key', ['home', 'contact']),
      ]);
      setServices(serviceResult.data ?? []);
      setPages(pageResult.data ?? []);
      setPosts(postResult.data ?? []);
      const values = Object.fromEntries((settingsResult.data ?? []).map((item) => [item.key, item.value]));
      setHome({ ...fallbackHome, ...(values.home ?? {}) });
      setContact({ ...fallbackContact, ...(values.contact ?? {}) });
    }
    void load();
  }, []);

  if (route[0] === 'service' && route[1]) return <ServicePage id={route[1]} services={services} contact={contact} go={go} />;
  if (['about', 'articles', 'events', 'moments'].includes(route[0])) return <ContentPage section={route[0]} pages={pages} services={services} go={go} />;

  return <>
    <Header services={services} go={go} />
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">ALESSANDRO ENTERPRISES</p>
          <h1>{home.headline.split('. ').map((part, index) => <span key={part}>{index > 0 && <br />}{index === 1 ? <em>{part}</em> : part}</span>)}</h1>
          <p>{home.subheadline}</p>
          <button className="gold-button" onClick={() => go('/about')}>{home.cta}</button>
        </div>
        <img src="/alessandro-enterprises-logo.png" alt="Alessandro Enterprises" />
      </section>
      <section>
        <p className="eyebrow">SERVICES</p><h2>Available now</h2>
        <div className="service-grid">
          {services.map((item) => <article key={item.id}><b>{item.name}</b><p>{item.description}</p><strong>K{Number(item.price ?? 0).toFixed(2)}</strong><button onClick={() => go(`/service/${item.id}`)}>View service</button></article>)}
        </div>
      </section>
      <section>
        <p className="eyebrow">UPDATES</p><h2>Latest updates</h2>
        <div className="update-grid">
          {posts.map((item) => <article key={item.id}>{item.image_url && <img src={item.image_url} alt="" />}<div><h3>{item.title}</h3><p>{item.description}</p></div></article>)}
        </div>
      </section>
      <section className="contact" id="contact"><div><p className="eyebrow">CONTACT</p><h2>We are here to help.</h2><p>Email: {contact.email}</p><p>Phone: {contact.phone}</p><p>WhatsApp: {contact.whatsapp}</p></div></section>
    </main>
  </>;
}

function Header({ services, go }) {
  const [open, setOpen] = useState(false);
  return <header><a className="brand" href="/" onClick={(event) => { event.preventDefault(); go('/'); }}><img src="/alessandro-enterprises-logo.png" alt="" /><span>ALESSANDRO</span></a><nav>
    <button onClick={() => go('/about')}>About</button><button onClick={() => go('/articles')}>Articles</button><button onClick={() => go('/events')}>Events</button><button onClick={() => go('/moments')}>Moments</button>
    <div className="services-menu"><button onClick={() => setOpen(!open)}>Services ▾</button>{open && <div>{services.map((item) => <button key={item.id} onClick={() => { setOpen(false); go(`/service/${item.id}`); }}>{item.name}</button>)}</div>}</div>
    <a className="portal" href={portalUrl}>Customer portal</a>
  </nav></header>;
}

function ContentPage({ section, pages, services, go }) {
  const contentType = section === 'articles' ? 'article' : section === 'events' ? 'event' : section === 'moments' ? 'moment' : 'about';
  const rows = pages.filter((item) => item.content_type === contentType);
  return <><Header services={services} go={go} /><main className="public-page"><button className="back" onClick={() => go('/')}>← Home</button><h1>{section[0].toUpperCase() + section.slice(1)}</h1>{rows.map((item) => <article className="public-content-card" key={item.id}>{item.image_url && <img src={item.image_url} alt="" />}<div><h2>{item.title}</h2><p>{item.summary}</p>{(item.body ?? '').split('\n').map((line, index) => <p key={index}>{line || ' '}</p>)}</div></article>)}{!rows.length && <p className="empty-page">No published content yet.</p>}</main></>;
}

function ServicePage({ id, services, contact, go }) {
  const [photos, setPhotos] = useState([]);
  const service = services.find((item) => item.id === id);
  useEffect(() => { void supabase.from('service_gallery').select('*').eq('service_id', id).order('sort_order').then(({ data }) => setPhotos(data ?? [])); }, [id]);
  if (!service) return <><Header services={services} go={go} /><main className="public-page">Loading service...</main></>;
  return <><Header services={services} go={go} /><main className="public-page"><button className="back" onClick={() => go('/')}>← All services</button><h1>{service.name}</h1><p>{service.long_description || service.description}</p><strong>K{Number(service.price ?? 0).toFixed(2)}</strong><div className="public-service-gallery">{photos.map((item) => <figure key={item.id}><img src={item.image_url} alt={item.caption || service.name} /><figcaption>{item.caption}</figcaption></figure>)}{[0, 1, 2].slice(photos.length).map((number) => <figure className="gallery-placeholder" key={number}>Service image {photos.length + number + 1}</figure>)}</div><div className="service-links"><a className="gold-button" href={`${portalUrl}/book`}>Book Service</a><a href={`tel:${contact.phone}`}>Call</a><a href={`mailto:${contact.email}`}>Email</a><a href={`https://wa.me/${String(contact.whatsapp).replace(/\D/g, '').replace(/^0/, '260')}`}>WhatsApp</a></div></main></>;
}
