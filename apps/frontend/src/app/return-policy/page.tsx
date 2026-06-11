
export default function ReturnPolicy() {
  return (
    <>
            <div className="pt-32 pb-24 min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">Return & Refund Policy</h1>
        <div className="prose prose-invert prose-blue max-w-none text-gray-300 space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl text-white font-semibold mt-8 mb-4">1. Hosting Services Refund</h2>
          <p>We offer a standard 30-day money-back guarantee for shared hosting and premium WordPress hosting plans. If you are not satisfied within the first 30 days, you can request a full refund, excluding any domain registration fees or setup fees.</p>
          
          <h2 className="text-2xl text-white font-semibold mt-8 mb-4">2. Digital Services & Development</h2>
          <p>For custom web development, digital marketing, or other specialized services, refunds are handled on a case-by-case basis as detailed in the individual service contract or proposal.</p>
          
          <h2 className="text-2xl text-white font-semibold mt-8 mb-4">3. Domain Names</h2>
          <p>Domain name registrations and transfers are non-refundable once the domain has been successfully registered or initiated.</p>

          <h2 className="text-2xl text-white font-semibold mt-8 mb-4">4. Process for Refunds</h2>
          <p>To request a refund, please open a support ticket from your billing portal or contact us directly at support@digitaltechsouls.com. Please allow 5-7 business days for the refund to process to your original payment method.</p>
        </div>
      </div>
    </div>
    </>
  );
}
