import Layout from './Layout';

function ModulePlaceholder({ title, module }) {
  return (
    <Layout>
      <div className="container-fluid projectAccounting" style={{ padding: '24px' }}>
        <div className="leave-card" style={{ padding: '24px' }}>
          <h2 className="page-title">{title}</h2>
          <p style={{ marginTop: '12px', color: '#555' }}>
            {module} — this page is ready for implementation.
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default ModulePlaceholder;
