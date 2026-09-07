import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#d97706', fontSize: '2.5rem', marginBottom: '20px' }}>VedicNeev Live Landing Page</h1>
      <p style={{ fontSize: '1.2rem', color: '#4b5563', lineHeight: '1.6' }}>
        India&apos;s premier digital foundation platform for government boarding school entrance examinations (JNVST, AISSEE, RMS)[cite: 1].
      </p>
      <div style={{ marginTop: '30px' }}>
        <Link href="/sprints" style={{ background: '#d97706', color: '#fff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
          Explore Sunday Sprints &amp; Mock Tests
        </Link>
      </div>
    </div>
  );
}
