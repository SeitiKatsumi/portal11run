type AdminDataNoticeProps = {
  errors: string[];
};

export function AdminDataNotice({ errors }: AdminDataNoticeProps) {
  if (!errors.length) return null;

  return (
    <section className="admin-data-notice" role="status" aria-live="polite">
      <strong>Alguns dados do admin não carregaram.</strong>
      <p>A página foi aberta em modo seguro para evitar erro 500. Revise os itens abaixo e tente recarregar.</p>
      <ul>
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </section>
  );
}
