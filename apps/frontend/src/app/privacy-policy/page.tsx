
export default function PrivacyPolicy() {
  return (
    <>
            <div className="pt-32 pb-24 min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">Privacy Policy</h1>
        <div className="prose prose-invert prose-blue max-w-none text-gray-300 space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl text-white font-semibold mt-8 mb-4">1. Information We Collect</h2>
          <p>At Digital Tech Souls, we collect information that you provide directly to us when you register for an account, use our hosting or digital services, or communicate with us.</p>
          
          <h2 className="text-2xl text-white font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services. This includes processing transactions, sending technical notices, and providing customer support.</p>
          
          <h2 className="text-2xl text-white font-semibold mt-8 mb-4">3. Data Security</h2>
          <p>We implement reasonable security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

          <h2 className="text-2xl text-white font-semibold mt-8 mb-4">4. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at support@digitaltechsouls.com.</p>
        </div>
      </div>
    </div>
    </>
  );
}
