
export default function TermsOfService() {
  return (
    <>
            <div className="pt-32 pb-24 min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">Terms of Service</h1>
        <div className="prose prose-invert prose-blue max-w-none text-gray-300 space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl text-white font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>By accessing and using the services provided by Digital Tech Souls, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
          
          <h2 className="text-2xl text-white font-semibold mt-8 mb-4">2. Description of Service</h2>
          <p>Digital Tech Souls provides web hosting, web development, digital marketing, graphic design, and domain registration services. We reserve the right to modify, suspend, or discontinue any part of the service at any time.</p>
          
          <h2 className="text-2xl text-white font-semibold mt-8 mb-4">3. User Responsibilities</h2>
          <p>You are responsible for maintaining the security of your account and passwords. You agree not to use our services for any illegal or unauthorized purpose, including but not limited to hosting malicious content, spamming, or violating intellectual property rights.</p>

          <h2 className="text-2xl text-white font-semibold mt-8 mb-4">4. Payment and Billing</h2>
          <p>All services are billed on a recurring basis as per your selected plan. Failure to pay may result in the suspension or termination of your services. We reserve the right to change our pricing with 30 days prior notice.</p>
          
          <h2 className="text-2xl text-white font-semibold mt-8 mb-4">5. Contact Information</h2>
          <p>For any questions regarding these Terms of Service, please contact us at support@digitaltechsouls.com.</p>
        </div>
      </div>
    </div>
    </>
  );
}
