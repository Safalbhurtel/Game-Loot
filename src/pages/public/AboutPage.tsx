export function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-12">
      <h1 className="text-4xl font-heading font-bold text-on-surface text-center mb-12">About GameLoot Nepal</h1>
      
      <div className="prose prose-invert max-w-none text-on-surface-variant leading-relaxed space-y-6">
        <p className="text-lg">
          Welcome to GameLoot Nepal, the nation's premier digital products comparison platform. Founded with the vision of bringing transparency and security to the digital marketplace in Nepal, we help users discover the best deals for game codes, gift cards, subscriptions, and software.
        </p>
        <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20 my-8">
          <h3 className="font-heading font-bold text-xl text-on-surface mb-2">Our Mission</h3>
          <p>
            To empower Nepali consumers by providing a safe, transparent, and easy-to-use platform to compare digital product prices from verified local sellers, ensuring everyone gets the best value and instant delivery without friction.
          </p>
        </div>
        <p>
          We are not a store ourselves. Think of us as your intelligent shopping assistant. We aggregate listings from top independent sellers and verified businesses across Nepal, putting all their prices, delivery times, and trust ratings side-by-side.
        </p>
        <p>
          Instead of messaging multiple pages on social media to find the price of a gift card, you can simply search here, find the best deal, and redirect to a verified seller's payment portal—many of which support local wallets like eSewa, Khalti, and direct bank transfers.
        </p>
      </div>
    </div>
  );
}
