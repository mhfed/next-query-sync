import ClientExample from './client-example';

export default function Page() {
  return (
    <main>
      <h1>next-query-sync integration fixture</h1>
      <p>This page is server-rendered and embeds a client component that consumes the packed library.</p>
      <ClientExample />
    </main>
  );
}
