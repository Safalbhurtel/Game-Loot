export function LegalPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-12">
      <h1 className="text-4xl font-heading font-bold text-on-surface mb-8">Legal & Policy</h1>
      
      <div className="prose prose-invert max-w-none text-on-surface-variant leading-relaxed space-y-8">
        <section>
          <h2 className="text-2xl font-bold font-heading text-on-surface mb-4">Terms of Service</h2>
          <p>By accessing GameLoot Nepal, you agree to be bound by these Terms of Service. GameLoot Nepal is a comparison platform and is not responsible for the direct fulfillment of products. All transactions are completed on third-party seller platforms.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold font-heading text-on-surface mb-4">Privacy Policy</h2>
          <p>We respect your privacy. We act as a discovery engine and only collect information necessary to improve your comparison experience (such as anonymized analytics and Deal Alerts if you opt-in). We do not sell your personal data to third parties.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold font-heading text-on-surface mb-4">Platform Disclaimer</h2>
          <p>GameLoot Nepal does not host, generate, or directly sell the keys or subscriptions listed. Trademarks, brand names, and product images used on this site are the property of their respective owners. We are an independent service that aggregates public listings for consumer convenience.</p>
        </section>
      </div>
    </div>
  );
}
