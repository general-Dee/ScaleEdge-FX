/*
  DRAFT — starting point for legal counsel to review before relying on this in
  production, not a substitute for legal advice. Intended to be NDPR-aware given
  this platform's schema anticipates collecting BVN/NIN for identity verification.
*/
export default function Privacy() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white rounded shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold">Privacy Policy</h1>
        <p className="text-sm text-gray-500">Last updated: this is a draft and has not yet been reviewed by legal counsel.</p>

        <section>
          <h2 className="font-semibold mt-4">1. Information We Collect</h2>
          <p>When you register, we collect your phone number, full name, and a securely hashed password. If identity verification is enabled for your account tier, we may also collect your Bank Verification Number (BVN) and/or National Identification Number (NIN).</p>
        </section>

        <section>
          <h2 className="font-semibold mt-4">2. Why We Collect It</h2>
          <p>We use this information to create and secure your account, process buy/sell orders, enforce transaction limits, and comply with applicable Nigerian financial regulations, including anti-money-laundering (AML) and know-your-customer (KYC) obligations where applicable.</p>
        </section>

        <section>
          <h2 className="font-semibold mt-4">3. BVN and NIN</h2>
          <p>BVN and NIN are highly sensitive personal identifiers. They are collected only where required for identity verification, stored securely, and are not shared with third parties except as required to complete verification (e.g. with a licensed identity verification provider) or as required by law.</p>
        </section>

        <section>
          <h2 className="font-semibold mt-4">4. Your Rights (NDPR)</h2>
          <p>Under the Nigeria Data Protection Regulation (NDPR), you have the right to access the personal data we hold about you, request correction of inaccurate data, request deletion of your data (subject to our regulatory record-keeping obligations), and withdraw consent where processing is based on consent.</p>
        </section>

        <section>
          <h2 className="font-semibold mt-4">5. Data Retention</h2>
          <p>We retain account and transaction data for as long as your account is active and for a period afterward as required to meet regulatory and audit obligations.</p>
        </section>

        <section>
          <h2 className="font-semibold mt-4">6. Data Security</h2>
          <p>Passwords are stored using industry-standard hashing. Access to sensitive identity data is restricted to systems and personnel that need it to operate the platform.</p>
        </section>

        <section>
          <h2 className="font-semibold mt-4">7. Contact</h2>
          <p>To exercise your data rights or ask questions about this policy, contact the platform administrators.</p>
        </section>

        <a href="/" className="inline-block mt-6 text-blue-600 hover:underline">&larr; Back to home</a>
      </div>
    </main>
  );
}
