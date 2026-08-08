/*
  DRAFT — starting point for legal counsel to review before relying on this in
  production, not a substitute for legal advice. Written for a P2P USD/NGN
  order-matching platform; update as features (escrow, payments, KYC) ship.
*/
export default function Terms() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white rounded shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold">Terms of Service</h1>
        <p className="text-sm text-gray-500">Last updated: this is a draft and has not yet been reviewed by legal counsel.</p>

        <section>
          <h2 className="font-semibold mt-4">1. What Scale-Edge FX Is</h2>
          <p>Scale-Edge FX is a platform that lets users post buy and sell orders for USD against Nigerian Naira (NGN), which are matched with other users. Scale-Edge FX does not itself guarantee settlement between matched parties unless and until an escrow feature is explicitly enabled.</p>
        </section>

        <section>
          <h2 className="font-semibold mt-4">2. Eligibility</h2>
          <p>You must be at least 18 years old and legally able to enter into binding agreements to use this service. You are responsible for ensuring your use of this service complies with applicable Nigerian law.</p>
        </section>

        <section>
          <h2 className="font-semibold mt-4">3. Account Registration</h2>
          <p>You must provide accurate information when registering, including a valid phone number. You are responsible for maintaining the confidentiality of your account credentials.</p>
        </section>

        <section>
          <h2 className="font-semibold mt-4">4. Orders and Matching</h2>
          <p>Orders placed on the platform are not final transactions. An administrator may match a BUY order with a SELL order; the parties involved are responsible for arranging and confirming settlement unless a platform-managed escrow flow is in place for your order.</p>
        </section>

        <section>
          <h2 className="font-semibold mt-4">5. Identity Verification</h2>
          <p>Higher transaction limits may require identity verification, which can include your Bank Verification Number (BVN) or National Identification Number (NIN). See our <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a> for how this data is handled.</p>
        </section>

        <section>
          <h2 className="font-semibold mt-4">6. Prohibited Use</h2>
          <p>You may not use the platform for money laundering, fraud, or any unlawful purpose. Scale-Edge FX reserves the right to suspend or terminate accounts suspected of violating these terms.</p>
        </section>

        <section>
          <h2 className="font-semibold mt-4">7. Changes to These Terms</h2>
          <p>These terms may be updated as the platform evolves. Continued use of the service after changes constitutes acceptance of the updated terms.</p>
        </section>

        <section>
          <h2 className="font-semibold mt-4">8. Contact</h2>
          <p>Questions about these terms can be directed to the platform administrators.</p>
        </section>

        <a href="/" className="inline-block mt-6 text-blue-600 hover:underline">&larr; Back to home</a>
      </div>
    </main>
  );
}
